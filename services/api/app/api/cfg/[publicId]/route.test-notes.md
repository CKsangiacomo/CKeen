Manual test matrix (with local ENV present: SUPABASE_URL, SUPABASE_SERVICE_ROLE, EDGE_CONFIG bound):

1) Missing token
   GET /api/cfg/w_demo
   → 401 { ok:false, error:"missing_token" }

2) Invalid token
   GET /api/cfg/w_demo?token=et_notreal
   → 403 { ok:false, error:"invalid_or_expired_token" }

3) Valid token + Atlas miss
   - Ensure atlas key atlas:cfg:w_demo absent
   GET /api/cfg/w_demo?token=et_VALID
   → 200 legacy stub JSON, Cache-Control: no-store (max-age=0)

4) Valid token + Atlas hit
   - Preload Edge Config key atlas:cfg:w_demo with a small JSON (via Vercel UI/CLI)
   GET /api/cfg/w_demo?token=et_VALID
   → 200 that JSON, Cache-Control: max-age≈300

Notes:
- This route does NOT write to Atlas; write-through/invalidation ships later as a Node route.

