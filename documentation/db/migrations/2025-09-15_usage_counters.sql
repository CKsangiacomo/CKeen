-- BEGIN: P1 usage counters (monthly)
CREATE TABLE IF NOT EXISTS public.usage_counters_monthly (
  workspace_id uuid NOT NULL,
  widget_id uuid NOT NULL,
  yyyymm integer NOT NULL,          -- e.g., 202509
  count bigint NOT NULL DEFAULT 0,
  PRIMARY KEY (workspace_id, widget_id, yyyymm)
);

CREATE OR REPLACE FUNCTION public.usage_counter_bump_v1()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_month integer;
BEGIN
  IF NEW.event_name <> 'widget_loaded' THEN
    RETURN NEW;
  END IF;

  -- derive month from NEW.ts (timestamptz)
  v_month := (EXTRACT(YEAR FROM NEW.ts)::int) * 100 + EXTRACT(MONTH FROM NEW.ts)::int;

  INSERT INTO public.usage_counters_monthly (workspace_id, widget_id, yyyymm, count)
  VALUES (NEW.workspace_id, NEW.widget_id, v_month, 1)
  ON CONFLICT (workspace_id, widget_id, yyyymm)
  DO UPDATE SET count = public.usage_counters_monthly.count + 1;

  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'usage_counter_bump_on_events'
  ) THEN
    CREATE TRIGGER usage_counter_bump_on_events
      AFTER INSERT ON public.events
      FOR EACH ROW
      EXECUTE FUNCTION public.usage_counter_bump_v1();
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS usage_counters_monthly_workspace_idx
  ON public.usage_counters_monthly (workspace_id, yyyymm);
-- END: P1 usage counters


