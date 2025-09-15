# Token routes (internal)
# set header: -H 'x-ckeen-admin: $INTERNAL_ADMIN_KEY'

# 1) Issue for publicId
curl -sS -X POST 'http://localhost:3001/api/tokens/issue' \
  -H 'content-type: application/json' \
  -H "x-ckeen-admin: $INTERNAL_ADMIN_KEY" \
  -d '{"public_id":"w_demo","ttl_minutes":1440}'

# 2) Rotate (extend ttl)
curl -sS -X POST 'http://localhost:3001/api/tokens/rotate' \
  -H 'content-type: application/json' \
  -H "x-ckeen-admin: $INTERNAL_ADMIN_KEY" \
  -d '{"token_id":"<uuid>","ttl_minutes":1440}'

# 3) Revoke
curl -sS -X POST 'http://localhost:3001/api/tokens/revoke' \
  -H 'content-type: application/json' \
  -H "x-ckeen-admin: $INTERNAL_ADMIN_KEY" \
  -d '{"token_id":"<uuid>"}'

Expected:
- 200 with { ok:true, token, expires_at, token_id } on issue/rotate.
- 204 on revoke.
- 403 forbidden if header missing/wrong.
