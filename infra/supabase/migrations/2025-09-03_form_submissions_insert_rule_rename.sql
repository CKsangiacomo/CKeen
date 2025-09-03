-- Ensure the insert rule matches PostgREST expectations: unconditional rule named *_insert with RETURNING
DROP RULE IF EXISTS form_submissions_insert ON public.form_submissions;
DROP RULE IF EXISTS form_submissions_insert_rule ON public.form_submissions;

CREATE RULE form_submissions_insert AS
ON INSERT TO public.form_submissions
DO INSTEAD 
  SELECT * FROM insert_form_submission(
    NEW.widget_instance_id,
    NEW.payload,
    NEW.ip::INET,
    NEW.ua
  );

NOTIFY pgrst, 'reload schema';


