# Requires INTERNAL_ADMIN_KEY, EDGE_CONFIG_ID, VERCEL_API_TOKEN, SUPABASE envs loaded for Paris

curl -sS -X POST 'http://localhost:3001/api/admin/publish-and-issue' \
  -H 'content-type: application/json' \
  -H "x-ckeen-admin: $INTERNAL_ADMIN_KEY" \
  -d '{
    "public_id":"w_demo",
    "ttl_minutes": 1440,
    "theme":"light",
    "variant":"default",
    "publishHash":"p1",
    "props": { "title":"Hello" }
  }'

# Expect:
# {
#   "ok": true,
#   "cfg_published": true,
#   "token": "et_...",
#   "token_id": "<uuid>",
#   "expires_at": "...",
#   "envelope": { ...workspace_id, widget_id, ... }
# }
