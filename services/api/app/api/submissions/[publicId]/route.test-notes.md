1) Valid submit
curl -sS -X POST 'http://localhost:3001/api/submissions/w_demo' \
  -H 'content-type: application/json' \
  -d '{"token":"et_VALID","payload":{"name":"Alice","message":"Hi"}}'
→ 200 { "ok": true }

2) Rate limited
- Send 61 requests in <60s for same token.
→ 429 { "ok": false, "error": "rate_limited" }

3) PII rejected
curl -sS -X POST 'http://localhost:3001/api/submissions/w_demo' \
  -H 'content-type: application/json' \
  -d '{"token":"et_VALID","payload":{"email":"a@b.com"}}'
→ 400 { "ok": false, "error": "invalid_input" }

4) Unknown widget
curl -sS -X POST 'http://localhost:3001/api/submissions/w_unknown' \
  -H 'content-type: application/json' \
  -d '{"token":"et_VALID","payload":{"ok":true}}'
→ 400 { "ok": false, "error": "unknown_widget" }

