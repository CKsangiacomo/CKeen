<!-- =============================== -->
<!-- File: debugging.updated.md -->
<!-- =============================== -->

# Debugging Playbook

## General
1. Verify Node 20.x and pnpm are installed.
2. Run `pnpm install --frozen-lockfile` at repo root.
3. Confirm you are working in the correct Vercel project for the affected app.
4. Use `pnpm -r build` to ensure all packages compile before local runs.

## Studio Shell Issues

### Studio assets not loading
**Symptoms:** Builder screens are blank; console shows 404 for Studio files.  
**Checks:**
- Host serves:
  - `/vendor/studio/studio.css`
  - `/vendor/studio/studio.js`
- Verify 200 responses in DevTools → Network.
- Confirm build step was run: `pnpm --filter @ck/studio-shell build` and artifacts were copied to host `/public/vendor/studio/`.

**Fixes:**
- Rebuild Studio package and re-copy `dist/*` to the host’s `/public/vendor/studio/`.
- Redeploy the host app (push to main / trigger Vercel deployment).

---

### `studio:ready` never fires
**Symptoms:** Host code waiting on `Studio.ready()` hangs or events never appear.  
**Checks:**
- Ensure `<script src="/vendor/studio/studio.js"></script>` is included exactly once and after DOM (or use `defer`).
- Required slot IDs are present in the host DOM:
  - `#slot-templateRow` (optional: auto-hides when empty)
  - `#slot-left`
  - `#slot-center` (must contain `#centerCanvas`)
  - `#slot-right`
- From console: `await window.Studio?.ready()` — should resolve with current state.

**Fixes:**
- Load Studio script earlier (with `defer`) or call host init after `Studio.ready()`.
- Add missing slots; ensure `#centerCanvas` exists inside `#slot-center`.

---

### Theme / viewport not applying
**Symptoms:** Toggling light/dark or desktop/mobile has no visual effect.  
**Checks:**
- Preview content is nested inside **`#centerCanvas`** (not elsewhere).
- DevTools: `#centerCanvas` has classes:
  - `.studio-theme-light` or `.studio-theme-dark`
  - `.studio-viewport-desktop` or `.studio-viewport-mobile`

**Fixes:**
- Move preview container inside `#centerCanvas`.
- Ensure host did not override or remove Studio-applied classes.

---

### Mount / unmount errors
**Symptoms:** Exceptions like “Slot center already occupied” or “Cannot unmount empty slot”.  
**Why:** Studio **throws** on slot conflicts by design.  
**Fixes:**
- Always `unmount(slot)` before re-`mount(slot, el)`.
- Reuse a single root element per slot; update its children instead of remounting the slot root.

---

### Panel collapse feedback loops
**Symptoms:** Infinite toggling, UI flapping.  
**Checks:**
- Listen for `studio:panel` payload `{ side, collapsed, source }`.
- If you programmatically call `togglePanel(..., 'host')`, ignore subsequent `studio:panel` events where `source === 'host'`.

**Fixes:**
- Gate your handler on `source === 'user'` when reflecting UI state back into your store.

---

### CSS collisions (Studio vs host content)
**Symptoms:** Unexpected spacing/overflow or fonts.  
**Checks:**
- Studio avoids Shadow DOM; use **CSS containment** around host content.
- Confirm Dieter tokens are loaded and not overridden downstream.

**Fixes:**
- Wrap host content in a container with `contain: layout style;` or similar.
- Scope host styles away from `.studio-*` classes.

---

### Asset caching / stale files
**Symptoms:** Changes to Studio don’t appear after deploy.  
**Checks:**
- Vercel cache for `/vendor/studio/*`.
- Service Worker (if any) on the host app.

**Fixes:**
- Invalidate Vercel cache or bump asset filename/version.
- Clear or update SW precache list; redeploy.

---

## Quick Console Recipes
- Await readiness:
  ```js
  await window.Studio.ready();

  # Playbook: Incident Response

- Identify failing deployment (app/site/embed)
- Check Vercel logs; validate install step uses root lockfile
- Roll back to previous green deploy if needed


# Playbook: Deployment

## Production
- Push to `main` triggers Vercel deploys (app/site/embed)
- Clear cache when lockfile or root install strategy changes

## Common Pitfalls (recently fixed)
- Frozen lockfile failures when running install from subdir (Root Directory set) → run installs at repo root with `--filter` and ensure `use-lockfile=true`.
- Missing Next routes manifest → ensure build runs in the subdir with `pnpm build` and correct Root Directory.

#### Playbook — pnpm Version Conflict (ERR_PNPM_BAD_PM_VERSION)
**Symptoms:** “Multiple versions of pnpm specified” in CI logs.  
**Fix:**  
1. Confirm root `package.json` `"packageManager"` (canonical).  
2. Remove any pnpm `version:` from workflows.  
3. Ensure deployable packages set `"engines": { "node": "20.x" }`.  
4. Re-run CI with `pnpm install --frozen-lockfile`.  
**Do Not:** Use `--no-frozen-lockfile` or pin a different pnpm in CI.

#### Playbook — Frozen Lockfile Failure
**Symptoms:** `pnpm install --frozen-lockfile` fails in CI.  
**Fix:**  
1. DO NOT bypass.  
2. Run `pnpm install` locally with the canonical pnpm, commit updated lockfile.  
3. Re-run CI.  
**Guardrail:** CI step fails if `--no-frozen-lockfile` is used.
