import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { StockService } from 'src/stock/stock.service';

/**
 * Aggregated dashboard payload.
 *
 * Queries run in small sequential batches on purpose: the hosted Supabase
 * pooler has a tiny per-client connection budget, and firing ~20 queries at
 * once exhausts it (pool timeout → HTTP 500).
 */
@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stock: StockService,
  ) {}

  async summary() {
    const since30 = new Date();
    since30.setDate(since30.getDate() - 30);

    const since7 = new Date();
    since7.setDate(since7.getDate() - 7);
    since7.setHours(0, 0, 0, 0);

    // ── Batch 1: counters (cheap, small) ─────────────────────────────────
    const counts = {
      employees: await this.prisma.employee.count(),
      departments: await this.prisma.department.count(),
      items: await this.prisma.item.count(),
      vendors: await this.prisma.vendor.count({ where: { is_active: true } }),
      grns: await this.prisma.grn.count(),
      srns: await this.prisma.srn.count(),
      sivs: await this.prisma.storeIssueVoucher.count(),
    };

    // ── Batch 2: workflow counters ───────────────────────────────────────
    const workflow = {
      pendingGrns: await this.prisma.grn.count({ where: { status: 'pending' } }),
      pendingSrns: await this.prisma.srn.count({ where: { status: 'pending' } }),
      approvedSrns: await this.prisma.srn.count({
        where: { status: 'approved' },
      }),
      fulfilledSrns: await this.prisma.srn.count({
        where: { status: 'fulfilled' },
      }),
    };

    // ── Batch 3: recent documents ────────────────────────────────────────
    const recentGrns = await this.prisma.grn.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        total: true,
        vendor: { select: { id: true, name: true } },
        _count: { select: { grn_items: true } },
      },
    });

    const recentSrns = await this.prisma.srn.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        _count: { select: { srn_items: true } },
        total: true,
      },
    });

    const recentSivs = await this.prisma.storeIssueVoucher.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        total: true,
        _count: { select: { StoreIssueVoucherItem: true } },
      },
    });

    const activity = await this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
    });

    // ── Batch 4: finance ─────────────────────────────────────────────────
    const inbound30 = await this.prisma.stockIn.aggregate({
      _sum: { total_price: true, quantity: true },
      where: { createdAt: { gte: since30 } },
    });

    const outbound30 = await this.prisma.stockOut.aggregate({
      _sum: { total_price: true, quantity: true },
      where: { createdAt: { gte: since30 } },
    });

    // ── Batch 5: 7-day trend ─────────────────────────────────────────────
    const inbound7 = await this.prisma.stockIn.findMany({
      where: { createdAt: { gte: since7 } },
      select: { createdAt: true, quantity: true },
    });

    const outbound7 = await this.prisma.stockOut.findMany({
      where: { createdAt: { gte: since7 } },
      select: { createdAt: true, quantity: true },
    });

    const stockSummary = await this.stock.getSummary();
    const lowStock = await this.stock.getLowStock();

    const trend = Array.from({ length: 7 }, (_, index) => {
      const day = new Date(since7);
      day.setDate(since7.getDate() + index);
      const key = day.toISOString().slice(0, 10);

      const sumFor = (rows: { createdAt: Date; quantity: number }[]) =>
        rows
          .filter((row) => row.createdAt.toISOString().slice(0, 10) === key)
          .reduce((sum, row) => sum + row.quantity, 0);

      return { date: key, in: sumFor(inbound7), out: sumFor(outbound7) };
    });

    return {
      counts,
      workflow,
      stock: stockSummary,
      finance: {
        receivedValue30d: inbound30._sum.total_price ?? 0,
        issuedValue30d: outbound30._sum.total_price ?? 0,
        receivedUnits30d: inbound30._sum.quantity ?? 0,
        issuedUnits30d: outbound30._sum.quantity ?? 0,
      },
      lowStock: lowStock.slice(0, 8),
      recent: { grns: recentGrns, srns: recentSrns, sivs: recentSivs, activity },
      trend,
    };
  }
}
