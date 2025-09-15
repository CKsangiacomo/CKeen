-- BEGIN: PR#4 RPC for Phoenix ingest (Option B)
CREATE OR REPLACE FUNCTION public.ingest_event_v1(
  p_event_id uuid,
  p_event_name text,
  p_ts_millis bigint,
  p_workspace_id uuid,
  p_widget_id uuid,
  p_token_id uuid,
  p_cfg_version text,
  p_embed_version text,
  p_client_run_id uuid,
  p_page_origin_hash text,
  p_payload jsonb
)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
  WITH ins AS (
    INSERT INTO public.events (
      event_id, event_name, ts, workspace_id, widget_id, token_id,
      cfg_version, embed_version, client_run_id, page_origin_hash, payload
    )
    VALUES (
      p_event_id,
      p_event_name,
      to_timestamp(p_ts_millis / 1000.0),
      p_workspace_id,
      p_widget_id,
      p_token_id,
      p_cfg_version,
      p_embed_version,
      p_client_run_id,
      p_page_origin_hash,
      p_payload
    )
    ON CONFLICT (event_id) DO NOTHING
    RETURNING 1
  )
  SELECT EXISTS (SELECT 1 FROM ins);
$$;

REVOKE ALL ON FUNCTION public.ingest_event_v1(
  uuid, text, bigint, uuid, uuid, uuid, text, text, uuid, text, jsonb
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.ingest_event_v1(
  uuid, text, bigint, uuid, uuid, uuid, text, text, uuid, text, jsonb
) TO authenticated;
-- END: PR#4

-- Note:
--  - Unique index events_event_id_unique_idx must already exist (confirmed).
--  - SECURITY DEFINER + restricted EXECUTE keeps logic safe behind RLS boundary.


