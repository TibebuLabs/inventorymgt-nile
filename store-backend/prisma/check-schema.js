const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  try {
    const rows = await p.$queryRawUnsafe(
      `select table_name from information_schema.tables where table_schema='public' and table_name in ('vendors','audit_logs') order by table_name`,
    );
    console.log('TABLES:', JSON.stringify(rows));

    const cols = await p.$queryRawUnsafe(
      `select table_name, column_name from information_schema.columns where table_schema='public' and ((table_name='grns' and column_name in ('status','vendor_id','posted_at')) or (table_name='srns' and column_name in ('status','requested_by_id')) or (table_name='stock_ins' and column_name='created_at')) order by table_name, column_name`,
    );
    console.log('COLS:', JSON.stringify(cols));
  } catch (e) {
    console.error('ERR', e.message);
  } finally {
    await p.$disconnect();
    process.exit(0);
  }
})();
