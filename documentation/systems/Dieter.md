# Dieter PRD (v1, Frozen)

**Last updated:** 2025-09-09  
**Owner:** dieter/Dieter (Design System)  
**Status:** ✅ Frozen for v1 (implementation green-light)

---

## 1) Purpose

**Dieter** is Clickeen’s **design system** (tokens, icons, components, primitives, docs) and the **components manager** UX used internally to browse/inspect components. Dieter is delivered as a **workspace package** (`@ck/dieter`) and static assets served at `/dieter/*`. It is the single source of visual truth for **Studio**, **Bob**, **MiniBob**, and internal tools.

---

## 2) In/Out of Scope

**In scope (v1)**
- **Tokens:** color, typography, spacing, radii, shadow, motion, z-index, durations, easing, breakpoints.
- **Foundations:** reset/normalization, base typography scale, focus ring, state styles, density.
- **Components (foundational):** Button, Input, Select, Textarea, Checkbox, Radio, Switch, SegmentedControl, Tooltip, Tag/Badge, Card, Tabs, Table (essentials only), Icon primitives.
- **Icons:** curated set, consistent optical size, strokes, and naming.
- **CSS/JS exports:** CSS tokens and component styles; minimal JS helpers/types.
- **Docs:** usage guidelines, props, a11y notes, do/don’t, code samples.
- **Components Manager UI (internal):** list + variants browser (via Studio).

**Out of scope (v1)**
- App-specific components (billing forms, template-specific widgets).
- Runtime theme switching across host roots (Studio handles center-only toggles).
- i18n copy libraries.
- Shadow DOM encapsulation.

---

## 3) Consumers & Responsibilities

- **Studio Shell** (`@ck/studio-shell`): imports Dieter **tokens** and selected primitives for chrome; no tight coupling.  
- **Bob / MiniBob**: use Dieter components/tokens; templates render inside Studio’s center panel.  
- **Internal Dieter Manager**: embedded in Studio to browse components/variants and expose specs.

**Dieter owns:** tokens, icons, foundational components, styles, docs.  
**Hosts own:** business logic, persistence, preview engines, data fetching.

---

## 4) Distribution & Runtime

**Single source:** `dieter/` (repo root) → workspace package **`@ck/dieter`**  
**Build outputs:** `dieter/dist/**`  
**Static serving (CDN):** `/dieter/*` via **copy-on-build** per ADR-005:  
- `pnpm --filter @ck/dieter build` writes to `dieter/dist/**`  
- `scripts/copy-dieter-assets.js` copies to `apps/app/public/dieter/**` (never committed)

**Build order:** `apps/app` depends on `@ck/dieter` (`workspace:*`), and `dieter/package.json` has `prepare: pnpm run build` so fresh clones produce `dist/`.

**No routes, no symlinks:** We do **not** proxy through Next routes and we do not use symlinks. Static serving from copied assets only.

---

## 5) Package Layout (authoritative)
dieter/
package.json
src/
tokens/
index.ts             # token definitions (TS)
css/                 # source templates for CSS tokens
icons/
sources/*.svg        # raw normalized SVG sources
index.ts             # icon registry (optional JS export)
components/
button/
Button.tsx
button.css.ts      # CSS-in-JS or CSS module
docs.md
tests.spec.tsx
input/
…
foundations/
reset.css
focus.css
typography.css
docs/
overview.md
accessibility.md
dist/
tokens.css             # compiled CSS tokens (public)
foundations.css        # reset, focus, base styles
components.css         # aggregated component CSS
icons/
.svg                # optimized public icons
docs/
.html|.md|.json   # generated docs (optional, for serving)
---

## 6) Component Manager (Dieter UI in Studio)

- **Right panel:** lists all Dieter components.  
- **Center panel:** shows all variants of the selected component, rendered live.  
- **Right panel detail:** shows CSS variables, props, and implementation specs for that component.  
- **Toggles:** desktop vs. mobile viewport, light vs. dark theme (scoped to Studio center canvas).  

---

## 7) API / Exports

- **Tokens:**  
  - JS/TS: `import { colors, spacing } from '@ck/dieter/tokens'`  
  - CSS: `@import '@ck/dieter/dist/tokens.css';`  

- **Components:**  
  - `import { Button, Input } from '@ck/dieter/components'`  

- **Icons:**  
  - `import { IconPlus } from '@ck/dieter/icons'`  
  - Runtime path: `/dieter/icons/plus.svg`  

- **Foundations:**  
  - `@import '@ck/dieter/dist/foundations.css';`  

- **Docs:**  
  - Served at `/dieter/docs/*` (static HTML/MD/JSON from dist/docs).

---

## 8) Governance & Guardrails

- **Single source of truth:** `dieter/` at repo root.  
- **No symlinks:** copy-on-build only (ADR-005).  
- **CI checks:** block imports from `apps/app/dieter/`; assert `apps/app/public/dieter` has no tracked files and `dieter/dist/tokens.css` exists.  
- **Manual cleanup:** unused legacy folders will be deleted once symlink + builds are validated.  
- **Versioning:** Dieter package versions must follow SemVer; breaking changes require major bump and ADR update.  
- **Documentation generation:** optional; if generated, docs are served statically from `/dieter/docs/*`.  

## Distribution & Build Requirements (Frozen)
- **Copy-on-Build Only (ADR-005):** Publish artifacts (tokens.css, icons SVG, icons.json) to `dieter/dist/`; copy to `apps/app/public/dieter/`. No symlinks.  
- **SVG Normalization:** `scripts/process-svgs.js` enforces `fill="currentColor"`; `scripts/verify-svgs.js` asserts compliance; counts compared to `icons.json`.  
- **Tooling Consistency (ADR-004):** Canonical pnpm in root `package.json` (`pnpm@10.15.1`); CI uses `--frozen-lockfile`.  
- **Verification:** CI checks (a) no committed files under `apps/app/public/dieter/`, (b) presence of `dieter/dist`, (c) Dieter built before Studio/App.