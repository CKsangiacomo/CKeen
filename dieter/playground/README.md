# Dieter Playground

This is the **Dieter design system playground**, hosted as a separate Vercel project.

## Purpose
- Internal preview of Dieter tokens, guardrails, and components.
- Not intended for production users.
- Must remain **noindex** to avoid leaking into search engines.

## Deployment
- Root directory: `dieter/playground`
- Entry point: `index.html`
- Framework preset: **Other** (static export, no build step)
- Vercel project: `c-keen-dieter`
- Default URL: https://c-keen-dieter.vercel.app  
  (custom domains can be attached later, e.g. `dieter.c-keen.app`)

## Controls
- `robots.txt` blocks crawling (`User-agent: * / Disallow: /`).
- `<meta name="robots" content="noindex,nofollow">` is included in `index.html`.
- `vercel.json` enforces noindex headers.

## Notes
- Keep Dieter playground isolated; do **not** merge into `app` or `site`.
- Intended for design/dev only (component previews, tokens).
- CI/CD is handled via GitHub → Vercel integration; deploys on push to `main`.

---

**Reminder:** If the playground ever needs password protection, enable Vercel’s built-in [Protection](https://vercel.com/docs/security/password-protection) for the project.
