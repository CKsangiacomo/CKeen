const path = require("path");
const { createRequire } = require("module");

const rootDir = path.resolve(__dirname, "..");
const appPkg = path.join(rootDir, "apps", "app", "package.json");
const requireApp = createRequire(appPkg);

try {
  console.log("[verify] Resolving @ck/studio-shell from apps/app…");
  const resolved = requireApp.resolve("@ck/studio-shell");
  console.log("[verify] RESOLVED:", resolved);

  const m = requireApp("@ck/studio-shell");
  const keys = Object.keys(m);
  console.log("[verify] keys:", keys);
  console.log("[verify] default type:", typeof m.default);
  console.log("[verify] StudioShell type:", typeof m.StudioShell);

  if (typeof m.default !== "function" || typeof m.StudioShell !== "function") {
    throw new Error("Expected function exports: default and StudioShell");
  }
  console.log("[verify] OK");
} catch (err) {
  console.error("[verify] FAIL:", err && err.message ? err.message : err);
  process.exit(1);
} 