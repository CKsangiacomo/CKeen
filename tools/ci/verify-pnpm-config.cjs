/* tools/ci/verify-pnpm-config.cjs */
const fs = require('fs');
const path = require('path');

const roots = ['apps/site','services/embed','dieter'];
const bad = [];
for (const p of roots) {
  for (const f of ['.npmrc','pnpm-lock.yaml']) {
    const fp = path.join(p, f);
    if (fs.existsSync(fp)) bad.push(fp);
  }
}
if (bad.length) {
  console.error('[verify-pnpm-config] Remove nested files:', bad.join(', '));
  process.exit(1);
}
console.log('[verify-pnpm-config] OK: no nested .npmrc or lockfiles');


