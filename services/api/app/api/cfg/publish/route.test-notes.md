# Requires INTERNAL_ADMIN_KEY, EDGE_CONFIG_ID, VERCEL_API_TOKEN (server env)
# 1) Publish
curl -sS -X POST 'http://localhost:3001/api/cfg/publish' \
  -H 'content-type: application/json' \
  -H "x-ckeen-admin: $INTERNAL_ADMIN_KEY" \
  -d '{
    "public_id":"w_demo",
    "workspace_id":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    "widget_id":"bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    "theme":"light",
    "variant":"default",
    "publishHash":"p1",
    "props": { "title":"Hello" }
  }'
# Expect { ok: true }

# 2) Read via Edge route (token required)
# GET /api/cfg/w_demo?token=et_VALID
# Expect the JSON you published (source=atlas in logs)
