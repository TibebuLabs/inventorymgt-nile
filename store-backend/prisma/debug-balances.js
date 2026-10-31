const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

(async () => {
  try {
    const sccs = await p.scc.findMany({ orderBy: { item: 'asc' } });
    console.log('sccs', sccs.length, JSON.stringify(sccs).slice(0, 300));

    const [items, balances] = await Promise.all([
      p.item.findMany({
        where: { name: { in: sccs.map((s) => s.item) } },
        include: { unit_measurement: true, type: true },
      }),
      p.stockBalance.findMany({
        where: {
          last_stock_balance: true,
          referance_scc: { scc_id: { in: sccs.map((s) => s.id) } },
        },
        include: { referance_scc: true },
        orderBy: { id: 'desc' },
      }),
    ]);
    console.log('items', items.length, 'balances', balances.length);
    console.log('balance0', JSON.stringify(balances[0]).slice(0, 400));

    const rows = sccs.map((scc) => {
      const balance = balances.find((b) => b.referance_scc.scc_id === scc.id);
      const item = items.find((i) => i.name === scc.item);
      const quantity = balance?.quantity ?? 0;
      const reorderLevel = Math.max(item?.reorder_level ?? 0, scc.min_stock_level);
      let status = 'ok';
      if (quantity <= 0) status = 'out';
      else if (reorderLevel > 0 && quantity <= reorderLevel) status = 'low';
      return { item: scc.item, quantity, status, unitPrice: balance?.unit_price ?? 0 };
    });
    console.log('rows', JSON.stringify(rows));
    console.log('BALANCES OK');
  } catch (e) {
    console.log('FAIL', e.message);
  } finally {
    await p.$disconnect();
  }
})();
