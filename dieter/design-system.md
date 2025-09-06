# Dieter Design System — Authoritative Rules (v0)

## Scope
Dieter is Clickeen’s presentation layer. It provides:
- Tokens (colors, typography, spacing, states, a11y)
- Theme contracts (light, dark, high-contrast via `data-theme="hc"`)
- Primitive components styled **only** with tokens
- Accessibility, performance, and responsiveness guardrails

## Non-Negotiables
1) **Tokens-Only**: No raw hex/px/hard-coded values in component CSS. Always use CSS variables from `dieter/tokens/tokens.css`.
2) **Font Source**: Inter must be loaded **only** from Google Fonts. No `rsms.me`, no Roboto/Ubuntu.
3) **Accessibility First**:
   - Visible `:focus-visible` rings using focus tokens.
   - 44px min touch targets for interactive controls.
   - Labels linked to controls; `aria-describedby` for help/error.
   - Inline errors + summary patterns for validation; use appropriate live regions.
4) **Theming Safety**:
   - Light/Dark auto with `prefers-color-scheme`.
   - High-contrast via `data-theme="hc"` on `<html>` or `<body>`.
   - No visible flash during theme changes; state layers use tokens.
5) **Performance & DX**:
   - Minimal CSS; no unused declarations.
   - REM-based sizing; no layout thrash.
   - Keep components dependency-free (tokens-only CSS).

## Tokens (Contract)
Source of truth: `dieter/tokens/tokens.css`

- **Typography**: REM scale with utilities (`.text-10` … `.text-32`, `.text-title-fluid`).
- **Spacing**: 4px grid via `--space-*` and utilities (`.p-*`, `.m-*`, `.px-*`, `.py-*`, `.mx-*`, `.my-*`).
- **Colors (Semantic Roles)**: `--color-text-*`, `--color-surface-*`, `--color-border-*`, `--color-primary-*`, `--color-success-*`, `--color-danger-*`, etc.
- **States / Layers**: hover/active/disabled overlays via tokens; no ad-hoc alpha hacks.
- **Focus / A11y**: `--focus-ring-width`, `--focus-ring-offset`, `--focus-ring-color`; reduced motion support.
- **Theming**: overrides for `:root`, `@media (prefers-color-scheme: dark)`, and `[data-theme="hc"]`.

If a needed value is missing, **add a new token** (with naming rationale) before using it.

## Components (v0, tokens-only)
- Button: sizes sm/md/lg; hover/active/focus states via tokens; min-height ≥ 44px.
- Input / Textarea: label/help/error wiring; `aria-invalid`; tokens for borders/backgrounds.
- Select (native): tokens-only; accessible focus; min-height ≥ 44px.
- Checkbox/Radio (native): labeled rows ≥ 44px; radiogroup via `<fieldset><legend>…`.
- Form Group & Validation: label/field layout; inline and summary patterns; live region semantics.

**Do not** introduce JS or third-party CSS here. Components remain CSS+HTML primitives using tokens.

## Playground & Verification
- `playground.html` demonstrates tokens, utilities, themes, and components.
- Theme toggles (Light/Dark/HC) and REM scaling control (14–20) are provided.
- Use the playground to verify regressions visually before committing.

## Contribution Rules
1) Never edit generated/third-party files (none today).
2) Only modify files listed in task prompts; no drive-by refactors.
3) Commit small and atomic; message explains **why** (`feat(dieter): …`).
4) Add an *Acceptance Note* in PRs: what changed, where, impact.

## Future Contracts (Placeholders, do not implement yet)
- `tokens.json` mirror + typed exports
- `components/index.ts` for prop contracts
- ESLint/Stylelint rules to enforce tokens-only usage
- Ladle/Docs site for internal browsing (post-foundation)

## Font Source (canonical)
Load Inter **only** from Google Fonts:
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

