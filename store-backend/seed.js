const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function run() {
  // Unit measurements
  const units = ['Piece','Box','Ream','Litre','Kilogram','Meter','Pack','Set'];
  for (const unit of units) {
    await prisma.unitMeasurement.upsert({ where:{unit}, update:{}, create:{unit} });
  }
  console.log('Units done');

  // Item types
  const types = ['Electronics','Stationery','Furniture','Consumables','Other'];
  for (const type of types) {
    await prisma.itemType.upsert({ where:{type}, update:{}, create:{type} });
  }
  console.log('Item types done');

  // Department
  const dept = await prisma.department.upsert({
    where: { id: 1 },
    update: {},
    create: { department_name: 'Head Office' }
  });
  console.log('Department id:', dept.id);

  // Admin user
  const hash = await bcrypt.hash('Admin@1234', 10);
  const emp = await prisma.employee.upsert({
    where: { email: 'admin@store.com' },
    update: {},
    create: {
      full_name: 'System Administrator',
      email: 'admin@store.com',
      password: hash,
      phone: '0911000000',
      role_id: 1,
      department_id: dept.id
    }
  });
  console.log('Admin created:', emp.email);
  console.log('');
  console.log('Login at: http://localhost:5173');
  console.log('Email   : admin@store.com');
  console.log('Password: Admin@1234');
}

run()
  .catch(e => { console.error('ERROR:', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
