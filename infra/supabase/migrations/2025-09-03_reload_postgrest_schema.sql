-- Force PostgREST to refresh its schema cache after view/rule changes
NOTIFY pgrst, 'reload schema';


