import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateStoreIssueVoucherDto } from './dto/create-store-issue-voucher.dto';
import { UpdateStoreIssueVoucherDto } from './dto/update-store-issue-voucher.dto';
import { NotificationsGateway } from 'src/notfications/notfications.gateway';
import { NotificationsService } from 'src/notfications/notfications.service';
import { StockService } from 'src/stock/stock.service';
import { AuditService } from 'src/audit/audit.service';

interface Actor {
  id?: number;
  name?: string;
  role?: string;
}

const TX_OPTIONS = { maxWait: 15_000, timeout: 45_000 };
const round2 = (value: number) => Math.round(value * 100) / 100;

@Injectable()
export class StoreIssueVoucherService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsGateway: NotificationsGateway,
    private readonly notificationsService: NotificationsService,
    private readonly stock: StockService,
    private readonly audit: AuditService,
  ) {}

  /**
   * Issue stock against an approved requisition. Everything — voucher, lines,
   * stock-out movements, balances and the SRN status — happens in one
   * transaction so stock can never be half-issued.
   */
  async create(data: CreateStoreIssueVoucherDto, actor?: Actor) {
    const { siv_items, ...voucherData } = data;

    if (!siv_items || siv_items.length === 0) {
      throw new BadRequestException(
        'A Store Issue Voucher must contain at least one item.',
      );
    }

    try {
      const voucher = await this.prisma.$transaction(async (tx) => {
        if (voucherData.srn_id) {
          const srn = await tx.srn.findUnique({
            where: { id: voucherData.srn_id },
            select: { id: true, status: true, requested_by_id: true },
          });
          if (!srn) {
            throw new NotFoundException(
              `SRN #${voucherData.srn_id} not found`,
            );
          }
          if (srn.status === 'rejected') {
            throw new ConflictException(
              'A rejected requisition cannot be issued.',
            );
          }
          if (srn.status === 'fulfilled') {
            throw new ConflictException(
              'This requisition has already been issued.',
            );
          }
          if (srn.status !== 'approved') {
            throw new BadRequestException(
              'The requisition must be approved before stock can be issued.',
            );
          }
        }

        // Validate stock and price every line from the live ledger.
        const lines: Array<{
          description_id: number;
          unit_measurement_id: number;
          requested: number;
          issued: number;
          out_of_stock: number;
          unit_price: number;
          total_price: number;
          remark: string;
          sccId: number;
          itemName: string;
        }> = [];

        for (const item of siv_items) {
          const master = await tx.item.findUnique({
            where: { id: item.description_id },
            include: { unit_measurement: true },
          });
          if (!master) {
            throw new NotFoundException(
              `Item #${item.description_id} is not registered`,
            );
          }

          const scc = await this.stock.ensureSccInTx(tx, master.name);
          const balance = await this.stock.currentBalance(tx, scc.id);
          const available = balance?.quantity ?? 0;

          if (item.issued > 0 && available < item.issued) {
            throw new BadRequestException(
              `Insufficient stock for "${master.name}". Available: ${available}, requested: ${item.issued}.`,
            );
          }

          const unitPrice = balance?.unit_price ?? item.unit_price ?? 0;
          const outOfStock = Math.max(
            item.out_of_stock ?? 0,
            Math.max(0, item.requested - item.issued),
          );

          lines.push({
            description_id: master.id,
            unit_measurement_id:
              item.unit_measurement_id ?? master.unit_measurement_id,
            requested: item.requested,
            issued: item.issued,
            out_of_stock: outOfStock,
            unit_price: round2(unitPrice),
            total_price: round2(unitPrice * item.issued),
            remark: item.remark ?? '',
            sccId: scc.id,
            itemName: master.name,
          });
        }

        const totalPrice = round2(
          lines.reduce((sum, line) => sum + line.total_price, 0),
        );

        const total = await tx.total.create({
          data: { total_price: totalPrice },
        });

        const createdVoucher = await tx.storeIssueVoucher.create({
          data: {
            issued_to: voucherData.issued_to,
            store_req_no: voucherData.store_req_no,
            date: voucherData.date,
            total_id: total.id,
            srn_id: voucherData.srn_id ?? null,
            issued_by_id: actor?.id ?? null,
            status: 'issued',
          },
        });

        for (const line of lines) {
          await tx.storeIssueVoucherItem.create({
            data: {
              description_id: line.description_id,
              unit_measurement_id: line.unit_measurement_id,
              requested: line.requested,
              issued: line.issued,
              out_of_stock: line.out_of_stock,
              unit_price: line.unit_price,
              total_price: line.total_price,
              remark: line.remark,
              store_issue_key: createdVoucher.id,
            },
          });

          if (line.issued > 0) {
            await this.stock.decreaseInTx(tx, {
              sccId: line.sccId,
              itemName: line.itemName,
              quantity: line.issued,
              unitPrice: line.unit_price,
              unitMeasurementId: line.unit_measurement_id,
              userId: actor?.id,
              date: voucherData.date ?? new Date(),
            });
          }
        }

        if (voucherData.srn_id) {
          await tx.srn.update({
            where: { id: voucherData.srn_id },
            data: { status: 'fulfilled', fulfilled_at: new Date() },
          });
        }

        return tx.storeIssueVoucher.findUnique({
          where: { id: createdVoucher.id },
          include: {
            StoreIssueVoucherItem: { include: { description: true } },
            total: true,
          },
        });
      }, TX_OPTIONS);

      try {
        const storeTeam = await this.notificationsService.getEmployeeIdsByRoles(
          ['store-manager', 'admin'],
        );

        let requesterId: number | null = null;
        if (voucherData.srn_id) {
          const srn = await this.prisma.srn.findUnique({
            where: { id: voucherData.srn_id },
            select: { requested_by_id: true },
          });
          requesterId = srn?.requested_by_id ?? null;
        }

        await this.notificationsGateway.sendNotificationToEmployees(
          [...storeTeam, ...(requesterId ? [requesterId] : [])].filter(
            (employeeId) => employeeId !== actor?.id,
          ),
          `Stock issued to ${voucherData.issued_to} via voucher #${voucher?.id}.`,
          undefined,
          voucherData.srn_id,
          'siv',
          `/dashboard/store-issue-voucher/${voucher?.id}`,
        );

        await this.audit.log({
          employee_id: actor?.id ?? null,
          employee_name: actor?.name ?? null,
          role: actor?.role ?? null,
          action: 'SIV_ISSUE',
          entity: 'store-issue-voucher',
          entity_id: String(voucher?.id),
          description: `Issued stock to ${voucherData.issued_to} (voucher #${voucher?.id})`,
          metadata: {
            srnId: voucherData.srn_id ?? null,
            total: voucher?.total?.total_price ?? 0,
            lines: siv_items.length,
          },
        });
      } catch (notificationError) {
        console.error('SIV notification failed:', notificationError);
      }

      return voucher;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      console.error('SIV creation failed:', error);
      throw new InternalServerErrorException(
        'Failed to create store issue voucher.',
      );
    }
  }

  async findAll() {
    return this.prisma.storeIssueVoucher.findMany({
      include: {
        total: true,
        StoreIssueVoucherItem: {
          include: { description: true, unit_measurement: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const voucher = await this.prisma.storeIssueVoucher.findUnique({
      where: { id },
      include: {
        StoreIssueVoucherItem: {
          include: { description: true, unit_measurement: true },
        },
        total: true,
      },
    });

    if (!voucher) {
      throw new NotFoundException(`Store Issue Voucher with ID ${id} not found`);
    }
    return voucher;
  }

  async update(id: number, data: UpdateStoreIssueVoucherDto) {
    await this.findOne(id);
    return this.prisma.storeIssueVoucher.update({
      where: { id },
      data: {
        issued_to: data.issued_to,
        store_req_no: data.store_req_no,
        date: data.date,
      },
    });
  }

  /**
   * Cancel a voucher and return the issued quantities to stock (compensating
   * movements — the original ledger rows are never deleted).
   */
  async cancel(id: number, actor?: Actor) {
    const voucher = await this.findOne(id);
    if (voucher.status === 'cancelled') {
      throw new ConflictException('This voucher is already cancelled.');
    }

    await this.prisma.$transaction(async (tx) => {
      // Re-read the status *inside* the transaction so two concurrent cancel
      // requests cannot both return the stock to the ledger.
      const fresh = await tx.storeIssueVoucher.findUnique({
        where: { id },
        select: { status: true },
      });
      if (!fresh) {
        throw new NotFoundException(`Voucher #${id} not found`);
      }
      if (fresh.status === 'cancelled') {
        throw new ConflictException('This voucher is already cancelled.');
      }

      for (const line of voucher.StoreIssueVoucherItem) {
        if (line.issued <= 0) continue;
        const itemName = line.description?.name;
        if (!itemName) continue;

        const scc = await this.stock.ensureSccInTx(tx, itemName);
        await this.stock.increaseInTx(tx, {
          sccId: scc.id,
          itemName,
          quantity: line.issued,
          unitPrice: line.unit_price,
          unitMeasurementId: line.unit_measurement_id,
          userId: actor?.id,
        });
      }

      await tx.storeIssueVoucher.update({
        where: { id },
        data: { status: 'cancelled' },
      });

      if (voucher.srn_id) {
        await tx.srn.update({
          where: { id: voucher.srn_id },
          data: { status: 'approved', fulfilled_at: null },
        });
      }
    }, TX_OPTIONS);

    await this.audit.log({
      employee_id: actor?.id ?? null,
      employee_name: actor?.name ?? null,
      role: actor?.role ?? null,
      action: 'SIV_CANCEL',
      entity: 'store-issue-voucher',
      entity_id: String(id),
      description: `Cancelled voucher #${id} and returned stock`,
    });

    return this.findOne(id);
  }

  async remove(id: number, actor?: Actor) {
    return this.cancel(id, actor);
  }
}
