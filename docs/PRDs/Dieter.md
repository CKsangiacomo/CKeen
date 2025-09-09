# Dieter — Product Requirements Definition (PRD)

## Definition
Dieter is the **design system service**.  
It provides the foundational **tokens, icons, and components** used across all Clickeen apps and services.  
Dieter is not an app and is not deployed standalone — it is consumed by other services (e.g., Studio, App, Embed, Site).

---

## Purpose
- Ensure **visual and interaction consistency** across all apps/services.  
- Provide a **single source of truth** for system icons, typography, spacing, colors, and reusable UI primitives.  
- Reduce duplication and design drift by centralizing tokens and components.  

---

## Scope
- **Tokens** (typography, spacing, colors, roles).  
- **Icons** (all SF Symbols exported to `/dieter/icons/*.svg`).  
- **Components** (primitive UI elements, e.g., buttons, segmented controls).  
- **Contracts**: exposed APIs in `/dieter/components/index.ts` for consuming apps.  

---

## Inputs
- Design specifications from the design team.  
- System-level iconography (SF Symbols exports).  
- Token definitions (colors, typography, spacing, roles).  

---

## File Structure
`/dieter`  
- `/tokens`  
  - `tokens.json` → source of truth for design tokens  
  - `tokens.css` → generated CSS variables consumed by apps/services  
- `/icons`  
  - `*.svg` → full SF Symbols export set  
- `/components`  
  - `index.ts` → entry point contract for components  
  - `components.html` → static preview used by Studio iframe  
  - `icon.css`, `icon-helpers.css`, `segmented.css` → CSS definitions for Dieter primitives  

---

## Outputs
- **Static assets**:  
  - `/dieter/icons/` → all SVG icons  
  - `/dieter/components.html` → component previews (for Studio iframe)  
- **Contracts**:  
  - `/dieter/components/index.ts` → TypeScript entry point for component exports  
- **Helper CSS**:  
  - `/dieter/components/icon.css`, `/dieter/components/segmented.css`, etc.  

---

## Build Process
- **Tokens**: `tokens.json` → transformed into `tokens.css` by build script (CSS custom properties).  
- **Components**: CSS + TypeScript contracts, previewed in `/dieter/components.html`.  
- **Icons**: exported via SF Symbols pipeline into `/dieter/icons/`.  

---

## Build Outputs
- `/dieter/tokens/tokens.css` — generated from `tokens.json`  
- `/dieter/components.html` — static preview page  
- No bundled JS (components are CSS + contracts only)  

---

## Technology Recommendations

### Component Architecture
- CSS primitives + TypeScript contracts only.  
- No React/Vue/Web Components.  
- Lightweight by design; compatible with Venice (<28KB bundle).  

### Build Pipeline
- **Adopt Style Dictionary** for professional token transformation.  
  - Input: `tokens.json`  
  - Outputs: `tokens.css`, JS, Swift, Kotlin (if needed).  
- PostCSS for autoprefixing, future CSS features.  

### Component Preview System
- Keep `components.html` as static preview.  
- Enhance with **dev-only live reload** using WebSocket for faster iteration.  
- Studio consumes this directly.  

### Animation System
- CSS `@layer` + custom properties for motion tokens.  
- No JS dependencies for animations.  
- Allows runtime theme/motion tweaks without rebuild.  

### Icon System
- Keep SF Symbols → SVG export pipeline.  
- Add **SVGO optimization** for smaller files.  
- Optional: sprite sheet generation for HTTP/2 performance (later phase).  

### Testing Strategy
- Visual regression testing with Playwright against `/dieter/components.html`.  
- Screenshots per component state → detect regressions early.  
- No heavy test frameworks required.  

### Documentation
- Self-documenting via `components.html`.  
- Inline docs + usage examples per component.  
- Studio sidebar generation consumes `[data-component]` metadata.  
- No Storybook or separate doc site required.  

### Performance Optimizations
- Preload tokens CSS in consuming apps: `<link rel="preload" href="/dieter/tokens/tokens.css" as="style">`  
- Inline critical CSS tokens at startup: `<style id="diet-critical">:root { --diet-color-primary: #007AFF; }</style>`  
- Apply SVGO for icons.  
- Guidance for consuming apps: use critical CSS + preloading strategies.  

---

## Guardrails
- Dieter must not depend on Studio.  
- Dieter must remain **UI-agnostic** — no business logic.  
- No frameworks (React/Vue), no Storybook, no CSS-in-JS.  
- Contracts must be versioned and documented in `/dieter/components/index.ts`.  
- Tokens must be the single source of truth — no duplication in apps.  
- Dieter icons must always resolve under `/dieter/icons/*.svg` via `c-keen-app`.  

---

## Deployment
- Dieter is served only through **c-keen-app**.  
- Live URLs:  
  - Components preview: https://c-keen-app.vercel.app/dieter/components.html  
  - Icons: https://c-keen-app.vercel.app/dieter/icons/  
- ⚠️ Do not create a standalone Vercel project for Dieter.  

---

## Integration Examples
- **Studio**  
  - Loads `/dieter/components.html` into the workspace iframe.  
  - Uses Dieter icons (`/dieter/icons/*.svg`) in its chrome.  
- **App (c-keen-app)**  
  - Imports tokens and components from `/dieter/components/index.ts`.  
- **Embed (c-keen-embed)**  
  - Uses Dieter icons for consistent widget visuals.  
- **Site (c-keen-site)**  
  - May import Dieter tokens for styling marketing pages.  

---

## Implementation Priority
1. Already Done: tokens, icons, base components.  
2. Next: integrate Style Dictionary for token pipeline.  
3. Then: add Playwright visual regression tests.  
4. Later: add SVGO + sprite sheets + critical CSS.  
5. Never: React/Vue components, Storybook, CSS-in-JS, heavy bundlers.  