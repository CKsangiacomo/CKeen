# PR Checklist — CTO Execution Gates

Before requesting review, confirm all are satisfied (see [docs/cto-execution-checklist-frontend.md](../docs/cto-execution-checklist-frontend.md)):

- [ ] Tokens-only: No raw hex/px; all vars via Dieter tokens.  
- [ ] Inter from Google Fonts only; no rsms.me, Roboto, Ubuntu.  
- [ ] Accessibility: focus rings, 44px touch, for/id + aria-describedby.  
- [ ] Theme safety: light/dark/data-theme="hc" render correctly; no flash.  
- [ ] Rem-based sizing; container queries preferred.  
- [ ] No CSS sprawl; classes start with diet- or text-.  
- [ ] Performance: minimal CSS/JS, no layout thrash.  
- [ ] File hygiene: only files in scope; no drive-by refactors.  
- [ ] CI green: Stylelint + font-source checks pass.  
- [ ] Self-test done: Inter loads from Google Fonts, tokens applied, no console errors.
