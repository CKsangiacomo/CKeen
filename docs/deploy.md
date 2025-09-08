# Deployment Notes — c-keen-app (apps/app Root)

## Project and Source Layout
- Vercel project: c-keen-app
- Root Directory: apps/app
- vercel.json location: apps/app/vercel.json
- Only c-keen-app should exist. Do not create duplicate projects (e.g., c-keen).

## Build/Install/Dev Commands
These are configured by the project and vercel.json in apps/app. Do not set overrides in the Vercel dashboard.
- Install Command: pnpm install
- Build Command: pnpm build
- Development Command: pnpm dev

## Deployment Policy
- Auto-deploy: main branch only (Production builds come from main)
- Preview deploys: Allowed, but builds must use Root Directory = apps/app
- Do not enable or rely on overrides in Project Settings → Build & Deployment
- Do not add a vercel.json at the repository root

## Troubleshooting
- Deploy doesn’t trigger: Confirm GitHub integration is connected for this repo in Vercel (Project Settings → Git).
- Wrong project builds: Delete the rogue project in Vercel (Settings → General → Danger Zone), leaving only c-keen-app.
- Overrides reappear: Reset overrides in Project Settings → Build & Deployment and ensure vercel.json remains only in apps/app.

## Notes
- Keep the monorepo structure intact. All app code for this deploy lives under apps/app.
- Future pushes to main automatically trigger new deployments in c-keen-app.
