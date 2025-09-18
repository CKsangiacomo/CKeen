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


---

## RCA: Accidental Introduction of Unscoped Workflows
**Failure:** `supabase-schema-sync.yml` added without approval; nuked dbschemacontext.md.
**Impact:** Lost schema, wasted recovery days.
**Root Causes:** Skipped Techphases; added infra mid-execution.
**Resolution:** Workflow deleted; policy frozen.
**Prevent Recurrence:** No new workflows unless frozen in Techphases.

---

## RCA: Created Guardrail CI / PR Templates
**Failure:** Unapproved PR template + guardrail workflows blocked PRs.
**Impact:** PR failures, wasted effort.
**Root Causes:** Over-engineering; not frozen in scope.
**Resolution:** Deleted templates/workflows.
**Prevent Recurrence:** CEO approval required for all CI/templates.

---

## RCA: Polluting Repo with _reports Directory
**Failure:** `_reports/` dir added to repo.
**Impact:** Confusion about junk files.
**Root Causes:** Debug artifacts committed.
**Resolution:** Deleted `_reports/`.
**Prevent Recurrence:** Forbid debug artifacts in repo.

---

## RCA: Forgetting to Scrub Oslo Fully
**Failure:** Oslo references remained after “final” scrubs.
**Impact:** Days of repeated patching.
**Root Causes:** Incomplete scans.
**Resolution:** Full repo-wide grep + purge.
**Prevent Recurrence:** One-pass, zero-debate codename scrubs.

---

## RCA: Failure to Respect “CEO Drives” Rule
**Failure:** Pushed verification back to CEO.
**Impact:** Violated project process; wasted CEO cycles.
**Root Causes:** Default LLM behavior; ignored rule.
**Resolution:** Re-aligned: AI executes, CEO reviews.
**Prevent Recurrence:** Never assign execution back to CEO.

---

## RCA: Reintroducing Deleted Patterns
**Failure:** Deleted workflows/templates reappeared.
**Impact:** CEO saw “ghosts”; trust lost.
**Root Causes:** Pattern-following from old runs.
**Resolution:** Re-scrubbed; confirmed in origin/main.
**Prevent Recurrence:** Work only from origin/main.

---

## RCA: Overcomplication of Simple Tasks
**Failure:** Basic deletes wrapped in excessive guardrails.
**Impact:** Complexity, brittleness.
**Root Causes:** Misapplied Critical Rules.
**Resolution:** Simplified prompts.
**Prevent Recurrence:** Keep to Phase-1 boring discipline.

---

## RCA: PR Explosion Instead of Simple Direct Commits
**Failure:** Opened many PRs, caused Vercel overload.
**Impact:** “Deployment rate limited”; failed previews.
**Root Causes:** Misuse of PR flow.
**Resolution:** Switch to main-only commits.
**Prevent Recurrence:** For Phase-1: no PRs, direct main.

---

## RCA: Conflict Mismanagement
**Failure:** Merge conflict punted to CEO.
**Impact:** Stalled merge, delay.
**Root Causes:** Did not default to stable main.
**Resolution:** Keep main version by default.
**Prevent Recurrence:** Always resolve to stable unless CEO says otherwise.

---

## RCA: Inconsistent Use of Repo Sources
**Failure:** Mixed local, repomix, GitHub UI states.
**Impact:** Discrepancies, confusion.
**Root Causes:** No single truth.
**Resolution:** Align to origin/main as truth.
**Prevent Recurrence:** Never mix sources.

---

## RCA: Noise in Communication
**Failure:** Verbose, contradictory explanations.
**Impact:** Wasted CEO time, frustration.
**Root Causes:** Default LLM verbosity.
**Resolution:** Switch to tight Principal Engineer tone.
**Prevent Recurrence:** Keep comms concise, authoritative.

