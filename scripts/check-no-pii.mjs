import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const roots = ['services/api'];
const skipDirs = new Set(['node_modules','.git','.next','dist','build','.vercel','.turbo','out','coverage']);
const banned = [
  /\bx-forwarded-for\b/i,
  /\buser-agent\b/i,
  /\bnavigator\.userAgent\b/,
  /\bclientHints\b/i,
  /\bremoteAddress\b/i,
  /\breq\.ip\b/,
  /\brequest\.ip\b/,
  /\bipaddress\b/i
];

function walk(dir, files=[]) {
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    if (ent.isDirectory()) {
      if (!skipDirs.has(ent.name)) walk(join(dir, ent.name), files);
    } else if (ent.isFile()) {
      const p = join(dir, ent.name);
      if (!p.endsWith('.js') && !p.endsWith('.ts')) continue;
      files.push(p);
    }
  }
  return files;
}

let failed = false;
for (const root of roots) {
  for (const file of walk(root)) {
    const txt = readFileSync(file, 'utf8');
    const cleaned = txt.replace(/props_contains_pii/gi, '');
    for (const rx of banned) {
      if (rx.test(cleaned)) {
        console.error(`[NO-PII] Banned pattern ${rx} in ${file}`);
        failed = true;
        break;
      }
    }
  }
}
if (failed) process.exit(1);
console.log('[NO-PII] OK');


