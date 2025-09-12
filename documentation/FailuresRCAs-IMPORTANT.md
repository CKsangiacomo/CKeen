# Failures & RCAs — Important

## RCA — pnpm Version Conflict in CI (ERR_PNPM_BAD_PM_VERSION)
**Date:** September 11, 2025  
**Summary:** CI failed due to pnpm version specified both in workflow and `package.json`, causing version drift and blocking installs.  
**Impact:** Multiple failed runs, delayed merges, repeated retries.  
**Root Cause:** Duplicate tool version declarations.  
**Resolution:** Single source of truth is `package.json` `packageManager`. Workflows must not pin pnpm. Enforce `--frozen-lockfile`.  
**Prevention:** ADR-004, ADR-005; Playbooks; CI guards to detect drift; copy-on-build for Dieter assets. Mitigations implemented: root `packageManager=pnpm@10.15.1`, `--frozen-lockfile` enforced, no nested lockfiles, Dieter assets copied (no symlinks), SVG normalization + verification, public assets untracked enforcement.

## RCA: P0 — Principal Engineer Scope Drift

**Date:** 2025-09-12  
**Severity:** P0  

### Symptoms
- CI failures and hangs from heredoc prompts (`command not found: #`, endless waiting).
- Rework from updating `SERVICES_INDEX.md` despite it being temporary.
- Repo churn with extra scripts and ops files not part of scope.
- Confusion about roles (GPT vs Cursor).

### Root Cause
- Principal engineer introduced scope drift beyond documentation/.
- Temporary artifacts treated as tracked deliverables.
- Prompts written with heredocs and zsh-incompatible syntax.
- Roles blurred, leading to mixed instructions.

### Corrective Actions
1. ADR 12: enforce scope discipline and role separation.  
2. Generator explicitly marked: outputs are temporary, not tracked.  
3. Prompts standardized to plain bash, no heredocs.  
4. Roles clarified: GPT = principal, Cursor = executor.  

### Preventive Measures
- All future changes must be reflected in ADRs or RCAs.  
- Principal must confirm alignment with documentation before introducing new elements.  
- CI workflows limited to documentation/ scope only.  

## RCA — Icon Size Suffix Regressions

**Date:** 2025-09-12  
**Incident:** CI guard and Studio public page referenced size-suffixed icons (`*-16.svg`), while Dieter correctly outputs unsuffixed files. Result: CI failures, missing asset errors.

**Root Cause:** Ambiguous prior assumptions about per-size variants; documentation did not contain explicit “NO SUFFIXES” prohibition; no automated guard prevented reintroduction.

**Impact:** ~3–4 hours engineering time; one PR temporarily blocked; delayed confidence in Studio preview.

**Corrective Actions:**
- Documentation updated with explicit “NO SUFFIXES” rule and examples
- CI guard rejects any `*-<digits>.svg` under `dieter/icons/svg/`
- Studio consumption clarified to use unsuffixed names + token-based sizing
- Added icon-related PR checklists

