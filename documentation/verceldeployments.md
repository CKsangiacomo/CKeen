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
- Serves: Dieter assets at /dieter/* (components.html, icons, tokens)  
- Root Directory: apps/app  
- Build Command: pnpm build  
- Install Command: (Vercel default) pnpm install  
- Notes: Push to main → production deploy via Vercel Git integration.




### Runtime & Assets (Frozen)
- Vercel uses Node 20 as declared by `"engines": { "node": "20.x" }`.  
- Dieter assets are served as static files from `apps/app/public/dieter/` produced by **copy-on-build**. Symlinks are forbidden.
- Edge Config writes are prohibited at runtime in P1; all writes happen in CI only.
### Additional server env (c-keen-api)
- `INTERNAL_ADMIN_KEY` — header `x-ckeen-admin` guard for admin endpoints
- `EDGE_CONFIG` — provisioned by Vercel Edge Config Integration
- `EDGE_CONFIG_ID` — Edge Config store id (only needed if runtime writes enabled)
- `VERCEL_API_TOKEN` — Vercel API token (only needed if runtime writes enabled; rotate regularly)
