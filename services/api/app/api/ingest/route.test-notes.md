# Manual checks (requires SUPABASE_URL, SUPABASE_SERVICE_ROLE configured)

1) First insert → inserted:true
curl -sS -X POST http://localhost:3001/api/ingest \
  -H 'content-type: application/json' \
  -d '{
    "event_name":"widget_loaded",
    "event_id":"11111111-1111-4111-8111-111111111111",
    "ts": 1736892345123,
    "workspace_id":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    "widget_id":"bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    "payload":{"render_ms":42}
  }'

2) Duplicate → inserted:false
curl -sS -X POST http://localhost:3001/api/ingest \
  -H 'content-type: application/json' \
  -d '{
    "event_name":"widget_loaded",
    "event_id":"11111111-1111-4111-8111-111111111111",
    "ts": 1736892345123,
    "workspace_id":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    "widget_id":"bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    "payload":{}
  }'

3) PII rejection
curl -sS -X POST http://localhost:3001/api/ingest \
  -H 'content-type: application/json' \
  -d '{
    "event_name":"widget_loaded",
    "event_id":"22222222-2222-4222-8222-222222222222",
    "ts":1736892345123,
    "workspace_id":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    "widget_id":"bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    "payload":{"email":"a@b.com"}
  }'
# => 400 invalid_envelope

