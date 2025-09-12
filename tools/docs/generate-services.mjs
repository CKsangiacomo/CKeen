#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

/** Clickeen standard: documentation/ is the single source of truth.
 * Operates ONLY under documentation/. If required subpaths are missing,
 * exit(0) to avoid blocking unrelated PRs. */
const base = path.join("documentation");
const systemsCore = path.join(base, "systems", "core");

if (!fs.existsSync(base)) {
  console.log("[docs] documentation/ not present — skipping.");
  process.exit(0);
}
if (!fs.existsSync(systemsCore)) {
  console.log("[docs] documentation/systems/core not present — skipping.");
  process.exit(0);
}

const items = fs.readdirSync(systemsCore, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

const outFile = path.join(base, "SERVICES_INDEX.md");
const content = `# Services Index\n\n${items.map((n) => `- ${n}`).join("\n")}\n`;
fs.writeFileSync(outFile, content);
console.log(`[docs] Wrote ${outFile}`);
