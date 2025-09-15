# Requires INTERNAL_ADMIN_KEY header and events being inserted
# 1) Query all months for a workspace
curl -sS 'http://localhost:3001/api/usage/workspace/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' \
  -H "x-ckeen-admin: $INTERNAL_ADMIN_KEY"

# 2) Filter by month (e.g., 202509)
curl -sS 'http://localhost:3001/api/usage/workspace/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa?yyyymm=202509' \
  -H "x-ckeen-admin: $INTERNAL_ADMIN_KEY"

# Expect: { ok: true, rows: [ { widget_id, yyyymm, count }, ... ] }


