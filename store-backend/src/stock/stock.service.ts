import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { AuditService } from 'src/audit/audit.service';

const TX_OPTIONS = { maxWait: 15_000, timeout: 45_000 };

const round2 = (value: number) => Math.round(value * 100) / 100;

export interface StockMoveOptions {
  sccId: number;
  itemName: string;
  quantity: number;
  unitPrice: number;
  unitMeasurementId: number;
  userId?: number | null;
  grnId?: number | null;
  date?: Date;
}

/**
 * Single source of truth for the physical stock ledger.
 *
 * Every increase/decrease writes a ReferanceScc row (the movement header) plus
 * the matching StockIn/StockOut row and a new StockBalance snapshot, all inside
 * the caller's transaction so a document can never be half-posted.
 */
@Injectable()
export class StockService {
  private readonly logger = new Logger(StockService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  // ── Reads ────────────────────────────────────────────────────────────────

  /** Current on-hand stock, one row per item/Stock Control Card. */
  async getBalances(search?: string) {
    const sccs = await this.prisma.scc.findMany({
      where: search
        ? { item: { contains: search, mode: 'insensitive' } }
        : undefined,
      orderBy: { item: 'asc' },
    });

    if (sccs.length === 0) return [];

    const [items, balances, locations] = await Promise.all([
      this.prisma.item.findMany({
        where: { name: { in: sccs.map((scc) => scc.item) } },
        include: { unit_measurement: true, type: true, location: true },
      }),
      this.prisma.stockBalance.findMany({
        where: {
          last_stock_balance: true,
          referance_scc: { scc_id: { in: sccs.map((scc) => scc.id) } },
        },
        include: { referance_scc: true },
        orderBy: { id: 'desc' },
      }),
      this.prisma.location.findMany(),
    ]);

    const itemByName = new Map(items.map((item) => [item.name, item]));
    const locationById = new Map(locations.map((loc) => [loc.id, loc]));

    // Keep only the newest balance per SCC (defensive: historical rows may
    // still carry the flag if a transaction was interrupted).
    const latestByScc = new Map<number, (typeof balances)[number]>();
    for (const balance of balances) {
      const sccId = balance.referance_scc.scc_id;
      const current = latestByScc.get(sccId);
      if (!current || current.id < balance.id) latestByScc.set(sccId, balance);
    }

    return sccs.map((scc) => {
      const balance = latestByScc.get(scc.id);
      const item = itemByName.get(scc.item);
      const location = item?.location_id ? locationById.get(item.location_id) : null;
      const quantity = balance?.quantity ?? 0;
      const unitPrice = balance?.unit_price ?? 0;
      const reorderLevel = Math.max(item?.reorder_level ?? 0, scc.min_stock_level);

      let status: 'out' | 'low' | 'ok' = 'ok';
      if (quantity <= 0) status = 'out';
      else if (reorderLevel > 0 && quantity <= reorderLevel) status = 'low';

      return {
        sccId: scc.id,
        itemId: item?.id ?? null,
        item: scc.item,
        type: item?.type?.type ?? '—',
        unit: item?.unit_measurement?.unit ?? '—',
        location: location
          ? `${location.name} (${location.aisle ?? ''}-${location.shelf ?? ''}-${location.bin ?? ''})`
          : scc.location_shelves_no || '—',
        locationName: location?.name ?? '—',
        aisle: location?.aisle ?? '—',
        shelf: location?.shelf ?? '—',
        bin: location?.bin ?? '—',
        category: location?.category ?? '—',
        quantity,
        unitPrice,
        totalValue: round2(quantity * unitPrice),
        minStockLevel: scc.min_stock_level,
        maxStockLevel: scc.max_stock_level,
        reorderLevel,
        status,
        updatedAt: balance?.createdAt ?? null,
      };
    });
  }

  /** Chronological in/out movements for the stock ledger screen. */
  async getMovements(limit = 100) {
    const take = Math.min(500, Math.max(1, Number(limit) || 100));

    const [inbound, outbound] = await Promise.all([
      this.prisma.stockIn.findMany({
        orderBy: { id: 'desc' },
        take,
        include: {
          referance_scc: {
            include: { scc: true, grn: { select: { id: true, supplier: true } } },
          },
        },
      }),
      this.prisma.stockOut.findMany({
        orderBy: { id: 'desc' },
        take,
        include: {
          referance_scc: {
            include: {
              scc: true,
              grn: { select: { id: true, supplier: true } },
            },
          },
        },
      }),
    ]);

    return [
      ...inbound.map((row) => ({
        id: `in-${row.id}`,
        direction: 'IN' as const,
        item: row.referance_scc.scc?.item ?? '—',
        quantity: row.quantity,
        unitPrice: row.unit_price,
        totalPrice: row.total_price,
        reference: row.referance_scc.grn
          ? `GRN #${row.referance_scc.grn.id}`
          : 'Stock receipt',
        supplier: row.referance_scc.grn?.supplier ?? null,
        createdAt: row.createdAt,
        createdBy: row.created_by_id,
      })),
      ...outbound.map((row) => ({
        id: `out-${row.id}`,
        direction: 'OUT' as const,
        item: row.referance_scc.scc?.item ?? '—',
        quantity: row.quantity,
        unitPrice: row.unit_price,
        totalPrice: row.total_price,
        reference: 'Stock issue',
        supplier: null,
        createdAt: row.createdAt,
        createdBy: row.created_by_id,
      })),
    ]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, take);
  }

  async getLowStock() {
    const balances = await this.getBalances();
    return balances
      .filter((row) => row.status !== 'ok')
      .sort((a, b) => a.quantity - b.quantity);
  }

  async getSummary() {
    const balances = await this.getBalances();
    return {
      totalItems: balances.length,
      totalUnits: balances.reduce((sum, row) => sum + row.quantity, 0),
      totalValue: round2(
        balances.reduce((sum, row) => sum + row.totalValue, 0),
      ),
      lowStock: balances.filter((row) => row.status === 'low').length,
      outOfStock: balances.filter((row) => row.status === 'out').length,
    };
  }

  getBalanceForItemName = async (
    tx: Prisma.TransactionClient,
    itemName: string,
  ) => {
    const scc = await tx.scc.findUnique({ where: { item: itemName } });
    if (!scc) return null;
    return this.currentBalance(tx, scc.id);
  };

  // ── Core ledger primitives (must be called inside a transaction) ─────────

  async ensureSccInTx(tx: Prisma.TransactionClient, itemName: string) {
    const existing = await tx.scc.findUnique({ where: { item: itemName } });
    if (existing) return existing;

    // Auto-provision a Stock Control Card the first time an item is received.
    return tx.scc.create({
      data: {
        item: itemName,
        location_shelves_no: '',
        min_stock_level: 0,
        max_stock_level: 0,
      },
    });
  }

  async currentBalance(tx: Prisma.TransactionClient, sccId: number) {
    return tx.stockBalance.findFirst({
      where: {
        last_stock_balance: true,
        referance_scc: { scc_id: sccId },
      },
      orderBy: { id: 'desc' },
    });
  }

  async increaseInTx(tx: Prisma.TransactionClient, options: StockMoveOptions) {
    const {
      sccId,
      quantity,
      unitPrice,
      unitMeasurementId,
      userId,
      grnId,
      date,
    } = options;

    if (quantity <= 0) {
      throw new BadRequestException('Received quantity must be greater than 0');
    }

    const reference = await tx.referanceScc.create({
      data: {
        scc_id: sccId,
        date: date ?? new Date(),
        grn_id: grnId ?? null,
        iv_id: null,
        unit_measurement_id: unitMeasurementId,
      },
    });

    await tx.stockIn.create({
      data: {
        ref_key: reference.id,
        quantity,
        unit_price: round2(unitPrice),
        total_price: round2(quantity * unitPrice),
        created_by_id: userId ?? null,
      },
    });

    const last = await this.currentBalance(tx, sccId);
    const previousQty = last?.quantity ?? 0;
    const previousPrice = last?.unit_price ?? unitPrice;
    const newQty = previousQty + quantity;

    // Weighted-average cost — keeps stock valuation meaningful.
    const averagePrice =
      newQty > 0
        ? (previousQty * previousPrice + quantity * unitPrice) / newQty
        : unitPrice;

    if (last) {
      await tx.stockBalance.update({
        where: { id: last.id },
        data: { last_stock_balance: false },
      });
    }

    return tx.stockBalance.create({
      data: {
        ref_key: reference.id,
        quantity: newQty,
        unit_price: round2(averagePrice),
        total_price: round2(newQty * averagePrice),
        last_stock_balance: true,
        created_by_id: userId ?? null,
      },
    });
  }

  async decreaseInTx(tx: Prisma.TransactionClient, options: StockMoveOptions) {
    const { sccId, itemName, quantity, unitMeasurementId, userId, date } =
      options;

    if (quantity <= 0) {
      throw new BadRequestException('Issued quantity must be greater than 0');
    }

    const last = await this.currentBalance(tx, sccId);
    const available = last?.quantity ?? 0;

    if (available < quantity) {
      throw new BadRequestException(
        `Insufficient stock for "${itemName}". Available: ${available}, requested: ${quantity}.`,
      );
    }

    const unitPrice = last?.unit_price ?? options.unitPrice ?? 0;
    const newQty = available - quantity;

    const reference = await tx.referanceScc.create({
      data: {
        scc_id: sccId,
        date: date ?? new Date(),
        grn_id: null,
        iv_id: null,
        unit_measurement_id: unitMeasurementId,
      },
    });

    await tx.stockOut.create({
      data: {
        ref_key: reference.id,
        quantity,
        unit_price: round2(unitPrice),
        total_price: round2(quantity * unitPrice),
        created_by_id: userId ?? null,
      },
    });

    await tx.stockBalance.update({
      where: { id: last!.id },
      data: { last_stock_balance: false },
    });

    return tx.stockBalance.create({
      data: {
        ref_key: reference.id,
        quantity: newQty,
        unit_price: round2(unitPrice),
        total_price: round2(newQty * unitPrice),
        last_stock_balance: true,
        created_by_id: userId ?? null,
      },
    });
  }

  // ── Document-level operations ───────────────────────────────────────────

  /**
   * Post a received GRN into stock. Idempotent: a GRN that already has
   * `posted_at` is returned untouched, so double-approval cannot inflate stock.
   */
  async postGrn(grnId: number, userId?: number) {
    return this.prisma.$transaction(async (tx) => {
      const grn = await tx.grn.findUnique({
        where: { id: grnId },
        include: { grn_items: { include: { item: true } } },
      });

      if (!grn) throw new NotFoundException(`GRN #${grnId} not found`);
      if (grn.posted_at) return grn;
      if (!grn.grn_items.length) {
        throw new BadRequestException('GRN has no items to post');
      }

      for (const line of grn.grn_items) {
        const scc = await this.ensureSccInTx(tx, line.item.name);
        await this.increaseInTx(tx, {
          sccId: scc.id,
          itemName: line.item.name,
          quantity: line.quantity_received,
          unitPrice: line.unit_price,
          unitMeasurementId: line.unit_measurement_id,
          userId,
          grnId: grn.id,
          date: grn.date,
        });
      }

      return tx.grn.update({
        where: { id: grnId },
        data: {
          status: 'approved',
          posted_at: new Date(),
          approved_by_id: userId ?? null,
          approved_at: new Date(),
        },
      });
    }, TX_OPTIONS);
  }

  /** Legacy direct issue of an approved SRN (no voucher). Idempotent. */
  async issueSrn(srnId: number, userId?: number) {
    return this.prisma.$transaction(async (tx) => {
      const srn = await tx.srn.findUnique({
        where: { id: srnId },
        include: { srn_items: true },
      });

      if (!srn) throw new NotFoundException(`SRN #${srnId} not found`);
      if (srn.status === 'fulfilled') {
        throw new ConflictException(`SRN #${srnId} has already been issued`);
      }
      if (!srn.srn_items.length) {
        throw new BadRequestException('SRN has no items to issue');
      }

      for (const line of srn.srn_items) {
        const scc = await this.ensureSccInTx(tx, line.description);
        await this.decreaseInTx(tx, {
          sccId: scc.id,
          itemName: line.description,
          quantity: line.quantity,
          unitPrice: 0,
          unitMeasurementId: line.unit_measurement_id,
          userId,
          date: srn.date,
        });
      }

      return tx.srn.update({
        where: { id: srnId },
        data: { status: 'fulfilled', fulfilled_at: new Date() },
      });
    }, TX_OPTIONS);
  }

  /** Manual stock adjustment (stocktake / damage / correction). */
  async adjust(
    input: {
      itemId?: number;
      item?: string;
      quantity: number;
      unitPrice?: number;
      reason: string;
    },
    userId?: number,
  ) {
    if (!input.reason?.trim()) {
      throw new BadRequestException('A reason is required for stock adjustments');
    }
    if (!input.quantity || !Number.isInteger(input.quantity)) {
      throw new BadRequestException('Quantity must be a non-zero integer');
    }

    const item = input.itemId
      ? await this.prisma.item.findUnique({
          where: { id: input.itemId },
          include: { unit_measurement: true },
        })
      : await this.prisma.item.findUnique({
          where: { name: input.item ?? '' },
          include: { unit_measurement: true },
        });

    if (!item) throw new NotFoundException('Item not found');

    const result = await this.prisma.$transaction(async (tx) => {
      const scc = await this.ensureSccInTx(tx, item.name);

      if (input.quantity > 0) {
        return this.increaseInTx(tx, {
          sccId: scc.id,
          itemName: item.name,
          quantity: input.quantity,
          unitPrice: input.unitPrice ?? 0,
          unitMeasurementId: item.unit_measurement_id,
          userId,
        });
      }

      return this.decreaseInTx(tx, {
        sccId: scc.id,
        itemName: item.name,
        quantity: Math.abs(input.quantity),
        unitPrice: input.unitPrice ?? 0,
        unitMeasurementId: item.unit_measurement_id,
        userId,
      });
    }, TX_OPTIONS);

    await this.audit.log({
      employee_id: userId ?? null,
      action: 'STOCK_ADJUST',
      entity: 'stock',
      entity_id: String(item.id),
      description: `Adjusted stock for "${item.name}" by ${
        input.quantity > 0 ? '+' : ''
      }${input.quantity} (${input.reason.trim()})`,
      metadata: {
        item: item.name,
        quantity: input.quantity,
        reason: input.reason.trim(),
        newBalance: result.quantity,
      },
    });

    return {
      message: 'Stock adjusted successfully',
      item: item.name,
      quantity: result.quantity,
    };
  }
}
