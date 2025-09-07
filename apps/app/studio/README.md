Studio (Host Shell)

Purpose
- Neutral, premium shell to preview design systems in isolation.
- Uses only system UI fonts and shell-local CSS/JS.
- Frames the Dieter catalogue via iframe at /dieter/components.html.

Single Source of Truth
- Dieter assets are served from the app at /dieter/** (public static):
  - /dieter/tokens/tokens.css
  - /dieter/components/*.css
- Dieter’s iframe loads Inter and tokens/components; the shell does not.

Behavior
- Theme toggle sets data-theme on the iframe html (Light/Dark/HC/Reset).
- Device toggle constrains iframe width (Desktop 100%, Mobile 393px).
- Sidebar auto-builds from [data-component] in the iframe and scrolls there.
- CSS editor injects rules into the iframe only; Copy copies the editor text.

Guardrails
- Stylelint forbids .diet-* selectors and --role-* variable usage in shell CSS.
- CSP allows same-origin frames; no global sandbox response header.

Notes
- Removing studio.css should not affect Dieter visuals.
- Removing a Dieter CSS file should only affect the iframe.


