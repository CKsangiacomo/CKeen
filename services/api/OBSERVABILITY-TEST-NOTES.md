# Observability smoke

Start: `pnpm dev:api`

1) /api/ingest first insert
   - Expect log: svc=paris route=ingest ok=true inserted=true status=200 dur_ms=...
2) /api/ingest duplicate
   - Expect log: svc=paris route=ingest ok=true inserted=false status=200 ...
3) /api/submissions invalid
   - Expect log: svc=paris route=submissions ok=false status=400 reason=invalid_input ...
4) /api/submissions rate-limited
   - Expect log: svc=paris route=submissions ok=false status=429 reason=rate_limited ...
5) /api/cfg
   - Atlas hit: ... source=atlas ...
   - Legacy fallback: ... source=legacy ...
6) Deploy markers
   - On dev start (module load): svc=paris route=deploy component=ingest event=deploy_start

Notes:
- Logs are privacy-safe; verify no tokens/payloads/URLs emitted.
