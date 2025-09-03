-- Idempotent: create result type if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public' AND t.typname = 'create_widget_with_instance_result'
  ) THEN
    CREATE TYPE public.create_widget_with_instance_result AS (
      public_key text,
      public_id  text
    );
  END IF;
END $$;

-- Function: atomically create widget + published instance
CREATE OR REPLACE FUNCTION public.create_widget_with_instance(
  p_name            text,
  p_type            text,
  p_public_key      text,
  p_public_id       text,
  p_widget_config   jsonb,
  p_instance_config jsonb
)
RETURNS SETOF public.create_widget_with_instance_result
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_widget_id bigint;
BEGIN
  -- 1) insert widget (align with your widgets columns)
  INSERT INTO public.widgets (name, type, public_key, config)
  VALUES (COALESCE(p_name, 'Anonymous Widget'), COALESCE(p_type, 'contact-form'), p_public_key, COALESCE(p_widget_config, '{}'::jsonb))
  RETURNING id INTO v_widget_id;

  -- 2) insert instance as published (align with widget_instances columns)
  INSERT INTO public.widget_instances (widget_id, public_id, status, config)
  VALUES (v_widget_id, p_public_id, 'published', COALESCE(p_instance_config, '{}'::jsonb));

  RETURN QUERY
    SELECT p_public_key::text, p_public_id::text;
END
$fn$;

COMMENT ON FUNCTION public.create_widget_with_instance(text, text, text, text, jsonb, jsonb)
IS 'Creates a widget and a published widget_instance in a single transaction; returns (public_key, public_id).';

-- Optional: allow authenticated users to execute (service role bypasses RLS anyway)
GRANT EXECUTE ON FUNCTION public.create_widget_with_instance(text, text, text, text, jsonb, jsonb) TO authenticated;


