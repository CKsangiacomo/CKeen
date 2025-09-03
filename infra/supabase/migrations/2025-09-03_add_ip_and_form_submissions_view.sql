-- Add ip column to canonical submissions table
ALTER TABLE public.widget_submissions
ADD COLUMN IF NOT EXISTS ip text;

-- Recreate the compatibility view used by embed
DROP VIEW IF EXISTS public.form_submissions;

CREATE VIEW public.form_submissions AS
SELECT
  id,
  widget_id,
  payload,
  ts,
  ip
FROM public.widget_submissions;

-- Route inserts through to widget_submissions (with ip passthrough)
CREATE OR REPLACE RULE form_submissions_insert AS
ON INSERT TO public.form_submissions
DO INSTEAD
  INSERT INTO public.widget_submissions (widget_id, payload, ip)
  VALUES (NEW.widget_id, NEW.payload, NEW.ip)
  RETURNING *;

-- Ensure PostgREST access
GRANT SELECT, INSERT ON public.form_submissions TO anon;


