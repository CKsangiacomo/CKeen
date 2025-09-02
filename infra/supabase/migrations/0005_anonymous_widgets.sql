-- Allow anonymous widgets (workspace_id can be null)
ALTER TABLE widget_instances ALTER COLUMN workspace_id DROP NOT NULL;

-- Add a comment to document this change
COMMENT ON COLUMN widget_instances.workspace_id IS 'NULL for anonymous widgets, UUID for workspace widgets';
