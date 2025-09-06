# CTO Execution Checklist (CRITICAL) <<FRONTEND>>
1. YOU decide first if we optimize for speed (batch small steps) or error-prevention (one verifiable step).
2. Never guess. No placeholders, no “maybe/likely”. Use only what we confirmed.
3. Never assume. If something isn’t specified, do nothing and surface as TODO.
4. Always check source of truth:
• dieter/tokens/tokens.css (and later tokens.json)
• components/index.ts contracts (when we add them)
• design-system.md rules
• Inter from Google Fonts only (primary), system fallbacks ok, no Roboto, no Ubuntu
5. One task only, complete it end-to-end before starting another.
6. Every task must tie back to the Phase 2 plan (Tokens → Guardrails → Components → Integration).
7. Confirm structure: check file vs generated. Don’t hand-edit generated files, respect paths.
8. No sprawl: never hardcode raw colors, spacing, typography. Always use Dieter tokens.
9. Accessibility first: visible keyboard focus, contrast 4.5:1 body / 3:1 UI, 44px min touch targets, labels for inputs.
10. Responsive model: prefer container queries. Use media breakpoints only if specified. Use rem for sizing.
11. Performance: keep CSS/JS minimal, no layout thrash, no unused imports, check bundle delta if relevant.
12. Component contracts: before coding, verify props, states, sizes, variants in components/index.ts.
13. Theme safety: light, dark, and data-theme=“hc” must render correctly. No flash when switching.
14. Browser support: test latest Chrome, Safari, Firefox. Add graceful fallback where needed.
15. File hygiene: only touch files listed in the task. No drive-by refactors. Keep naming consistent.
16. Git hygiene: small atomic commits, commit message explains why (e.g. feat(dieter): add typography scale tokens).
17. Self-test before commit:
• No console errors
• Inter is served from Google Fonts (network check)
• Tokens applied (no raw hex or px except in tokens)
• Light/dark/high-contrast ok
• Keyboard nav + focus ring ok
18. Acceptance note after commit: short bullet of what changed, where, and impact.
19. Rollback ready: every change can be reverted cleanly, no hidden cross-file deps.
20. Stop if unsure: ask for updated tokens/contracts/spec before continuing.
21. Git Operations (when publishing):
• Never force push, rebase, or squash. Preserve commit history.
• New work = new branch, named feat/<scope> (e.g. feat/dieter-phase2-foundation).
• Commands (single sequence, no extras):
- git status --porcelain → STOP if uncommitted changes.
- git fetch origin
- git log --oneline origin/main..HEAD → show commits.
- git switch -c feat/<scope> (if not already on branch).
- git push -u origin feat/<scope>
• Verify with:
- git branch -vv
- git ls-remote --heads origin | grep feat/<scope>
- git log --oneline origin/main..feat/<scope>
• Output ACCEPTANCE NOTE: branch name, number of commits, top commit messages, PR title/description (don’t create PR automatically).


