-- Create a callable function to force PostgREST schema cache reload
CREATE OR REPLACE FUNCTION public.pgrst_reload()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  NOTIFY pgrst, 'reload schema';
$$;

GRANT EXECUTE ON FUNCTION public.pgrst_reload() TO anon, authenticated, service_role;


