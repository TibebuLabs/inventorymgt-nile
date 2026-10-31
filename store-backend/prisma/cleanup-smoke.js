/**
 * One-off cleanup: removes the API smoke-test records created while
 * verifying the GRN / SRN / SIV create flows.
 *
 *   node prisma/cleanup-smoke.js
 */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const grns = await prisma.grn.findMany({
    where: { supplier: { in: ['Nile Test Suppliers'] } },
  });

  for (const grn of grns) {
    await prisma.grn.delete({ where: { id: grn.id } });
    if (grn.total_id) {
      await prisma.total.delete({ where: { id: grn.total_id } }).catch(() => {});
    }
    if (grn.approvment_id) {
      await prisma.approvement
        .delete({ where: { id: grn.approvment_id } })
        .catch(() => {});
    }
  }

  const srns = await prisma.srn.findMany({
    where: { requisition_work_unit: 'Finance Unit' },
  });
  for (const srn of srns) {
    await prisma.srn.delete({ where: { id: srn.id } });
    if (srn.approvment_id) {
      await prisma.approvement
        .delete({ where: { id: srn.approvment_id } })
        .catch(() => {});
    }
  }

  const sivs = await prisma.storeIssueVoucher.findMany({
    where: { issued_to: 'Finance Department' },
  });
  for (const siv of sivs) {
    await prisma.storeIssueVoucher.delete({ where: { id: siv.id } });
    if (siv.total_id) {
      await prisma.total.delete({ where: { id: siv.total_id } }).catch(() => {});
    }
  }

  console.log(
    `Cleaned up: ${grns.length} GRN(s), ${srns.length} SRN(s), ${sivs.length} SIV(s).`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
