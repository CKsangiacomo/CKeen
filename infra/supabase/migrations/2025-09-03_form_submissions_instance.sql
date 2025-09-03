-- 1) Helper index for fast lookups by instance id + status (with partial index optimization)
CREATE INDEX IF NOT EXISTS idx_widget_instances_public_id_status
  ON public.widget_instances(public_id, status)
  WHERE status = 'published';  -- Partial index for faster lookups

-- 2) Drop rule first (it depends on the view)
DROP RULE IF EXISTS form_submissions_insert_rule ON public.form_submissions;

-- 3) Recreate the view so it EXPOSES widget_instance_id
DROP VIEW IF EXISTS public.form_submissions;
CREATE VIEW public.form_submissions AS
SELECT
  ws.id,
  ws.widget_id,
  wi.public_id AS widget_instance_id,  -- visible to clients & to the rule's NEW
  ws.payload,
  ws.ip,
  ws.ua,
  ws.ts
FROM public.widget_submissions ws
LEFT JOIN public.widget_instances wi
  ON wi.widget_id = ws.widget_id
 AND wi.status   = 'published';

-- 4) Recreate the INSERT rule via function
CREATE OR REPLACE FUNCTION insert_form_submission(
    p_widget_instance_id TEXT,
    p_payload JSONB,
    p_ip INET,
    p_ua TEXT
) RETURNS TABLE(
    id UUID,
    widget_id UUID, 
    widget_instance_id TEXT,
    payload JSONB,
    ip INET,
    ua TEXT,
    ts TIMESTAMPTZ
) 
LANGUAGE plpgsql 
AS $$
DECLARE
    v_widget_id UUID;
    v_inserted_id UUID;
BEGIN
    SELECT wi.widget_id INTO v_widget_id
    FROM public.widget_instances wi
    WHERE wi.public_id = p_widget_instance_id
      AND wi.status = 'published';
    
    IF v_widget_id IS NULL THEN
        RAISE EXCEPTION 'Widget instance not found or not published: %', p_widget_instance_id;
    END IF;
    
    INSERT INTO public.widget_submissions (widget_id, payload, ip, ua)
    VALUES (v_widget_id, p_payload, p_ip, p_ua)
    RETURNING public.widget_submissions.id INTO v_inserted_id;
    
    RETURN QUERY
    SELECT 
        v_inserted_id,
        v_widget_id,
        p_widget_instance_id,
        p_payload,
        p_ip,
        p_ua,
        NOW();
END;
$$;

CREATE OR REPLACE RULE form_submissions_insert_rule AS
ON INSERT TO public.form_submissions
DO INSTEAD 
    SELECT * FROM insert_form_submission(
        NEW.widget_instance_id,
        NEW.payload, 
        NEW.ip::INET,  -- explicit cast
        NEW.ua
    );

-- 5) Minimal grants for PostgREST
GRANT SELECT, INSERT ON public.form_submissions      TO anon, authenticated;
GRANT SELECT        ON public.widget_instances       TO anon, authenticated;
GRANT SELECT, INSERT ON public.widget_submissions    TO service_role;

-- 6) Force PostgREST schema cache refresh
NOTIFY pgrst, 'reload schema';


