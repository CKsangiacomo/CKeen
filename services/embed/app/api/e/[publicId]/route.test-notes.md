1) Token via query
<script src="http://localhost:3000/e/w_demo?token=et_VALID" async></script>
→ Loader fetches http://localhost:3001/api/cfg/w_demo?token=et_VALID
→ Imports http://localhost:3000/embed-bundle.js
→ Calls render(mount, { publicId, token, cfg })

2) Token via attribute
<script src="http://localhost:3000/e/w_demo" data-ckeen-token="et_VALID" async></script>
→ Same as above (query absent, attribute used)

3) Missing token (dev)
<script src="http://localhost:3000/e/w_demo" async></script>
→ Red error box after the script tag; no network calls

4) Invalid token (cfg returns 403)
→ Dev: red error box with "cfg_403"; Prod: silent no-op (only console.error suppressed by non-dev hosts)

5) Bundle contract
- Provide a dummy /public/embed-bundle.js that exports `render(mount, ctx)` during development to verify the call path.

