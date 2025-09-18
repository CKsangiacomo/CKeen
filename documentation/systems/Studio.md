# Studio PRD (v1, Frozen)

**Last updated:** 2025-09-09  
**Owner:** Platform / CTO  
**Status:** ✅ Frozen for v1 (implementation green-light)

---

## Summary
Studio is a standalone shell reused by multiple products (Bob, MiniBob, Dieter). It provides chrome (topbar, template row), a 3-panel layout (left | center | right), theme + viewport toggles (affect center only), panel collapse, and a typed event bus. Studio does not own business logic, templates, preview rendering, persistence, or network calls. These are the responsibility of the host.

---

## Goals
- Provide a single reusable shell for all builders and internal tools  
- Guarantee consistent UX and behavior (theme/viewport toggles, panel chrome)  
- Define a tiny, stable API for hosts to inject content and react to shell events  
- Enforce correctness via explicit error throwing, typed events, and predictable lifecycle  

---

## Non-Goals
- Template system  
- Preview runtime (e.g. Venice integration)  
- Persistence or network calls  
- Resizing or panel width control in v1  
- Shadow DOM encapsulation  

---

## Primary Consumers

### Bob / MiniBob (Widget Builder & Editor)
- Display a template selector row directly under the topbar  
- Left panel: controls for features/edits derived from the selected template  
- Center panel: live preview of the template with edits (critical feature)  
- Right panel: editable fields/specs (flexible use)  
- Host owns: template data, preview engine (e.g., Venice), persistence, and network calls  

### Dieter (Components Manager)
- Right panel: list of components; clicking one updates the center panel  
- Center panel: preview of all variants of the selected component  
- Right panel: CSS and specs for the component  
- Host owns: component catalog, rendering logic, persistence  

**Common behavior across all hosts**: theme toggle (light/dark) and viewport toggle (desktop/mobile) that apply only to the center panel.

---

## Scope & Constraints
- Scope: layout shell, chrome, theme + viewport toggles, panel collapse, typed events, slot mounting API  
- Out of scope: resizing, shadow DOM, persistence, preview runtimes, templates  
- Monorepo & Deploy: must follow CTO Execution Checklist (pnpm workspaces, Node 20.x, integrations in `/apps/app` for Bob, `/site` for MiniBob, `/dieter` for Dieter; no new Vercel projects)  
- Design System: Studio shell uses dieter/Dieter tokens and components where appropriate; no Shadow DOM  

---

## UI Structure (DOM & Accessibility)

**Required slots (element IDs):**
- `#slot-templateRow`: empty container under topbar (auto-hides when empty)  
- `#slot-left`: left panel  
- `#slot-center`: center panel body containing `#centerCanvas`  
  - Studio applies classes here: `.studio-theme-light` / `.studio-theme-dark`, `.studio-viewport-desktop` / `.studio-viewport-mobile`  
- `#slot-right`: right panel  

**Accessibility roles:**
- Topbar: `<header role="banner">`  
- Template row: `role="region" aria-label="Template selector"`  
- Panels: `role="region" aria-label="Left|Center|Right panel"`  
- Toggles: `role="tablist"` with `role="tab"` and `aria-selected`  

**Panel chrome:**
- Header (icon, title, actions), body (host content)  
- Collapse buttons for left/right panels  

---

## Behavior (v1)
- **Theme toggle**: updates classes on `#centerCanvas` only, never `<html>`  
- **Viewport toggle**: updates classes on `#centerCanvas` only  
- **Panel collapse**: visually hides/shows panel; mounted content remains  
- **Template row**: auto-hides when empty (CSS `display:none`), auto-shows on mount  
- **Lifecycle**:  
  - `studio:ready` event fires exactly once when DOM is ready  
  - `ready()` can be called multiple times and resolves with current state  

---

## Public API (Frozen)

### Types
type SlotType = 'left' | 'center' | 'right' | 'templateRow';

type StudioState = {
  theme: 'light' | 'dark';
  viewport: 'desktop' | 'mobile';
  panels: {
    left:  { collapsed: boolean };
    right: { collapsed: boolean };
  };
};

type StudioEventMap = {
  'studio:ready': StudioState;
  'studio:theme': { theme: 'light' | 'dark' };
  'studio:viewport': { viewport: 'desktop' | 'mobile' };
  'studio:panel': { side: 'left' | 'right'; collapsed: boolean; source: 'user' | 'host' };
};

### API
interface StudioAPI {
  // Lifecycle
  ready(): Promise<StudioState>; // resolves with current state, safe to call multiple times
  destroy(): void;

  // Slot management (throws on conflict)
  mount(slot: SlotType, element: HTMLElement): void;
  unmount(slot: SlotType): void;
  getSlot(slot: SlotType): HTMLElement | null;

  // State
  getState(): StudioState;
  setTheme(theme: 'light' | 'dark'): void;          // affects center canvas only
  setViewport(viewport: 'desktop' | 'mobile'): void; // affects center canvas only
  togglePanel(side: 'left' | 'right', source?: 'host'): void;

  // Events
  on<T extends keyof StudioEventMap>(
    event: T,
    handler: (detail: StudioEventMap[T]) => void
  ): () => void;
}

---

## Event Contracts
- `studio:ready`: fires once; payload = current state  
- `studio:theme`: payload = `{ theme }`  
- `studio:viewport`: payload = `{ viewport }`  
- `studio:panel`: payload = `{ side, collapsed, source }`  

---

## Implementation Checklist
1. Studio applies `.studio-theme-{light|dark}` to `#centerCanvas` only  
2. Studio applies `.studio-viewport-{desktop|mobile}` to `#centerCanvas` only  
3. Template row auto-hides when empty  
4. All mount/unmount conflicts throw errors  
5. `studio:ready` fires exactly once  
6. Panel events include `source` field  

---

## Deferred (Future Versions)
- Resize events (v1.1 when real stories exist)  
- Shadow DOM (never; use CSS containment instead)  
- Panel width control (not needed in v1)  

---

## Risks & Mitigations
- **Host misuse**: hosts might ignore thrown errors. Mitigation: document strict usage in API guide.  
- **Panel toggle feedback loops**: mitigated with `source` field on `studio:panel`.  
- **Style conflicts**: mitigated via CSS containment rules, not Shadow DOM.  
- **Performance**: hosts must mount once and update content, not repeatedly remount.  

---

## Engineering Constraints (Frozen)
- **Deterministic Build (ADR-004):** Studio consumes Dieter tokens/icons; builds require canonical pnpm & Node 20. CI uses `--frozen-lockfile`.  
- **Icons Rendering:** Inline SVG fetched from `/dieter/icons/svg/<kebab>.svg`, normalized to `fill="currentColor"`, hydration-safe, cached in memory with bounded LRU+TTL.  
- **Token Scoping:** Dieter `tokens.css` is transformed at build via `scripts/scope-tokens.js` to scope `:root` → `#centerCanvas` (no global bleed).  
- **Asset Flow (ADR-005):** Dieter builds to `dieter/dist/`; copy to `apps/app/public/dieter/`.  
- **Order:** `@ck/dieter` → copy assets → `@ck/studio-shell` → `@ck/app`.  
- **Accessibility:** Decorative icons are `aria-hidden`; action icons include `aria-label`.