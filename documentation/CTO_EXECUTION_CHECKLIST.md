# CTO Execution Checklist (Complete Version)

0. Project Constants (State Once Per Session)

PROJECT STRUCTURE:
- Monorepo with pnpm workspaces
- Package manager: pnpm (NOT npm, NOT yarn)
- Node version: 20.x
- Main app path: /apps/app
- Services: /services/embed
- Design system: /dieter
- Docs location: /docs

VERCEL PROJECTS (DO NOT CREATE NEW ONES):
- c-keen-app → deploys from /apps/app
- c-keen-embed → deploys from /services/embed
- c-keen-site → marketing site
- c-keen-dieter → design system docs

GitHub: CKsangiacomo/Ckeen

NEVER USE:
- npm install → use: pnpm install
- yarn → use: pnpm
- node_modules at package level → workspace deps
- New Vercel projects → use existing ones above

1. Context Check (Start Every Session)

Read local docs if they exist:
- /docs/PROJECT_SETUP.md
- /docs/DEPLOY.md
- /docs/ARCHITECTURE.md
- /docs/SCHEMA.md
- /docs/STATE.md
- /docs/DECISIONS.md

2. Before Any Task
- What’s the current state?
- What constraints exist?
- What was done last session?
- Which branch are we on?
- Is this a monorepo task? (check pnpm workspace)
- Which Vercel project does this affect?

3. Core Development Rules
- Never guess — if not specified, ask
- One complete task before starting another
- No placeholders — working code only
- Document WHY in commits, not just what
- Respect monorepo — changes affect workspace
- Check deployment — which Vercel project?

4. Architecture Principles
- Separation: Keep layers isolated (DB/API/UI)
- Flexibility: No hardcoded business assumptions
- Size limits: Keep bundles small
- No dependencies between parallel features
- Workspace aware: Use pnpm workspace commands

5. Quality Gates

Backend:
- Migrations match schema?
- API returns correct data?
- Error handling present?
- Tests run with pnpm test?

Frontend:
- No console errors?
- Works in Chrome/Safari/Firefox?
- Responsive design working?
- Bundle size within limits?

CI/CD:
- Using pnpm in workflows?
- --frozen-lockfile in CI?
- Correct Node version?
- Deploying to correct Vercel project?

6. Update Local Docs After Changes
- /docs/SCHEMA.md
- /docs/STATE.md
- /docs/DECISIONS.md
- /docs/PROJECT_SETUP.md
- /docs/DEPLOY.md

7. Git Operations

```
git add -A
git commit -m "type(scope): what and why"
git push origin [branch]
```

8. Common Monorepo Commands

```
pnpm install --frozen-lockfile
pnpm --filter [package] [command]
pnpm exec [tool]
pnpm add [dep] --workspace-root
pnpm add [dep] --filter [package]
```

9. Deployment Checks
- /apps/app → c-keen-app.vercel.app
- /services/embed → c-keen-embed.vercel.app
- /site → c-keen-site.vercel.app
- /dieter → c-keen-dieter.vercel.app

10. Self-Check Before Moving On
- Does it work end-to-end?
- Will I understand this in 6 months?
- Is this documented?
- Did I use pnpm (not npm/yarn)?
- Will it deploy to the right Vercel project?

11. Output Format for Cursor
- One markdown block with: instructions, file changes, commit message, acceptance criteria

12. Meta Rules
- If explaining >3x → document in /docs/
- If CI fails → check pnpm/monorepo setup first
- If import fails → check workspace dependencies
- If deployment fails → check correct Vercel project
- If confused → read /docs/PROJECT_SETUP.md

13. Create Missing Docs

If these don’t exist, create them:
- /docs/PROJECT_SETUP.md
- /docs/DEPLOY.md
- /docs/ARCHITECTURE.md
- /docs/SCHEMA.md
- /docs/STATE.md
- /docs/DECISIONS.md
