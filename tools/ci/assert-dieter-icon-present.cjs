#!/usr/bin/env node
const fs = require('fs');
const p = require('path');
const target = p.join(__dirname, '..', '..', 'apps', 'app', 'public', 'dieter', 'icons', 'svg', 'chevron-right-16.svg');
if (!fs.existsSync(target)) {
  console.error(`[ERROR] Missing Dieter icon after build: ${target}`);
  process.exit(1);
}
console.log('[OK] Dieter icon present:', target);
