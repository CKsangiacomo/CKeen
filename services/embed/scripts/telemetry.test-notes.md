1) Render:
<script src="http://localhost:3000/e/w_demo?token=et_VALID" async></script>

2) If cfg has workspace_id/widget_id:
- Open Network tab, filter "ingest"
- Expect 200 with { ok:true, inserted:true } on first load; duplicate false on reload if event_id repeated (not guaranteed).

3) If cfg lacks IDs:
- No POST occurs (safe skip).

Important: verify request body does NOT contain IP/UA/raw URL, only envelope fields.


