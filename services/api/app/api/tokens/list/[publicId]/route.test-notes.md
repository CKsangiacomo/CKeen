# Requires INTERNAL_ADMIN_KEY
# List tokens for a publicId
curl -sS 'http://localhost:3001/api/tokens/list/w_demo' \
  -H "x-ckeen-admin: $INTERNAL_ADMIN_KEY"

# Expect:
# {
#   "ok": true,
#   "tokens": [
#     { "id":"<uuid>", "token":"et_...", "expires_at":"...", "created_at":"...", "rotated_at": "...", "widget_instance_id":"<uuid>" },
#     ...
#   ]
# }


