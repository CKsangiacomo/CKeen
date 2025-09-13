#!/usr/bin/env bash
set -euo pipefail

# Resolve repo root regardless of where the script is launched from
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "$ROOT"

echo "== 0) Repo root: $ROOT =="
echo "== 1) Ensure feature branch =="
git switch feat/studio-v0-shell >/dev/null 2>&1 || {
  echo "[FAIL] missing branch feat/studio-v0-shell"; exit 1; }

echo "== 2) Preconditions =="
test -f pnpm-workspace.yaml || { echo "[FAIL] pnpm-workspace.yaml missing"; exit 1; }
test -f tools/verify-studio-shell.cjs || { echo "[FAIL] tools/verify-studio-shell.cjs missing"; exit 1; }
test -f packages/studio-shell/tsconfig.json || { echo "[FAIL] packages/studio-shell/tsconfig.json missing"; exit 1; }

echo "== 3) Hard clean caches (deterministic) =="
rm -rf apps/app/.next .turbo node_modules/.cache \
       packages/studio-shell/dist \
       packages/*/node_modules || true

echo "== 4) Frozen install =="
pnpm install --frozen-lockfile

echo "== 5) Build Dieter (icons/assets) =="
pnpm --filter @ck/dieter build

echo "== 5.1) Verify Dieter assets copied to app public =="
if [[ ! -d "apps/app/public/dieter" ]]; then
  echo "[FAIL] Dieter assets not found in apps/app/public/dieter"; exit 2;
fi

echo "== 6) Build StudioShell (CJS) =="
pnpm --filter @ck/studio-shell build

echo "== 7) Consumer-context smoke (apps/app) =="
node tools/verify-studio-shell.cjs

echo "== 8) Build App (Next) =="
pnpm --filter @ck/app run build

echo "== OK == Stability gates passed (Dieter assets, StudioShell CJS build, smoke verify, App build)"
