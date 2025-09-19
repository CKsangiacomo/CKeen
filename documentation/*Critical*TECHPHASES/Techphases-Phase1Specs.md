STATUS: NORMATIVE — SINGLE SOURCE OF TRUTH (SCOPED)
This document is authoritative for its scope. It must not conflict with:
1) documentation/dbschemacontext.md (DB Truth) and
2) documentation/*Critical*/TECHPHASES/Techphases-Phase1Specs.md (Global Contracts).
If any conflict is found, STOP and escalate to CEO. Do not guess.

# Techphases-Phase1Specs (NORMATIVE)
## S0. Scope & Principles
- Edge SSR widgets (single route). Studio hosts Bob. Dieter = Base-6.
- GA plans: FREE / PAID. Serial execution; CEO approves each task.
## S1. Theming & Tokens (Light/Dark + Overrides)
- Tokens: {colors.fg/bg/surface/primary/accent/neutral, radius, shadow, density, typography}
- theme.mode: "auto"|"light"|"dark". Instance overrides: {brand.primary, brand.accent, brand.neutral, radius, shadow, density}. WCAG AA enforced (warn/auto-adjust). CSS vars only.
## S2. Rendering Contracts
- WRC: render(widgetId, config) -> HTMLString (pure, server; no inline handlers)
- Embed: GET /e/:publicId → validate token+plan → load config → render() → inject “Made with Clickeen” backlink → write usage → cache headers. Errors: 401/404/422/429/5xx.
## S3. Global Config Schema Conventions
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
- FAQ, Testimonials, Announcement/Promo, Newsletter, Contact, Social Proof (optional: Pricing Cards, Gallery). Each: schema, presets, SSR HTML, error/loading/empty states.
## S9. APIs (Phase-1)
- POST/GET /api/token (issue/revoke/list)
- POST /api/usage (idempotent write; idempotency hash)
- GET /api/entitlements (plan→capabilities)
- GET /api/instance/:publicId (config snapshot)
## S10. Data & RLS Minima
- Tables: embed_tokens(public_id UNIQUE,…), widget_instances(… config JSONB, schema_version), events(idempotency_hash UNIQUE,… indexed), plan_features(… service-role writes).
- RLS: workspace-scoped reads/writes; no client SQL in embeds.
