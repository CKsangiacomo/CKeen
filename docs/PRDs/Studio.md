# Studio — Product Requirements Definition (PRD)

## Definition
Studio is the **layout service**.  
It provides a standardized container (top bar + three panels + workspace) for interactive work.  
Studio has **no business logic** of its own and does not import Dieter CSS/JS.  
It is consumed by apps/services that need an editor, previewer, or visualization shell.

---

## Purpose
- Provide a **consistent layout** (topbar, left/right panels, workspace) across services.  
- Allow services to plug in their content logic without reinventing chrome.  
- Enforce strict separation: Studio = shell, Dieter = design system.  

---

## Scope
- **Top bar** (branding, title, global actions).  
- **Left panel** (primary controls/navigation, collapsible).  
- **Center workspace** (visualizer/editor, iframe host).  
- **Right panel** (secondary controls, collapsible).  
- **Global controls**: theme toggle (light/dark), viewport toggle (desktop/mobile), panel collapse.  

---

## Current Implementation
- **Location:** `/apps/app/public/studio/`  
- **Files:**  
  - `index.html` (host shell entry)  
  - `studio.css` (layout and chrome styles)  
  - `studio.js` (panel toggles, iframe communication, global controls)  
- **Deployment:** Served via **c-keen-app** at `/studio`  
  - Live URL: https://c-keen-app.vercel.app/studio  

---

## Architecture
### Shell (Studio)
- Provides chrome and layout (top bar, panels, global toggles).  
- No Dieter imports (no `.diet-*`, no Dieter CSS/JS).  
- Enforces CSP and Stylelint guardrails.  

### Content (Iframe)
- Target: `/dieter/components.html`  
- Sandboxed with CSP: `sandbox="allow-scripts allow-same-origin"`  
- Receives theme/viewport changes via `postMessage`.  
- Exposes available sections/components back to Studio.  

---

## Communication Protocol
- **Studio → Iframe**  
  - `{ type: 'theme', value: 'dark' }`  
  - `{ type: 'viewport', value: 'mobile' }`  
  - `{ type: 'panel', side: 'left', collapsed: true }`  

- **Iframe → Studio**  
  - `{ type: 'ready', sections: [...] }`  
  - `{ type: 'select', component: 'Button' }`  

---

## Sidebar Generation
- Studio inspects iframe DOM for `[data-component]`.  
- Builds sidebar navigation dynamically from detected components.  
- Navigation scrolls smoothly to component via `scrollIntoView()`.  

---

## Guardrails
- Studio must not import Dieter CSS/JS directly.  
- Studio must not define `.diet-*` classes.  
- Visualization logic must live inside the iframe, not in Studio chrome.  
- CSP: `frame-src 'self'`, `img-src 'self' data:`.  
- Stylelint override enforces no `.diet-*` or `--role-*` inside `/studio/**`.  

---

## Technology Stack (Claude Recommendations)

### Framework Choice
- **Final:** Keep Studio lightweight with vanilla JS + HTML + CSS for now.  
- **Reason:** Introducing Solid/Svelte adds framework overhead without strong need.  
- **Future:** Reevaluate if Studio grows complex; Solid.js would be preferred over React.  

### Panel Management
- **Final:** Keep CSS Grid (already in place).  
- **Future:** Adopt Floating UI for advanced tooltips/popovers if sidebar expands.  

### Animation Engine
- **Final:** Adopt Motion One for micro-interactions and panel transitions.  
- **Reason:** Lightweight, WAAPI-based, no React dependency.  

### State Management
- **Final:** Skip external state libraries in Phase 1.  
- **Reason:** Native DOM state management is sufficient now.  
- **Future:** If Studio state grows (multi-service plugins), adopt Zustand.  

### UX Enhancements
- **Final:**  
  - Adopt keyboard shortcuts (cmd+1/2/3 panels, cmd+shift+d theme, cmd+shift+v viewport).  
  - Implement persistent layout memory (localStorage).  
  - Add focus management for accessibility.  
- **Future:** ResizeObserver optimization can come later if panel resizing is added.  

### Performance Optimizations
- **Final:**  
  - Use CSS containment + `will-change`.  
  - Apply progressive enhancement (works without JS baseline).  
- **Future:** Intersection Observer for sidebar only if sidebar grows very large.  

### “Wow” Factors
- **Final:** Defer magnetic edges, contextual animations, adaptive density.  
- **Adopt later:** Command palette (Raycast-style fuzzy search) when Studio matures.  

---

## Implementation Roadmap

### Phase 1 (Now)
- Rock-solid CSS Grid layout.  
- CSP + Stylelint guardrails.  
- No framework overhead.  

### Phase 2
- Keyboard shortcuts (panels, theme, viewport).  
- Persistent layout memory.  
- Focus management for accessibility.  

### Phase 3
- Smooth panel transitions with Motion One.  
- Micro-interactions for buttons/controls.  

### Phase 4
- Command palette with fuzzy search.  
- Optional: Floating UI for popovers.  
- Optional: Intersection Observer for very large sidebars.  

---