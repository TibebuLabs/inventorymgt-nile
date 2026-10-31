/**
 * One-off codemod: add JWT + role guards to controllers that were left public.
 * Read endpoints stay available to every authenticated employee; write
 * endpoints are restricted to the roles that own that data.
 */
const fs = require('fs');
const path = require('path');

const TARGETS = [
  { file: 'src/grnitem/grnitem.controller.ts', write: ['admin', 'store-keeper'] },
  { file: 'src/item/item.controller.ts', write: ['admin', 'store-manager'] },
  { file: 'src/itemtype/itemtype.controller.ts', write: ['admin', 'store-manager'] },
  { file: 'src/reference-scc/reference-scc.controller.ts', write: ['admin'] },
  { file: 'src/srn-item/srn-item.controller.ts', write: ['admin', 'store-keeper'] },
  { file: 'src/stock-balance/stock-balance.controller.ts', write: ['admin'] },
  { file: 'src/stock-in/stock-in.controller.ts', write: ['admin'] },
  { file: 'src/stock-out/stock-out.controller.ts', write: ['admin'] },
  {
    file: 'src/store-issue-voucher-item/store-issue-voucher-item.controller.ts',
    write: ['admin', 'store-keeper'],
  },
  { file: 'src/unitmesurment/unitmesurment.controller.ts', write: ['admin', 'store-manager'] },
];

const IMPORTS = [
  "import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';",
  "import { RolesGuard } from 'src/auth/guards/roles.guard';",
  "import { Roles } from 'src/auth/decorators/roles.decorator';",
];

for (const target of TARGETS) {
  const file = path.join(process.cwd(), target.file);
  let source = fs.readFileSync(file, 'utf8');
  const original = source;
  const nl = source.includes('\r\n') ? '\r\n' : '\n';

  if (source.includes('JwtAuthGuard')) {
    console.log('skip (already guarded)', target.file);
    continue;
  }

  // 1. Insert imports just before the first decorator that starts the class.
  const anchor = source.indexOf('@ApiTags(') >= 0 ? '@ApiTags(' : '@Controller(';
  const anchorIndex = source.indexOf(anchor);
  if (anchorIndex < 0) {
    console.log('skip (no anchor)', target.file);
    continue;
  }
  source =
    source.slice(0, anchorIndex) +
    IMPORTS.join(nl) +
    nl +
    source.slice(anchorIndex);

  // 2. Class-level guard, placed directly above @Controller(...)
  const controllerMatch = /@Controller\(/.exec(source);
  if (!controllerMatch) {
    console.log('skip (no controller)', target.file);
    continue;
  }
  source =
    source.slice(0, controllerMatch.index) +
    '@UseGuards(JwtAuthGuard, RolesGuard)' +
    nl +
    source.slice(controllerMatch.index);

  // 3. `@UseGuards` must be imported from @nestjs/common.
  source = source.replace(
    /(import \{)([^}]*)\}(\s*from\s*'@nestjs\/common';)/,
    (match, open, names, rest) => {
      if (names.includes('UseGuards')) return match;
      const list = names
        .split(',')
        .map((n) => n.trim())
        .filter(Boolean);
      list.push('UseGuards');
      return `${open} ${list.join(', ')} }${rest}`;
    },
  );

  // 4. Restrict write verbs to the owning roles.
  const rolesDecorator = `@Roles(${target.write
    .map((role) => `'${role}'`)
    .join(', ')})`;
  source = source.replace(
    /^(\s*@)(Post|Put|Patch|Delete)\(\)/gm,
    (match, at, verb) => `${at}${verb}()${nl}${at}${rolesDecorator.slice(1)}`,
  );

  fs.writeFileSync(file, source, 'utf8');
  console.log('guarded', target.file, original !== source);
}
