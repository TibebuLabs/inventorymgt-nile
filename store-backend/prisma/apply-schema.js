/**
 * Idempotent schema migration.
 *
 * `prisma db push` hangs against the hosted Supabase pooler, so the additive
 * schema changes are applied with plain SQL instead. Safe to run repeatedly.
 */
const { PrismaClient } = require('@prisma/client');

// Skip if DATABASE_URL is not set or invalid (e.g., during initial Render build before env vars are configured)
const dbUrl = process.env.DATABASE_URL || '';
if (!dbUrl || !dbUrl.startsWith('postgres')) {
  console.log('DATABASE_URL not set or invalid — skipping schema migration. Set it in Render dashboard and redeploy.');
  process.exit(0);
}

const prisma = new PrismaClient();

const STATEMENTS = [
  // ── Vendor master data ────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS "vendors" (
     "id" SERIAL PRIMARY KEY,
     "name" TEXT NOT NULL,
     "contact_name" TEXT,
     "email" TEXT,
     "phone" TEXT,
     "address" TEXT,
     "tax_id" TEXT,
     "notes" TEXT,
     "is_active" BOOLEAN NOT NULL DEFAULT true,
     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
   )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "vendors_name_key" ON "vendors" ("name")`,

  // ── Audit trail ───────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS "audit_logs" (
     "id" SERIAL PRIMARY KEY,
     "employee_id" INTEGER,
     "employee_name" TEXT,
     "role" TEXT,
     "action" TEXT NOT NULL,
     "entity" TEXT NOT NULL,
     "entity_id" TEXT,
     "description" TEXT NOT NULL,
     "metadata" JSONB,
     "method" TEXT,
     "path" TEXT,
     "ip" TEXT,
     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
   )`,
  `CREATE INDEX IF NOT EXISTS "audit_logs_createdAt_idx" ON "audit_logs" ("createdAt")`,
  `CREATE INDEX IF NOT EXISTS "audit_logs_entity_entity_id_idx" ON "audit_logs" ("entity", "entity_id")`,
  `CREATE INDEX IF NOT EXISTS "audit_logs_employee_id_idx" ON "audit_logs" ("employee_id")`,

  // ── GRN workflow ──────────────────────────────────────────────────────
  `ALTER TABLE "grns" ADD COLUMN IF NOT EXISTS "vendor_id" INTEGER`,
  `ALTER TABLE "grns" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'pending'`,
  `ALTER TABLE "grns" ADD COLUMN IF NOT EXISTS "rejection_reason" TEXT`,
  `ALTER TABLE "grns" ADD COLUMN IF NOT EXISTS "created_by_id" INTEGER`,
  `ALTER TABLE "grns" ADD COLUMN IF NOT EXISTS "approved_by_id" INTEGER`,
  `ALTER TABLE "grns" ADD COLUMN IF NOT EXISTS "approved_at" TIMESTAMP(3)`,
  `ALTER TABLE "grns" ADD COLUMN IF NOT EXISTS "posted_at" TIMESTAMP(3)`,
  `CREATE INDEX IF NOT EXISTS "grns_status_idx" ON "grns" ("status")`,

  // ── SRN workflow ──────────────────────────────────────────────────────
  `ALTER TABLE "srns" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'pending'`,
  `ALTER TABLE "srns" ADD COLUMN IF NOT EXISTS "rejection_reason" TEXT`,
  `ALTER TABLE "srns" ADD COLUMN IF NOT EXISTS "requested_by_id" INTEGER`,
  `ALTER TABLE "srns" ADD COLUMN IF NOT EXISTS "approved_by_id" INTEGER`,
  `ALTER TABLE "srns" ADD COLUMN IF NOT EXISTS "approved_at" TIMESTAMP(3)`,
  `ALTER TABLE "srns" ADD COLUMN IF NOT EXISTS "fulfilled_at" TIMESTAMP(3)`,
  `CREATE INDEX IF NOT EXISTS "srns_status_idx" ON "srns" ("status")`,

  // ── Stock ledger timestamps / actors ──────────────────────────────────
  `ALTER TABLE "stock_ins" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP`,
  `ALTER TABLE "stock_ins" ADD COLUMN IF NOT EXISTS "created_by_id" INTEGER`,
  `ALTER TABLE "stock_outs" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP`,
  `ALTER TABLE "stock_outs" ADD COLUMN IF NOT EXISTS "created_by_id" INTEGER`,
  `ALTER TABLE "stock_balances" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP`,
  `ALTER TABLE "stock_balances" ADD COLUMN IF NOT EXISTS "created_by_id" INTEGER`,
  `CREATE INDEX IF NOT EXISTS "stock_balances_last_stock_balance_idx" ON "stock_balances" ("last_stock_balance")`,

  // ── Item master extras ────────────────────────────────────────────────
  `ALTER TABLE "items" ADD COLUMN IF NOT EXISTS "sku" TEXT`,
  `ALTER TABLE "items" ADD COLUMN IF NOT EXISTS "reorder_level" INTEGER NOT NULL DEFAULT 0`,

  // ── Location master data (aisle/shelf/bin/category for physical placement) ──
  `CREATE TABLE IF NOT EXISTS "locations" (
     "id" SERIAL PRIMARY KEY,
     "name" TEXT NOT NULL,
     "aisle" TEXT,
     "shelf" TEXT,
     "bin" TEXT,
     "category" TEXT,
     "description" TEXT,
     "is_active" BOOLEAN NOT NULL DEFAULT true,
     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
   )`,
  `CREATE INDEX IF NOT EXISTS "locations_category_idx" ON "locations" ("category")`,
  `CREATE INDEX IF NOT EXISTS "locations_aisle_idx" ON "locations" ("aisle")`,
  `CREATE INDEX IF NOT EXISTS "locations_is_active_idx" ON "locations" ("is_active")`,

  // Link Item to Location
  `ALTER TABLE "items" ADD COLUMN IF NOT EXISTS "location_id" INTEGER`,
  // (constraint added idempotently via FK_STATEMENTS below)
  // ── Store issue voucher workflow ──────────────────────────────────────
  `ALTER TABLE "store_issue_vouchers" ADD COLUMN IF NOT EXISTS "srn_id" INTEGER`,
  `ALTER TABLE "store_issue_vouchers" ADD COLUMN IF NOT EXISTS "issued_by_id" INTEGER`,
  `ALTER TABLE "store_issue_vouchers" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'issued'`,
  `CREATE INDEX IF NOT EXISTS "store_issue_vouchers_srn_id_idx" ON "store_issue_vouchers" ("srn_id")`,

  // ── Notifications ─────────────────────────────────────────────────────
  `ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "type" TEXT NOT NULL DEFAULT 'system'`,
  `ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "link" TEXT`,
  `CREATE INDEX IF NOT EXISTS "notifications_employee_id_read_idx" ON "notifications" ("employee_id", "read")`,
];

const FK_STATEMENTS = [
  {
    name: 'grns_vendor_id_fkey',
    sql: `ALTER TABLE "grns" ADD CONSTRAINT "grns_vendor_id_fkey"
          FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE`,
  },
  {
    name: 'items_location_id_fkey',
    sql: `ALTER TABLE "items" ADD CONSTRAINT "items_location_id_fkey"
          FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE`,
  },
];

async function columnExists(table, column) {
  const rows = await prisma.$queryRawUnsafe(
    `SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name=$1 AND column_name=$2`,
    table,
    column,
  );
  return rows.length > 0;
}

async function constraintExists(name) {
  const rows = await prisma.$queryRawUnsafe(
    `SELECT 1 FROM pg_constraint WHERE conname = $1`,
    name,
  );
  return rows.length > 0;
}

(async () => {
  try {
    // Detect pre-existing GRNs before adding the status column so legacy rows
    // (already posted to stock by the old flow) are not left as "pending".
    const preExisting = !(await columnExists('grns', 'status'));
    const legacyPending = preExisting
      ? Number(
          (
            await prisma.$queryRawUnsafe(
              `SELECT count(*)::int AS c FROM "grns"`,
            )
          )[0].c,
        )
      : 0;

    for (const sql of STATEMENTS) {
      await prisma.$executeRawUnsafe(sql);
    }

    for (const fk of FK_STATEMENTS) {
      if (!(await constraintExists(fk.name))) {
        await prisma.$executeRawUnsafe(fk.sql);
        console.log('added constraint', fk.name);
      }
    }

    if (legacyPending > 0) {
      await prisma.$executeRawUnsafe(
        `UPDATE "grns"
            SET "status" = 'approved',
                "posted_at" = COALESCE("posted_at", "createdAt")
          WHERE "status" = 'pending' AND "posted_at" IS NULL`,
      );
      console.log(`backfilled ${legacyPending} legacy GRN(s) as approved`);
    }

    // Legacy SRNs were handled manually before the approval workflow existed.
    await prisma.$executeRawUnsafe(
      `UPDATE "srns" SET "status" = 'approved'
        WHERE "status" = 'pending' AND "approvment_id" IS NOT NULL`,
    );

    // Give every existing item a reorder level so low-stock alerts work.
    await prisma.$executeRawUnsafe(
      `UPDATE "items" SET "reorder_level" = 5 WHERE "reorder_level" = 0`,
    );

    const tables = await prisma.$queryRawUnsafe(
      `SELECT table_name FROM information_schema.tables
        WHERE table_schema='public' AND table_name IN ('vendors','audit_logs')
        ORDER BY table_name`,
    );
    const cols = await prisma.$queryRawUnsafe(
      `SELECT table_name, column_name FROM information_schema.columns
        WHERE table_schema='public'
          AND ((table_name='grns'  AND column_name IN ('status','vendor_id','posted_at'))
            OR (table_name='srns'  AND column_name IN ('status','requested_by_id'))
            OR (table_name='stock_ins' AND column_name='createdAt')
            OR (table_name='items' AND column_name IN ('sku','reorder_level','location_id'))
            OR (table_name='locations' AND column_name IN ('name','aisle','shelf','bin','category','is_active')))
        ORDER BY table_name, column_name`,
    );

    console.log('TABLES:', JSON.stringify(tables));
    console.log('COLS:', JSON.stringify(cols));
    console.log('MIGRATION OK');
  } catch (error) {
    console.error('MIGRATION FAILED:', error.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
