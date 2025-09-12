#!/usr/bin/env node
const fs = require('fs');
const p = require('path');
const dir = p.join(__dirname, '..', '..', 'apps', 'app', 'public', 'dieter', 'icons', 'svg');
const acceptable = ['chevron-right-16.svg', 'chevron-right.svg'];
const found = acceptable.some(name => fs.existsSync(p.join(dir, name)));
if (!found) {
  console.error('[ERROR] Missing Dieter chevron-right icon after build. Expected one of:', acceptable.join(', '), 'in', dir);
  process.exit(1);
}
console.log('[OK] Dieter chevron-right icon present');

// Additional enforcement: reject size-suffixed filenames only for -16|-20|-24.svg
// Allow other numeric variants (e.g., -2.svg) that represent semantic variants.
const dietSvgDir = p.join(__dirname, '..', '..', 'dieter', 'icons', 'svg');
try {
  if (fs.existsSync(dietSvgDir)) {
    const entries = fs.readdirSync(dietSvgDir).filter(f => f.endsWith('.svg'));
    const prohibited = entries.filter(f => /(\-(16|20|24)\.svg)$/i.test(f));
    if (prohibited.length) {
      console.error('[ERROR] Prohibited size-suffixed icons detected (use tokens for sizing):');
      prohibited.forEach(f => console.error(' -', f));
      process.exit(1);
    }
  }
} catch (e) {
  console.error('[WARN] Icon suffix enforcement check encountered an error:', e && e.message ? e.message : e);
}

// Ensure Dieter component CSS is present (reject missing)
const compCssDir = p.join(__dirname, '..', '..', 'apps', 'app', 'public', 'dieter', 'components');
if (!fs.existsSync(compCssDir)) {
  console.error('[ERROR] Missing Dieter components CSS directory:', compCssDir);
  process.exit(1);
}
