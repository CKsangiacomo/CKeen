#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

function findSvgFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findSvgFiles(fullPath));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.svg')) {
      results.push(fullPath);
    }
  }
  return results;
}

function isLikelyValidSvg(content) {
  const trimmed = content.trim();
  return trimmed.startsWith('<svg') && trimmed.includes('</svg>');
}

const iconDirs = [
  path.resolve('apps/app/public/dieter/icons'),
  path.resolve('public/dieter/icons')
];

let checked = 0;
for (const dir of iconDirs) {
  const files = findSvgFiles(dir);
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    if (!isLikelyValidSvg(content)) {
      console.error(`Invalid SVG content: ${file}`);
      process.exit(1);
    }
    checked += 1;
  }
}

console.log(`SVG verification OK (${checked} files checked)`);
