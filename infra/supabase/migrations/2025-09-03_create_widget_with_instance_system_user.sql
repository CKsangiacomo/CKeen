-- 1) Result type (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public' AND t.typname = 'create_widget_with_instance_result'
  ) THEN
    CREATE TYPE public.create_widget_with_instance_result AS (
      public_key text,
      public_id  text
    );
  END IF;
END $$;

-- 2) Reserve a stable system user id (change it if you already have one)
-- We do NOT relax NOT NULL on widgets.user_id; we ensure a real owner.
-- If public.profiles exists with PK user_id, this upserts a visible profile row.
-- If you have FK to auth.users, we will add that user later via Auth Admin API.
DO $$
DECLARE
  v_system_user uuid := '11111111-1111-1111-1111-111111111111';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = v_system_user) THEN
    INSERT INTO public.profiles (user_id, name, company, subscription_status, created_at)
    VALUES (v_system_user, 'Clickeen System', 'Clickeen', 'system', now())
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
END $$;

-- 3) Replace RPC to always set the system user as owner for anon widgets
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
  v_widget_id   bigint;
  v_system_user uuid := '11111111-1111-1111-1111-111111111111';
BEGIN
  -- Insert widget with strict ownership
  INSERT INTO public.widgets (user_id, name, type, public_key, config, status)
  VALUES (
    v_system_user,
    COALESCE(p_name, 'Anonymous Widget'),
    COALESCE(p_type, 'contact-form'),
    p_public_key,
    COALESCE(p_widget_config, '{}'::jsonb),
    'active'
  )
  RETURNING id INTO v_widget_id;

  -- Insert published instance
  INSERT INTO public.widget_instances (widget_id, public_id, status, config)
  VALUES (
    v_widget_id,
    p_public_id,
    'published',
    COALESCE(p_instance_config, '{}'::jsonb)
  );

  RETURN QUERY SELECT p_public_key::text, p_public_id::text;
END
$fn$;

-- (Optional) Allow service role to execute explicitly
GRANT EXECUTE ON FUNCTION public.create_widget_with_instance(
  text, text, text, text, jsonb, jsonb
) TO postgres;


