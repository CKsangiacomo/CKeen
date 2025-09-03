-- Drop the existing rule
DROP RULE IF EXISTS form_submissions_insert_rule ON public.form_submissions;

-- Recreate the rule with proper RETURNING support
CREATE OR REPLACE RULE form_submissions_insert_rule AS
ON INSERT TO public.form_submissions
DO INSTEAD 
INSERT INTO public.widget_submissions (widget_id, payload, ip, ua)
SELECT 
    wi.widget_id,
    NEW.payload,
    NEW.ip,
    NEW.ua
FROM public.widget_instances wi
WHERE wi.public_id = NEW.widget_instance_id
  AND wi.status = 'published'
RETURNING 
    id,
    widget_id,
    (SELECT public_id FROM public.widget_instances 
     WHERE widget_id = widget_submissions.widget_id 
     AND status = 'published' 
     LIMIT 1) AS widget_instance_id,
    payload,
    ip,
    ua,
    ts;

-- Force PostgREST schema cache refresh
NOTIFY pgrst, 'reload schema';


