# Deployment: c-keen-site

- Stack: Next.js on Vercel  
- Hosts: Marketing site and Prague gallery  
- Root Directory: apps/site  
- Build Command: pnpm build

# Deployment: c-keen-embed

- Stack: Edge Functions on Vercel  
- Hosts: Venice runtime, Atlas cache (KV)  
- Root Directory: services/embed  
- Build Command: pnpm build  
- Notes: Strict size budget; preview belongs here.

# Deployment: c-keen-app

- Stack: Next.js on Vercel  
- Hosts: Bob (Builder & Studio), Robert UI, Tokyo UI  
- Serves: Oslo assets at /dieter/* (components.html, icons, tokens)  
- Root Directory: apps/app  
- Build Command: pnpm build  
- Install Command: (Vercel default) pnpm install  
- Notes: Push to main → production deploy via Vercel Git integration.




### Runtime & Assets (Frozen)
- Vercel uses Node 20 as declared by `"engines": { "node": "20.x" }`.  
- Dieter assets are served as static files from `apps/app/public/dieter/` produced by **copy-on-build**. Symlinks are forbidden.

# Deployment: c-keen-api

- Stack: Next.js (Serverless Functions) on Vercel
- Purpose: **Paris — HTTP API** (token issuance; submissions; telemetry ingest)
- Root Directory: `services/api`
- Install Command: `pnpm install`
- Build Command: `pnpm build`
- Node: 20.x

## Environment (Vercel project)
- `SUPABASE_URL` — server
- `SUPABASE_SERVICE_ROLE_KEY` — server
- `SENTRY_DSN` — server
- `EDGE_CONFIG` — server (auto-provisioned via **Edge Config** Integration on this project)

### Notes
- No `NEXT_PUBLIC_*` variants of server credentials.
- Writes to Edge Config happen **only in CI** using `VERCEL_API_TOKEN` (GitHub Actions secret), not at runtime.