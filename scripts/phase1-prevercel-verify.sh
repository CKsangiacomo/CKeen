#!/usr/bin/env bash
set -euo pipefail
RED=$'\e[31m'; GRN=$'\e[32m'; YLW=$'\e[33m'; BLU=$'\e[34m'; NC=$'\e[0m'
fail(){ echo "${RED}FAIL${NC} - $*"; exit 1; }
pass(){ echo "${GRN}PASS${NC} - $*"; }
note(){ echo "${YLW}NOTE${NC} - $*"; }
info(){ echo "${BLU}INFO${NC} - $*"; }

echo "== CLICKEEN | Phase-1 Pre-Vercel: Sync, Verify, Cleanup =="

# -----------------------------
# 0) Environment checks
# -----------------------------
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || fail "Not a git repo (run from repo root)."
test -f package.json || fail "Missing root package.json."
command -v node >/dev/null || fail "node not installed."
command -v pnpm >/dev/null || fail "pnpm not installed."
NODE_MAJ=$(node -p "process.versions.node.split('.')[0]")
[[ "$NODE_MAJ" == "20" ]] || note "Node major is $NODE_MAJ (Phase 1 pins Node 20)."
PM=$(node -p "try{require('./package.json').packageManager}catch(e){''}")
[[ "$PM" == pnpm@* ]] || fail "Root package.json:packageManager must be pnpm@x.y.z (found '$PM')."
pass "Toolchain: git/node/pnpm present; packageManager=$PM"

# -----------------------------
# 1) Git sync & cleanliness
# -----------------------------
git fetch --all --prune >/dev/null 2>&1 || fail "git fetch failed."
if ! git diff --quiet || ! git diff --cached --quiet; then
  fail "Working tree is not clean. Commit/stash changes before proceeding."
fi
pass "Working tree clean."

# Ensure 'main' exists and tracks origin/main
git show-ref --verify --quiet refs/heads/main || fail "Local branch 'main' not found."
git rev-parse --abbrev-ref --symbolic-full-name @{u} >/dev/null 2>&1 || fail "Current branch has no upstream. Ensure 'main' tracks 'origin/main'."

# Check we’re in sync with origin/main
git fetch origin main >/dev/null 2>&1
AHEAD=$(git rev-list --left-only --count main...origin/main)
BEHIND=$(git rev-list --right-only --count main...origin/main)
[[ "$AHEAD" == "0" && "$BEHIND" == "0" ]] && pass "Local 'main' is in sync with 'origin/main'." || note "Local main differs (ahead=$BEHIND, behind=$AHEAD). Consider: git pull --rebase origin main"

# Optional: assert merged PR count via gh if REQUIRED_MERGED_PRS is set
if command -v gh >/dev/null 2>&1; then
  info "Merged PRs into main (last 200):"
  gh pr list --state merged --base main --limit 200 | sed -e 's/^/  /' || true
  if [[ -n "${REQUIRED_MERGED_PRS:-}" ]]; then
    COUNT=$(gh pr list --state merged --base main --limit 200 | wc -l | tr -d ' ')
    [[ "$COUNT" -ge "$REQUIRED_MERGED_PRS" ]] || fail "Merged PRs=$COUNT < REQUIRED_MERGED_PRS=$REQUIRED_MERGED_PRS"
    pass "Merged PRs ($COUNT) >= REQUIRED_MERGED_PRS ($REQUIRED_MERGED_PRS)."
  fi
else
  note "gh CLI not found; merged PR checks skipped."
fi

# -----------------------------
# 2) Workspace SoT (pnpm)
# -----------------------------
WS=$(node -p "JSON.stringify(require('./package.json').workspaces||[])" 2>/dev/null || echo "[]")
node -e "const ws=$WS; const need=['apps/*','services/*','packages/*','infra/*']; if(!Array.isArray(ws)||!need.every(n=>ws.includes(n))) process.exit(1)" \
  || fail "Root workspaces in package.json must include: apps/*, services/*, packages/*, infra/*"
pass "Root workspaces include expected globs."

# pnpm requires pnpm-workspace.yaml; verify and auto-restore if APPLY_FIXES=1
if [[ ! -f pnpm-workspace.yaml ]]; then
  if [[ "${APPLY_FIXES:-0}" == "1" ]]; then
    cat > pnpm-workspace.yaml <<'YAML'
packages:
  - "apps/*"
  - "services/*"
  - "packages/*"
  - "infra/*"
YAML
    git add pnpm-workspace.yaml
    git commit -m "build: restore pnpm-workspace.yaml (SoT for pnpm workspaces)" >/dev/null 2>&1 || true
    pass "Restored pnpm-workspace.yaml from package.json workspaces."
  else
    fail "pnpm-workspace.yaml is missing. Re-run with APPLY_FIXES=1 to restore it."
  fi
else
  if ! grep -q 'apps/\*' pnpm-workspace.yaml || ! grep -q 'services/\*' pnpm-workspace.yaml \
     || ! grep -q 'packages/\*' pnpm-workspace.yaml || ! grep -q 'infra/\*' pnpm-workspace.yaml; then
    if [[ "${APPLY_FIXES:-0}" == "1" ]]; then
      cat > pnpm-workspace.yaml <<'YAML'
packages:
  - "apps/*"
  - "services/*"
  - "packages/*"
  - "infra/*"
YAML
      git add pnpm-workspace.yaml
      git commit -m "build: normalize pnpm-workspace.yaml to match package.json workspaces" >/dev/null 2>&1 || true
      pass "Normalized pnpm-workspace.yaml to match package.json."
    else
      fail "pnpm-workspace.yaml does not match package.json globs. Re-run with APPLY_FIXES=1 to normalize."
    fi
  else
    pass "pnpm-workspace.yaml present and matches expected globs."
  fi
fi

# -----------------------------
# 3) Install with frozen lockfile
# -----------------------------
pnpm install --frozen-lockfile >/dev/null || fail "pnpm install --frozen-lockfile failed (lock drift)."
pass "Dependencies installed with frozen lockfile."

# -----------------------------
# 4) Paris API integrity (services/api)
# -----------------------------
test -d services/api || fail "services/api workspace missing."
test -f services/api/package.json || fail "services/api/package.json missing."

# Engines node = 20.x
ENG=$(node -p "JSON.stringify(require('./services/api/package.json').engines||{})" 2>/dev/null || echo "{}")
node -e "const e=$ENG; if(!e.node||!/^20\.x$/.test(e.node)) process.exit(1)" \
  || fail "services/api engines.node must be \"20.x\" (found: $ENG)."
pass "services/api engines.node=20.x"

# Next/React versions
NEXT_V=$(node -p "require('./services/api/package.json').dependencies?.next || ''" 2>/dev/null || true)
[[ "$NEXT_V" =~ ^14\.2\.[0-9]+$|^14\.2\.x$ ]] || fail "services/api next must be 14.2.x (found: '$NEXT_V')."
REACT_V=$(node -p "require('./services/api/package.json').dependencies?.react || ''" 2>/dev/null || true)
[[ "$REACT_V" =~ ^18\.(2|3)\.[0-9]+$ ]] || fail "services/api react must be 18.2.x or 18.3.x (found: '$REACT_V')."
pass "services/api dep pins acceptable (next $NEXT_V, react $REACT_V)."

# Route export hygiene (no non-HTTP exports)
node - <<'NODE'
const fs = require('fs'); const path = require('path');
const ROOT = 'services/api/app/api';
const allowedCfg = new Set(['runtime','dynamic','revalidate','preferredRegion','maxDuration','fetchCache','experimental_ppr']);
const httpFns = new Set(['GET','POST','PUT','PATCH','DELETE','OPTIONS','HEAD']);
function walk(dir, acc=[]){ if(!fs.existsSync(dir)) return acc; for(const e of fs.readdirSync(dir,{withFileTypes:true})){ const p=path.join(dir,e.name); e.isDirectory()?walk(p,acc):e.isFile()&&e.name==='route.ts'&&acc.push(p);} return acc; }
function bad(file){ const s=fs.readFileSync(file,'utf8'); const errs=[];
  if (/\bexport\s*\{/.test(s)) errs.push('named re-export (export { ... })');
  const funcExp=[...s.matchAll(/\bexport\s+(?:async\s+)?function\s+([A-Za-z_][A-Za-z0-9_]*)/g)].map(m=>m[1]);
  for(const n of funcExp) if(!httpFns.has(n)) errs.push(`exported function '${n}' is not an HTTP handler`);
  const varExp=[...s.matchAll(/\bexport\s+(?:const|let|var)\s+([A-Za-z_][A-Za-z0-9_]*)/g)].map(m=>m[1]);
  for(const n of varExp) if(!allowedCfg.has(n)) errs.push(`exported binding '${n}' is not an allowed Next config export`);
  return errs;
}
const files=walk(ROOT);
if (!files.length) { console.error(`No route.ts files found under ${ROOT}`); process.exit(2); }
let b=0; for(const f of files){ const es=bad(f); if(es.length){ b++; console.error(`[INVALID EXPORTS] ${f}`); es.forEach(e=>console.error('  - '+e)); } }
process.exit(b?1:0)
NODE || fail "One or more Next.js routes export invalid symbols."
pass "Next.js route export rules satisfied."

# Build services/api only (fast sanity)
pnpm --filter ./services/api build >/dev/null || fail "services/api build failed."
pass "services/api builds."

# Healthz static content check (sha/env/deps)
node - <<'NODE'
const fs=require('fs'); const s=fs.readFileSync('services/api/app/api/healthz/route.ts','utf8');
const req=['deps','supabase','edgeConfig','VERCEL_GIT_COMMIT_SHA','VERCEL_ENV'];
const miss=req.filter(k=>!s.includes(k)); if(miss.length){ console.error('healthz missing tokens:',miss.join(', ')); process.exit(1); }
NODE
pass "healthz route contains SHA/env/dep tokens."

# -----------------------------
# 5) Docs alignment checks
# -----------------------------
DOC_DIR="documentation"
test -d "$DOC_DIR" || fail "documentation/ directory missing."

if test -f "$DOC_DIR/CONTEXT.md"; then
  if grep -q "Paris — Templates" "$DOC_DIR/CONTEXT.md"; then
    fail "documentation/CONTEXT.md still says 'Paris — Templates' (must be 'Paris — HTTP API')."
  else
    pass "CONTEXT.md reflects 'Paris — HTTP API'."
  fi
fi

if test -f "$DOC_DIR/verceldeployments.md"; then
  grep -q "c-keen-api" "$DOC_DIR/verceldeployments.md" || fail "verceldeployments.md missing c-keen-api section."
  grep -q "SUPABASE_SERVICE_ROLE" "$DOC_DIR/verceldeployments.md" || fail "verceldeployments.md must document SUPABASE_SERVICE_ROLE."
  grep -q "INTERNAL_ADMIN_KEY" "$DOC_DIR/verceldeployments.md" || note "verceldeployments.md should document INTERNAL_ADMIN_KEY."
  pass "verceldeployments.md includes c-keen-api and expected envs."
fi

if test -f "$DOC_DIR/ADRdecisions.md"; then
  grep -q "ADR-012" "$DOC_DIR/ADRdecisions.md" || fail "ADRdecisions.md missing ADR-012 entry."
  pass "ADRdecisions.md contains ADR-012."
fi

# -----------------------------
# 6) Optional cleanup (APPLY_FIXES=1): prune merged local branches & gc
# -----------------------------
if [[ "${APPLY_FIXES:-0}" == "1" ]]; then
  info "Optional cleanup: pruning remote-tracking branches…"
  git remote prune origin >/dev/null 2>&1 || true
  MERGED=$(git branch --merged main | sed 's/*//g' | sed 's/^[[:space:]]*//' | grep -Ev '^(main|develop|staging)$' || true)
  if [[ -n "${MERGED:-}" ]]; then
    echo "$MERGED" | while read -r b; do [[ -n "$b" ]] && git branch -d "$b" >/dev/null 2>&1 || true; done
    pass "Pruned locally merged branches."
  else
    note "No local merged branches to prune."
  fi
  git gc --prune=now --aggressive >/dev/null 2>&1 || true
  pass "Repository garbage-collected."
else
  note "Set APPLY_FIXES=1 to restore pnpm-workspace.yaml (if missing) and prune merged local branches."
fi

echo
echo "${GRN}ALL CHECKS COMPLETE${NC} — If every item is PASS, you are clear to proceed to (c) Vercel project creation."


