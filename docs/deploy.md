# Deployment Guide

## Dieter is served by the App (single deployment)
- Dieter contracts live in `/dieter/components/index.ts`.
- `/apps/app/public/dieter` contains only static preview assets (HTML/CSS/JS).
- Studio loads `/dieter/components.html` from the App deployment.
- ⚠️ The separate `c-keen-dieter` Vercel project must be deleted in the dashboard; only `c-keen-app`, `c-keen-embed`, and `c-keen-site` remain valid.

### Studio
- Studio is an empty host shell (chrome, sidebar, iframe, toggles) with no Dieter logic.
- Default iframe source is `/dieter/components.html` for visualization.
- Guardrails: CSP allows `frame-src 'self'`; iframe is sandboxed. Stylelint override for `/apps/app/public/studio/**` forbids `.diet-*` and `--role-*`.
- ⚠️ Do NOT create a separate Vercel project for Studio. It is served by `c-keen-app`.

### Studio Host Shell
- Route file: `apps/app/studio/index.html` serves `/studio` (HTML only here).
- Assets: `apps/app/public/studio/studio.css` and `apps/app/public/studio/studio.js`.
- No HTML should exist under `apps/app/public/studio/`.
- Visualization must live strictly inside the iframe (defaults to `/dieter/components.html`).

## Studio (Host Shell Only)
Studio at `/studio` is an empty host shell. It MUST NOT contain Dieter components, styles, or logic. Visualization loads strictly via an iframe to `/dieter/components.html` with `sandbox="allow-scripts allow-same-origin"`, and CSP restricts to `'self'`. Do not create a separate Vercel project for Studio; it ships with **c-keen-app**.

## Vercel Projects
These are the ONLY valid projects. Do not create new ones.

- **c-keen-app** → Root: `/apps/app` → https://c-keen-app.vercel.app  
- **c-keen-embed** → Root: `/services/embed` → https://c-keen-embed.vercel.app  
- **c-keen-site** → Root: `/site` → https://c-keen-site.vercel.app  

⚠️ **Warning:** Do not create new Vercel projects. All deployments must go to one of the above.

## Deployment Rules
- Branch: `main` → Production deploy
- Feature branches → Preview deploys (auto-enabled in Vercel)
- vercel.json lives inside each root folder (`/apps/app/vercel.json`, etc.)
- No vercel.json at repo root
- pnpm only (never npm/yarn)

## Troubleshooting
- If a new project appears in Vercel, delete it immediately
- If deployments fail, confirm Root Directory matches (apps/app, services/embed, site)
- If GitHub pushes don’t trigger deploys, check Vercel Git integration and webhooks
 