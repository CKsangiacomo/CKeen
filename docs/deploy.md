# Deployment Guide

## Dieter (served by the App)
- Dieter is **not** a standalone deployment.
- Contracts live in `/dieter/components/index.ts`.
- `/apps/app/public/dieter` contains static preview assets (HTML/CSS/JS).
- Studio loads `/dieter/components.html` **from the App deployment**.
- ⚠️ Delete the `c-keen-dieter` Vercel project (do not recreate). Valid projects are: `c-keen-app`, `c-keen-embed`, `c-keen-site`.

## Studio (Host Shell Only)
- Studio is an empty host shell (chrome, sidebar, iframe, toggles). It contains **no Dieter logic**.
- **Location:** `apps/app/public/studio/` (static host shell).
- **Access:** `/studio` redirects to `/studio/index.html` (configured in `apps/app/next.config.mjs`).
- The iframe visualization loads `/dieter/components.html`.
- Guardrails:
  - CSP allows `frame-src 'self'`.
  - Iframe is `sandbox="allow-scripts allow-same-origin"`.
  - Stylelint override for `/apps/app/public/studio/**` forbids `.diet-*` and `--role-*`.
- ⚠️ Do **not** create a separate Vercel project for Studio; it ships with **c-keen-app**.

## Vercel Projects (only these three)
- **c-keen-app** → Root: `/apps/app` → https://c-keen-app.vercel.app
- **c-keen-embed** → Root: `/services/embed` → https://c-keen-embed.vercel.app
- **c-keen-site** → Root: `/apps/site` → https://c-keen-site.vercel.app

⚠️ **Rule:** Do not create new Vercel projects. All deployments must target one of the above.

## Deployment Rules
- Branch `main` → Production deploy.
- Feature branches → Preview deploys (auto in Vercel).
- **vercel.json lives at the repo root** and must contain **install-only** settings (lockfile enforcement). Do **not** set a repo-level `buildCommand`.
- Do **not** add per-project `vercel.json` files unless explicitly required.
- Use **pnpm** only (never npm/yarn).

## Troubleshooting
- If a new Vercel project appears → delete it immediately.
- If a deployment fails for site/embed with `routes-manifest.json` missing → confirm the project’s Build Command is `pnpm build` and that no repo-level `buildCommand` exists.
- If GitHub pushes don’t trigger deploys → check Vercel Git integration and webhooks.
 