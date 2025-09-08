# Deployment Guide

## Vercel Projects
These are the ONLY valid projects. Do not create new ones.

- **c-keen-app** → Root: `/apps/app` → https://c-keen-app.vercel.app  
- **c-keen-embed** → Root: `/services/embed` → https://c-keen-embed.vercel.app  
- **c-keen-site** → Root: `/site` → https://c-keen-site.vercel.app  
- **c-keen-dieter** → Root: `/dieter` → https://c-keen-dieter.vercel.app  

⚠️ **Warning:** Do not create new Vercel projects. All deployments must go to one of the above.

## Deployment Rules
- Branch: `main` → Production deploy
- Feature branches → Preview deploys (auto-enabled in Vercel)
- vercel.json lives inside each root folder (`/apps/app/vercel.json`, etc.)
- No vercel.json at repo root
- pnpm only (never npm/yarn)

## Troubleshooting
- If a new project appears in Vercel, delete it immediately
- If deployments fail, confirm Root Directory matches (apps/app, services/embed, site, dieter)
- If GitHub pushes don’t trigger deploys, check Vercel Git integration and webhooks
