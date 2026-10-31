const fs = require('fs');
const path = require('path');

const files = [
  'src/approvement/approvement.module.ts',
  'src/department/department.module.ts',
  'src/employee/employee.module.ts',
  'src/stock-out/stock-out.module.ts',
  'src/grnitem/grnitem.module.ts',
  'src/notfications/notfications.module.ts',
  'src/scc/scc.module.ts',
  'src/reference-scc/reference-scc.module.ts',
  'src/stock-balance/stock-balance.module.ts',
  'src/stock-in/stock-in.module.ts',
];

for (const relative of files) {
  const file = path.join(process.cwd(), relative);
  let source = fs.readFileSync(file, 'utf8');
  const before = source;

  source = source.replace(/^import \{ PrismaService \} from ['"]prisma\/prisma\.service['"];\r?\n/m, '');

  source = source.replace(/providers:\s*\[([^\]]*)\]/, (match, inner) => {
    const kept = inner
      .split(',')
      .map((token) => token.trim())
      .filter(Boolean)
      .filter((token) => !token.includes('PrismaService'));
    return `providers: [${kept.join(', ')}]`;
  });

  if (source !== before) {
    fs.writeFileSync(file, source, 'utf8');
    console.log('updated', relative);
  } else {
    console.log('unchanged', relative);
  }
}
