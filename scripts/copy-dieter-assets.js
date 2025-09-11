#!/usr/bin/env node
/*
 Cross-platform build-time copy of Dieter assets into apps/app/public/dieter.
 This replaces the symlink approach to ensure CI/Vercel reliability.
*/

const fs = require('node:fs');
const path = require('node:path');

function copyRecursiveSync(source, destination) {
  const stat = fs.statSync(source);
  if (stat.isDirectory()) {
    if (!fs.existsSync(destination)) {
      fs.mkdirSync(destination, { recursive: true });
    }
    for (const entry of fs.readdirSync(source)) {
      const src = path.join(source, entry);
      const dst = path.join(destination, entry);
      copyRecursiveSync(src, dst);
    }
  } else {
    fs.copyFileSync(source, destination);
  }
}

function main() {
  const src = path.resolve(__dirname, '..', 'dieter', 'dist');
  const dst = path.resolve(__dirname, '..', 'apps', 'app', 'public', 'dieter');

  if (!fs.existsSync(src)) {
    console.error(`[copy-dieter-assets] Source not found: ${src}. Did you run pnpm --filter @ck/dieter build?`);
    process.exit(1);
  }

  // Clean destination then copy
  fs.rmSync(dst, { recursive: true, force: true });
  fs.mkdirSync(dst, { recursive: true });
  copyRecursiveSync(src, dst);
  console.log(`[copy-dieter-assets] Copied assets from ${src} to ${dst}`);
}

main();


