-- Align form_submissions to accept widget_instance_id as expected by embed.
-- Idempotent and safe to re-run.

-- Ensure base table has ip/ua (no-op if already present)
ALTER TABLE public.widget_submissions
  ADD COLUMN IF NOT EXISTS ip inet,
  ADD COLUMN IF NOT EXISTS ua text;

-- Recreate view mapping widget_id -> widget_instance_id
DROP VIEW IF EXISTS public.form_submissions;

CREATE VIEW public.form_submissions AS
SELECT
  id,
  widget_id AS widget_instance_id,
  payload,
  ts,
  ip,
  ua
FROM public.widget_submissions;

-- Insert rule: accept widget_instance_id and route to widget_submissions.widget_id
CREATE OR REPLACE RULE form_submissions_insert AS
ON INSERT TO public.form_submissions
DO INSTEAD
  INSERT INTO public.widget_submissions (widget_id, payload, ip, ua)
  VALUES (NEW.widget_instance_id, NEW.payload, NEW.ip, NEW.ua)
  RETURNING *;

-- Minimal grants
GRANT SELECT, INSERT ON public.form_submissions TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.widget_submissions TO service_role;

-- Ask PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';


