# Playbook: Deployment

## Production
- Push to `main` triggers Vercel deploys (app/site/embed)
- Clear cache when lockfile or root install strategy changes

## Common Pitfalls (recently fixed)
- Frozen lockfile failures when running install from subdir (Root Directory set) → run installs at repo root with `--filter` and ensure `use-lockfile=true`.
- Missing Next routes manifest → ensure build runs in the subdir with `pnpm build` and correct Root Directory.
