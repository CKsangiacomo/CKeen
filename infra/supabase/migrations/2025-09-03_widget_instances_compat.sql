-- Align widget_instances schema with embed service expectations (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'widget_instances' AND column_name = 'allowed_domains'
  ) THEN
    ALTER TABLE public.widget_instances
      ADD COLUMN allowed_domains text[] DEFAULT '{}';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'widget_instances' AND column_name = 'show_badge'
  ) THEN
    ALTER TABLE public.widget_instances
      ADD COLUMN show_badge boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'widget_instances' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE public.widget_instances
      ADD COLUMN created_by uuid NULL;
  END IF;
END $$;


