-- Fix PostgREST requirement: unconditional ON INSERT DO INSTEAD rule with RETURNING
-- Recreate rule to use a single INSERT ... SELECT ... RETURNING that matches view columns

DROP RULE IF EXISTS form_submissions_insert_rule ON public.form_submissions;

CREATE RULE form_submissions_insert_rule AS
ON INSERT TO public.form_submissions
DO INSTEAD
  INSERT INTO public.widget_submissions (widget_id, payload, ip, ua)
  SELECT wi.widget_id, NEW.payload, NEW.ip, NEW.ua
  FROM public.widget_instances wi
  WHERE wi.public_id = NEW.widget_instance_id
    AND wi.status = 'published'
  RETURNING 
    widget_submissions.id               AS id,
    widget_submissions.widget_id        AS widget_id,
    NEW.widget_instance_id              AS widget_instance_id,
    widget_submissions.payload          AS payload,
    widget_submissions.ip               AS ip,
    widget_submissions.ua               AS ua,
    widget_submissions.ts               AS ts;

-- Force PostgREST schema reload
NOTIFY pgrst, 'reload schema';


