const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

const since30 = new Date();
since30.setDate(since30.getDate() - 30);
const since7 = new Date();
since7.setDate(since7.getDate() - 7);
since7.setHours(0, 0, 0, 0);

const checks = {
  employees: () => p.employee.count(),
  departments: () => p.department.count(),
  items: () => p.item.count(),
  vendors: () => p.vendor.count({ where: { is_active: true } }),
  grns: () => p.grn.count(),
  srns: () => p.srn.count(),
  sivs: () => p.storeIssueVoucher.count(),
  pendingGrns: () => p.grn.count({ where: { status: 'pending' } }),
  pendingSrns: () => p.srn.count({ where: { status: 'pending' } }),
  approvedSrns: () => p.srn.count({ where: { status: 'approved' } }),
  recentGrns: () =>
    p.grn.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        total: true,
        vendor: { select: { id: true, name: true } },
        _count: { select: { grn_items: true } },
      },
    }),
  recentSrns: () =>
    p.srn.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { _count: { select: { srn_items: true } }, total: true },
    }),
  recentSivs: () =>
    p.storeIssueVoucher.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        total: true,
        _count: { select: { StoreIssueVoucherItem: true } },
      },
    }),
  recentLogs: () => p.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 8 }),
  inbound30: () =>
    p.stockIn.aggregate({
      _sum: { total_price: true, quantity: true },
      where: { createdAt: { gte: since30 } },
    }),
  outbound30: () =>
    p.stockOut.aggregate({
      _sum: { total_price: true, quantity: true },
      where: { createdAt: { gte: since30 } },
    }),
  inbound7: () =>
    p.stockIn.findMany({
      where: { createdAt: { gte: since7 } },
      select: { createdAt: true, quantity: true },
    }),
  outbound7: () =>
    p.stockOut.findMany({
      where: { createdAt: { gte: since7 } },
      select: { createdAt: true, quantity: true },
    }),
  fulfilledSrns: () => p.srn.count({ where: { status: 'fulfilled' } }),
  balances: () =>
    p.stockBalance.findMany({
      where: { last_stock_balance: true },
      include: { referance_scc: true },
      orderBy: { id: 'desc' },
    }),
};

(async () => {
  for (const [name, fn] of Object.entries(checks)) {
    try {
      await fn();
      console.log('OK  ', name);
    } catch (error) {
      console.log('FAIL', name, '->', error.message.split('\n').slice(0, 6).join(' | '));
    }
  }
  await p.$disconnect();
})();
