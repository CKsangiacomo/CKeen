const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '../dieter/icons/svg');

let bad = [];
for (const file of fs.readdirSync(dir)) {
  if (!file.endsWith('.svg')) continue;
  const c = fs.readFileSync(path.join(dir, file), 'utf8');
  if (/#|rgb\(/i.test(c) && /fill="/.test(c)) bad.push(file);
}
if (bad.length) {
  console.error('Found hardcoded color fills:', bad.slice(0, 20));
  process.exit(1);
}
console.log('SVG verification OK: no hardcoded color fills');


