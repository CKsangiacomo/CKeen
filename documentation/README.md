# Clickeen Docs

**Start here.** This repository uses an AI-first documentation system.

## Reading Order
1. CONTEXT.md — canonical, AI-first rules and map  
2. ARCHITECTURE.md — flows and cross-system diagrams/links  
3. systems/ — one file per system (core + supporting)  
4. deployments/ — where each system runs (3 Vercel projects + Supabase)  
5. playbooks/ — how to deploy, debug, and respond to incidents  
6. decisions/ — ADRs (why choices were made)  
7. migrations/ — breaking changes and upgrade paths

## Protected Files (do not edit here)
- PRDs/Dieter.md
- PRDs/Studio.md
- Services.md (legacy, kept for reference)

## Generation
- Run `node tools/docs/generate-services.mjs` to refresh `SERVICES.generated.md`.

---

## How to Use These Docs
- This documentation is **binding**; CI enforces compliance (single pnpm source, frozen lockfile, Node 20 engines, copy-on-build).  
- If CI fails, consult **Playbooks** first; do not change workflow tool versions.

### Key References
- `CONTEXT.md`
- `ADRdecisions.md` (see ADR-004/005)
- `Playbooks.md`
- `migrations.md`

