STATUS: NORMATIVE — SINGLE SOURCE OF TRUTH (SCOPED)
This document is authoritative for its scope. It must not conflict with:
1) documentation/dbschemacontext.md (DB Truth) and
2) documentation/*Critical*/TECHPHASES/Techphases-Phase1Specs.md (Global Contracts).
If any conflict is found, STOP and escalate to CEO. Do not guess.

# Techphases-Phase1Specs (NORMATIVE)
## S0. Scope & Principles
  - Budgets (size/latency) are guidance, not gates; enforcement is CEO decision.
  - Phase-1 has NO CSR fallback and uses ONLY a single SSR route for embeds.
  - GA includes ONLY Free/Paid plans; do not add tiers without CEO approval.
  - Path note: the folder name “CRITICAL-TECHPHASES” is LITERAL; treat it as an exact path, not a glob.

- Edge SSR widgets (single route). Studio hosts Bob. Dieter = Base-6.
- GA plans: FREE / PAID. Serial execution; CEO approves each task.
## S1. Theming & Tokens (Light/Dark + Overrides)
- Tokens: {colors.fg/bg/surface/primary/accent/neutral, radius, shadow, density, typography}
- theme.mode: "auto"|"light"|"dark". Instance overrides: {brand.primary, brand.accent, brand.neutral, radius, shadow, density}. WCAG AA enforced (warn/auto-adjust). CSS vars only.
## S2. Rendering Contracts
  - Backlink policy (Phase-1): SSR HTML MUST include “Made with Clickeen” backlink. Plan-based controls deferred to later phases.
  - Error keys (exact strings): TOKEN_INVALID, TOKEN_REVOKED, NOT_FOUND, CONFIG_INVALID, RATE_LIMITED, SSR_ERROR.
  - Caching (guidance): enable edge cache for SSR HTML; invalidate on config change or token/plan changes.

- WRC: render(widgetId, config) -> HTMLString (pure, server; no inline handlers)
- Embed: GET /e/:publicId → validate token+plan → load config → render() → inject “Made with Clickeen” backlink → write usage → cache headers. Errors: 401/404/422/429/5xx.
## S3. Global Config Schema Conventions
  - If an example payload is missing for a widget, DO NOT fabricate. Pause and request it from CEO.
- snake_case; enums UPPERCASE; defaults; arrays with max; server JSON Schema validation (422 returns field paths). Example payloads TBD per widget.
## S4. Templates as DATA
- Layouts {LIST, GRID, CAROUSEL, CARD, ACCORDION, MARQUEE}
- Skins {MINIMAL, SOFT, SHARP, GLASS}
- Densities {COZY, COMPACT}; optional Accents {BADGE, RIBBON, DIVIDER}
- A template = {layout, skin, density, accents[], tokens?}; switching is CSS/config only.
## S5. Studio (Container Rules)
- Modes: LIBRARY (gallery), BUILDER (editor+preview). Toggles: Light/Dark, Desktop/Mobile.
- Preview MUST be an iframe calling GET /e/:publicId with working config (no mocks).
## S6. Dieter Base-6 (Phase-1)
- Button, TextField, Select, Switch, Tabs, Panel. Tokens only; Light/Dark; a11y smoke checks.
## S7. Bob v1.0
- In: composition engine (as data), ≥30 curated templates/widget, JSON Schema editor (server-validated), SSR preview, presets, Save/Reset/Copy-Embed.
- Out: undo/redo, custom CSS, animations/A-B, external data integrations.
## S8. Seed Widgets (GA list)
  - “Optional” == NOT in GA. Do not implement optional widgets unless CEO says GO for that widget.
- FAQ, Testimonials, Announcement/Promo, Newsletter, Contact, Social Proof (optional: Pricing Cards, Gallery). Each: schema, presets, SSR HTML, error/loading/empty states.
## S9. APIs (Phase-1)
- POST/GET /api/token (issue/revoke/list)
- POST /api/usage (idempotent write; idempotency hash)
- GET /api/entitlements (plan→capabilities)
- GET /api/instance/:publicId (config snapshot)
## S10. Data & RLS Minima
- Tables: embed_tokens(public_id UNIQUE,…), widget_instances(… config JSONB, schema_version), events(idempotency_hash UNIQUE,… indexed), plan_features(… service-role writes).
- RLS: workspace-scoped reads/writes; no client SQL in embeds.
