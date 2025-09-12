# Migrations

- Track breaking changes across versions.  
- Every breaking change requires an entry in `breaking-changes.md`.

# Migration: v0 → v1

- Consolidate Dieter into Oslo (served by c-keen-app)  
- Preview path standardized to `/dieter/components.html`


# Breaking Changes

- 2025-09-09: Lockfile enforcement in CI; subdir installs must `cd` to repo root and use `--filter`.

### Migration — Tooling Consistency & Asset Copying (September 11, 2025)
**Why:** Prevent pnpm/version drift and symlink fragility in CI/Vercel.  
**Steps:**
1. Declare pnpm only in root `package.json` (`"packageManager": "pnpm@10.15.1"` or current).  
2. Ensure deployable packages declare `"engines": { "node": "20.x" }`.  
3. Remove pnpm version from workflows; keep frozen installs.  
4. Replace Dieter symlink with **copy-on-build** step to `apps/app/public/dieter/`.  
**Rollback:** Revert workflow/manifest changes together; CI should fail on drift.

