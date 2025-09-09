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


