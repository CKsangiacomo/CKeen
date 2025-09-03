-- Embed submissions compat: ensure ip + ua are supported end-to-end.
-- Idempotent, safe to re-run.

-- 1) Canonical table columns
ALTER TABLE public.widget_submissions
  ADD COLUMN IF NOT EXISTS ip inet,
  ADD COLUMN IF NOT EXISTS ua text;

-- 2) View (drop/create)
DROP VIEW IF EXISTS public.form_submissions;

CREATE VIEW public.form_submissions AS
SELECT
  id,
  widget_id,
  payload,
  ts,
  ip,
  ua
FROM public.widget_submissions;

-- 3) Insert rule (routes view inserts into base table)
CREATE OR REPLACE RULE form_submissions_insert AS
ON INSERT TO public.form_submissions
DO INSTEAD
  INSERT INTO public.widget_submissions (widget_id, payload, ip, ua)
  VALUES (NEW.widget_id, NEW.payload, NEW.ip, NEW.ua)
  RETURNING *;

-- 4) Minimal grants (adjust if you use stricter RLS)
GRANT SELECT, INSERT ON public.form_submissions TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.widget_submissions TO service_role;

-- 5) Ask PostgREST to reload schema cache (Supabase)
NOTIFY pgrst, 'reload schema';


