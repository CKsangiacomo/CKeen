# Failures & RCAs — Important

## RCA — pnpm Version Conflict in CI (ERR_PNPM_BAD_PM_VERSION)
**Date:** September 11, 2025  
**Summary:** CI failed due to pnpm version specified both in workflow and `package.json`, causing version drift and blocking installs.  
**Impact:** Multiple failed runs, delayed merges, repeated retries.  
**Root Cause:** Duplicate tool version declarations.  
**Resolution:** Single source of truth is `package.json` `packageManager`. Workflows must not pin pnpm. Enforce `--frozen-lockfile`.  
**Prevention:** ADR-004, ADR-005; Playbooks; CI guards to detect drift; copy-on-build for Dieter assets.


