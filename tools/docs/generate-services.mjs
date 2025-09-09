#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('docs/systems');
const sections = [
  ['Core Systems', 'core'],
  ['Supporting Systems', 'supporting'],
];

let out = `# Clickeen Services (Generated)\n\n<!-- AUTO-GENERATED: do not edit; run node tools/docs/generate-services.mjs -->\n\n`;
for (const [title, dir] of sections) {
  const dirPath = path.join(root, dir);
  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.md')).sort();
  out += `## ${title}\n`;
  for (const f of files) {
    const p = path.join('systems', dir, f);
    const name = f.replace('.md','');
    const content = fs.readFileSync(path.join(dirPath, f),'utf8');
    const firstLine = (content.split('\n')[0] || '').replace(/^#\s*/, '');
    out += `- [${firstLine || name}](${p})\n`;
  }
  out += `\n`;
}
fs.writeFileSync('docs/SERVICES.generated.md', out);
console.log('Wrote docs/SERVICES.generated.md');
