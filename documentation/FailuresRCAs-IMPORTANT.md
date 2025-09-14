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


## RCA: StudioShell Export and Runtime Failures (Sept 2025)

**Summary**  
StudioShell failed to render in `/studio` due to missing exports, slot misconfiguration, and sloppy incremental fixes that wasted significant engineering cycles.

**Root Causes**  
1. **Empty Exports**  
   - `packages/studio-shell/src/index.ts` and `src/api/index.ts` contained no exports.  
   - `StudioRoot.tsx` defined components but did not export them.  
   - This was the fundamental issue, repeatedly overlooked.

2. **Pre-Check Failures**  
   - GPT proposed speculative fixes (PostCSS, Tailwind, tokens) without auditing file contents.  
   - Multiple prompts assumed complex issues (TypeScript stripping, runtime attach) when the reality was trivial: no exports.

3. **Process Drift**  
   - Prompts appended code blindly, causing file corruption (`$@` artifacts in `StudioRoot.tsx`).  
   - Dangerous sed/cat usage overwrote or duplicated content without validation.  
   - Inconsistent application of “pre-audit before patching” rule.

4. **Unnecessary Detours**  
   - Time wasted debugging PostCSS/Tailwind when the build error was unrelated to missing exports.  
   - Studio CSS tokens mis-scoped, adding noise rather than addressing the true runtime problem.

5. **Failure to Validate Outputs**  
   - Did not check dist artifacts (`dist/api/index.js`, `.d.ts`) early.  
   - Did not test runtime exports before claiming success.  
   - Relied on assumptions instead of evidence.

**Impact**  
- >20 hours lost debugging irrelevant issues.  
- User frustration escalated.  
- Repo corruption and repeated rollbacks.  
- Loss of trust in AI-assisted engineering for critical path.

**Preventive Actions**  
- Enforce **mandatory repo audit** (grep for exports, list dist outputs) before suggesting fixes.  
- Ban unsafe file write patterns (`cat > file` with inline content) without explicit backups.  
- Require runtime validation (`node -e "console.log(Object.keys(require(...)))"`) after every build.  
- Capture every failure in RCA to avoid repetition.



