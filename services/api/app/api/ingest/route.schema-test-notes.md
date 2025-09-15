# 1) Too large (expect 413)
curl -sS -X POST 'http://localhost:3001/api/ingest' \
  -H 'content-type: application/json' \
  --data-binary @<(python - <<'PY'
print('{'+'"x"'*9000+'}')
PY) | jq

# 2) Extra key (expect 400)
curl -sS -X POST 'http://localhost:3001/api/ingest' \
  -H 'content-type: application/json' \
  -d '{ "event_name":"widget_loaded","workspace_id":"w","widget_id":"i","extra":"nope" }' | jq

# 3) Valid minimal (expect ok:true)
curl -sS -X POST 'http://localhost:3001/api/ingest' \
  -H 'content-type: application/json' \
  -d '{ "event_name":"widget_loaded","workspace_id":"w","widget_id":"i" }' | jq


