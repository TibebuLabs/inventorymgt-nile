/**
 * Nile Insurance — Inventory master data seed
 * --------------------------------------------
 * Idempotent: safe to run as many times as you like.
 *
 *   node prisma/seed-inventory.js
 *   npm run seed:inventory
 *
 * Creates the item types + units of measurement an insurance company store
 * actually needs, then registers a realistic catalogue of items so GRN, SIV
 * and SRN forms have real data to work with.
 */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// ── Reference data ───────────────────────────────────────────────────────────
const UNITS = [
  'Piece',
  'Box',
  'Ream',
  'Pack',
  'Set',
  'Litre',
  'Kilogram',
  'Meter',
  'Roll',
  'Bottle',
  'Carton',
  'Pair',
];

const ITEM_TYPES = [
  'Electronics',
  'Stationery',
  'Furniture',
  'Consumables',
  'Cleaning Supplies',
  'Safety & Security',
  'Other',
];

/** name → [typeName, unitName] */
const ITEMS = {
  // Electronics
  'Laptop Computer': ['Electronics', 'Piece'],
  'Desktop Computer': ['Electronics', 'Piece'],
  'Computer Monitor': ['Electronics', 'Piece'],
  'Laser Printer': ['Electronics', 'Piece'],
  'Document Scanner': ['Electronics', 'Piece'],
  'UPS Backup Unit': ['Electronics', 'Piece'],
  'Power Extension Cable': ['Electronics', 'Piece'],
  'Network Switch': ['Electronics', 'Piece'],
  'External Hard Drive': ['Electronics', 'Piece'],
  'Projector': ['Electronics', 'Piece'],
  'Toner Cartridge': ['Electronics', 'Piece'],
  'Keyboard': ['Electronics', 'Piece'],
  'Computer Mouse': ['Electronics', 'Piece'],

  // Stationery
  'A4 Copy Paper': ['Stationery', 'Ream'],
  'Ballpoint Pen': ['Stationery', 'Box'],
  'Pencil': ['Stationery', 'Box'],
  'Stapler': ['Stationery', 'Piece'],
  'Staple Pins': ['Stationery', 'Box'],
  'File Folder': ['Stationery', 'Pack'],
  'Box File': ['Stationery', 'Piece'],
  'Envelope (A4)': ['Stationery', 'Pack'],
  'Notebook': ['Stationery', 'Piece'],
  'Sticky Notes': ['Stationery', 'Pack'],
  'Whiteboard Marker': ['Stationery', 'Box'],

  // Furniture
  'Office Desk': ['Furniture', 'Piece'],
  'Office Chair': ['Furniture', 'Piece'],
  'Filing Cabinet': ['Furniture', 'Piece'],
  'Bookshelf': ['Furniture', 'Piece'],
  'Whiteboard': ['Furniture', 'Piece'],
  'Reception Sofa': ['Furniture', 'Piece'],

  // Consumables
  'Drinking Water': ['Consumables', 'Carton'],
  'Tea Leaves': ['Consumables', 'Kilogram'],
  'Coffee Beans': ['Consumables', 'Kilogram'],
  'Sugar': ['Consumables', 'Kilogram'],
  'Hand Sanitizer': ['Consumables', 'Litre'],
  'Face Mask': ['Consumables', 'Box'],
  'Paper Towel': ['Consumables', 'Roll'],

  // Cleaning supplies
  'Liquid Detergent': ['Cleaning Supplies', 'Litre'],
  'Dishwashing Liquid': ['Cleaning Supplies', 'Bottle'],
  'Toilet Paper': ['Cleaning Supplies', 'Pack'],
  'Floor Cleaner': ['Cleaning Supplies', 'Litre'],
  'Mop & Bucket Set': ['Cleaning Supplies', 'Set'],
  'Waste Bin': ['Cleaning Supplies', 'Piece'],

  // Safety & security
  'Fire Extinguisher': ['Safety & Security', 'Piece'],
  'First Aid Kit': ['Safety & Security', 'Set'],
  'Safety Gloves': ['Safety & Security', 'Pair'],
  'Safety Helmet': ['Safety & Security', 'Piece'],
  'Security Seal': ['Safety & Security', 'Pack'],

  // Other
  'Tool Kit': ['Safety & Security', 'Set'],
  'Battery (AA)': ['Other', 'Pack'],
  'Light Bulb': ['Other', 'Piece'],
};

async function main() {
  console.log('🌱 Seeding inventory master data...');

  // Ensure roles/admin still exist (delegated to the main seed) — this script
  // only deals with inventory reference data.

  // ── Units ──────────────────────────────────────────────────────────────────
  for (const unit of UNITS) {
    await prisma.unitMeasurement.upsert({
      where: { unit },
      update: {},
      create: { unit },
    });
  }
  console.log(`✅ Units of measurement ready (${UNITS.length})`);

  // ── Item types ─────────────────────────────────────────────────────────────
  for (const type of ITEM_TYPES) {
    await prisma.itemType.upsert({
      where: { type },
      update: {},
      create: { type },
    });
  }
  console.log(`✅ Item types ready (${ITEM_TYPES.length})`);

  // ── Items ──────────────────────────────────────────────────────────────────
  const units = await prisma.unitMeasurement.findMany();
  const types = await prisma.itemType.findMany();

  const unitByName = new Map(units.map((u) => [u.unit, u.id]));
  const typeByName = new Map(types.map((t) => [t.type, t.id]));

  let created = 0;

  for (const [name, [typeName, unitName]] of Object.entries(ITEMS)) {
    const typeId = typeByName.get(typeName);
    const unitId = unitByName.get(unitName);

    if (!typeId || !unitId) {
      console.warn(`⚠️  Skipping "${name}" — missing type "${typeName}" or unit "${unitName}"`);
      continue;
    }

    const existing = await prisma.item.findUnique({ where: { name } });

    await prisma.item.upsert({
      where: { name },
      update: { type_id: typeId, unit_measurement_id: unitId },
      create: { name, type_id: typeId, unit_measurement_id: unitId },
    });

    if (!existing) created += 1;
  }

  const total = await prisma.item.count();
  console.log(`✅ Items registered: ${created} new, ${total} total`);
  console.log('\n🎉 Inventory seed complete!\n');
}

main()
  .catch((e) => {
    console.error('❌ Inventory seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
