STATUS: NORMATIVE — SINGLE SOURCE OF TRUTH (SCOPED)

This document is authoritative for its scope. It must not conflict with:
1) documentation/dbschemacontext.md (DB Truth) and
2) documentation/CRITICAL-TECHPHASES/Techphases-Phase1Specs.md (Global Contracts).
If any conflict is found, STOP and escalate to CEO. Do not guess.

# Studio (Phase-1)

## 1) Purpose (plain english)
Studio is the container scaffolding for Bob. The code lives in `apps/app/builder-shell/` and is served at the `/studio` route; it handles nav, auth/workspace context, and theme/device toggles, and hosts a live, production-parity preview via **GET `/e/:publicId`** (single SSR embed route; **no CSR fallback** in Phase-1). Studio itself doesn’t render widgets or write the DB—Bob edits config; Paris/Venice execute. It must deliver **mind-blowing UX** on the few things it does: a crisp 3-area layout, an elegant **TopDrawer** for templates, instant **Light/Dark** and **Desktop/Mobile** switches, and buttery transitions—no jank.

## 2) Must do (behavior)
**Taxonomy:** **TopDrawer** (templates) · **ToolDrawer** (left editor shell for Bob) · **Workspace** (center live preview) · **SecondaryDrawer** (right; built now, off by default).

- **Single place to work:** everything happens in the **Builder**. Templates live in the **TopDrawer** (no separate “Library” screen).
- **TopDrawer (templates):** collapsed by default; first template auto-applied. When opened, it **resizes to fit content** (up to a sensible max) and pushes the UI down—no overlap. Large sets support **horizontal carousel/scroll**.
- **Switching templates:** **Bob** decides carry-over (**CARRYABLE / NON_CARRYABLE**); **Studio** handles UX.  
  - **CARRYABLE →** switch immediately; keep compatible edits; brand overrides persist.  
  - **NON_CARRYABLE →** guard: **Save & switch / Discard & switch / Cancel**.
- **Workspace (preview):** always visible, center stage. It’s an **iframe** calling **GET `/e/:publicId`** (same SSR as production; **no CSR fallback**).  
  - **Workspace header:** **Theme** (Light/Dark) and **Device** (Desktop/Mobile) live here. Changes feel instant; viewport+density switches are smooth.  
  - **Live feel:** edits reflect **immediately** (light debounce for typing). Keep focus/scroll; show a lightweight skeleton while SSR is in flight.
- **ToolDrawer (left):** this is **Bob’s editor UI**. Studio only provides the shell: collapsed/expanded states, smooth width changes, independent scroll, and room for Bob’s sticky actions. **Studio does not define sections.**
- **SecondaryDrawer (right):** **built in Phase-1, off by default** (reserved for light “Assist”). When enabled, opens as a right drawer/sheet with simple, reversible suggestions.
- **Pane rules & responsiveness:**  
  - Both drawers have **collapsed/expanded** states; expanded width adapts to visible controls with simple **Apple/Google-style** transitions (no layout jumps).  
  - **Workspace is always visible.** Collapse order: **ToolDrawer first**, then **SecondaryDrawer** (if enabled).  
  - **Mobile:** only **Workspace** by default; drawers open as full-height sheets and close back to Workspace.
- **Manage:** **Save** keeps config, **Reset** restores defaults, **Copy-Embed** renders the **same output** outside Studio.
- **Honest states & a11y:** loading/empty/error mirror SSR responses; full keyboard nav, visible focus, clear labels; zero console errors.

## 3) Tech Specs (Contracts)

**Stack & placement**
- App: `c-keen-app` (Next.js 14, Node 20, pnpm) on Vercel App.
- Preview: iframe → **Venice** (Edge SSR) via `GET /e/:publicId` (single route; no CSR fallback).
- Data: Supabase via **Paris** (HTTP API). Studio never writes DB directly.

**TopDrawer sizing & browsing**
- CSS: `max-height: min(50vh, 400px); overflow: auto;`  
- Push-down layout (do **not** overlay Workspace).  
- Large sets: horizontal carousel/scroll with keyboard (←/→, Home/End). ESC closes; focus returns to trigger.

**Preview URL (Workspace iframe)**
- `src=/e/:publicId?ts={ms}&theme=light|dark&device=desktop|mobile`  
  (`theme`/`device` are hints; SSR must still reflect saved config.)

**Preview transition policy (no flash)**
- Double-buffer iframe or overlay: preload new HTML; **cross-fade 150–200ms** (ease-out) new→in, old→out; preserve focus/scroll; no layout jank.

**Focus/scroll preservation (iframe)**
```js
// Preserve scroll position across iframe reloads
const y = iframe.contentWindow?.scrollY || 0;
const x = iframe.contentWindow?.scrollX || 0;
iframe.addEventListener('load', () => iframe.contentWindow?.scrollTo(x, y), { once: true });

	•	Keep keyboard focus on the last interactive element in ToolDrawer when preview reloads.

Live preview update
	•	Edits: debounce 300–500ms, then save current config via Paris Instance Save endpoint
(/api/instance/:publicId — method per Techphases-Phase1Specs; upsert semantics).
	•	On success: reload iframe with new ?ts={ms} (preserve focus/scroll).
	•	On 4xx/5xx: surface inline errors in ToolDrawer; do not jank Workspace.

Template switching (Bob decides, Studio orchestrates)
	•	studio:template.change.request → { template_id: string }
	•	Bob replies bob:template.change.assess → { result: "CARRYABLE"|"NON_CARRYABLE", carry_keys?: string[] }
	•	If CARRYABLE: apply; save; refresh preview. If NON_CARRYABLE: guard; on confirm apply defaults; save; refresh.
	•	Brand overrides persist across templates.

Theme/Device (Workspace header)
	•	studio:workspace.theme.set → { mode: "light"|"dark" } → update tokens; save (debounced); refresh preview.
	•	studio:workspace.device.set → { device: "desktop"|"mobile" } → set viewport+density; refresh preview.
	•	Theme tokens cross-fade ~200ms; device switch uses subtle scale 0.98→1.00 (200ms).

Drawers (shell only)
	•	open()/close(); setWidth(px|preset) with animated transition; independent scroll; ESC closes topmost drawer/sheet on mobile.

422 field-path contract (Bob ↔ Paris)
	•	Paris returns per-field errors: array of { path: string, message: string }.
	•	path examples: content.items[2].title, style.theme, behavior.autoplay.
	•	Bob surfaces inline at matching controls; unknown paths → generic error slot.

Motion principles (Studio-wide)
	•	Timing: 150–300ms micro; 300–400ms macro.
	•	Easing: cubic-bezier(0.4, 0, 0.2, 1) (no bounce).
	•	Distance: hovers ≤2px; selections ≤8px.
	•	Preference: fades over movement; acknowledge every action within ~50ms.
	•	No layout jank: animate size changes; preserve scroll and focus.

Loading-state hierarchy
	•	<100ms: no indicator.
	•	100–300ms: subtle opacity dip (e.g., 100%→85%).
	•	300–1000ms: thin progress affordance (bar/spinner).
	•	>1000ms: lightweight skeleton + short message.

Performance (guidance, not gates)
	•	Preview update p95 ≤ ~200ms end-to-end; UI transitions ≤ ~150–200ms at 60fps.
	•	Budgets are guidance; enforcement is a CEO decision.

4) Use / Integrations (Consumers, Outputs, DB/API)

Consumers
	•	Bob renders inside ToolDrawer.
	•	Workspace consumes Venice (GET /e/:publicId).
	•	SecondaryDrawer: built but off by default; reserved for future Assist.
	•	Studio shell itself runs the Dieter React component library (buttons, drawers, etc.); the iframe preview remains pure SSR HTML from Venice (no React in the rendered widget).

Studio → Paris (HTTP API)
	•	Instance Load: GET /api/instance/:publicId — load current config.
	•	Instance Save (upsert): /api/instance/:publicId — save current config (debounced for edits; immediate on Save).
(Use the HTTP method defined in Techphases-Phase1Specs.)
	•	Entitlements: GET /api/entitlements — gate features (caps, advanced templates).
	•	Tokens (list): GET /api/token — optional display; no issuance here.

Supabase (from dbschemacontext.md — do not drift)
	•	widget_instances: read/update config (JSONB), schema_version, display metadata.
	•	embed_tokens: read non-sensitive fields; validation server-side.
	•	plan_features: read entitlements; writes service-role only.
	•	events: Studio does not write usage; Venice posts usage async on real renders.

Caching & invalidation
	•	Venice SSR HTML is edge-cached; Studio forces fresh preview via ?ts={ms} after saves.
	•	Server invalidates on instance config, token, or plan changes.

Security & RLS
	•	All writes happen server-side in Paris with service-role.
	•	Studio operates with user session; no client writes to events or plan_features.
	•	Error taxonomy surfaced to users (from Venice/Paris): TOKEN_INVALID, TOKEN_REVOKED, NOT_FOUND, CONFIG_INVALID, RATE_LIMITED, SSR_ERROR.

Outputs
	•	Visual: production-parity HTML in Workspace.
	•	Copy-Embed: snippet that renders the same output as Workspace.
	•	State: persisted instance config for Venice to render publicly.
