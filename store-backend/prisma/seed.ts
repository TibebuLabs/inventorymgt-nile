/**
 * Prisma Seed Script
 * Creates the minimum data needed to log in:
 *   - Roles:       admin, store-manager, store-keeper, employee, department-head
 *   - Department:  Head Office
 *   - Admin user:  admin@store.com / Admin@1234
 */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ── 1. Roles ────────────────────────────────────────────────────────────────
  const roleNames = [
    'admin',
    'store-manager',
    'store-keeper',
    'employee',
    'department-head',
  ];

  for (const role of roleNames) {
    await prisma.role.upsert({
      where:  { role },
      update: {},
      create: { role },
    });
  }
  console.log('✅ Roles created:', roleNames.join(', '));

  // ── 2. Default department ───────────────────────────────────────────────────
  const department = await prisma.department.upsert({
    where:  { id: 1 },
    update: {},
    create: { department_name: 'Head Office' },
  });
  console.log('✅ Department created:', department.department_name);

  // ── 3. Admin user ───────────────────────────────────────────────────────────
  const adminRole = await prisma.role.findUnique({ where: { role: 'admin' } });
  if (!adminRole) throw new Error('Admin role not found');

  const hashedPassword = await bcrypt.hash('Admin@1234', 10);

  const admin = await prisma.employee.upsert({
    where:  { email: 'admin@store.com' },
    update: {},
    create: {
      full_name:     'System Administrator',
      email:         'admin@store.com',
      password:      hashedPassword,
      phone:         '0911000000',
      role_id:       adminRole.id,
      department_id: department.id,
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // ── 4. Item types ───────────────────────────────────────────────────────────
  const itemTypes = ['Electronics', 'Stationery', 'Furniture', 'Consumables', 'Other'];
  for (const type of itemTypes) {
    await prisma.itemType.upsert({
      where:  { type },
      update: {},
      create: { type },
    });
  }
  console.log('✅ Item types created:', itemTypes.join(', '));

  // ── 5. Unit measurements ────────────────────────────────────────────────────
  const units = ['Piece', 'Box', 'Ream', 'Litre', 'Kilogram', 'Meter', 'Pack', 'Set'];
  for (const unit of units) {
    await prisma.unitMeasurement.upsert({
      where:  { unit },
      update: {},
      create: { unit },
    });
  }
  console.log('✅ Unit measurements created:', units.join(', '));

  // ── 6. Inventory catalogue (items) ──────────────────────────────────────────
  // The full, realistic catalogue lives in prisma/seed-inventory.js so it can
  // be re-run on its own:  npm run seed:inventory
  console.log(
    'ℹ️  Run `npm run seed:inventory` to register the item catalogue.',
  );

  console.log('\n🎉 Seed complete!\n');
  console.log('─────────────────────────────────────');
  console.log('  Login URL : http://localhost:5173');
  console.log('  Email     : admin@store.com');
  console.log('  Password  : Admin@1234');
  console.log('  Role      : admin');
  console.log('─────────────────────────────────────\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
