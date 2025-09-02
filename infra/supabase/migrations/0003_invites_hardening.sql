-- Invite hardening: expirations, one-time use, and indexes
alter table invites add column if not exists expires_at timestamptz default (now() + interval '7 days');
alter table invites add column if not exists used_at timestamptz;
alter table invites add column if not exists used_by uuid;

create index if not exists idx_invites_token on invites(token);
create index if not exists idx_invites_email on invites(email);
create index if not exists idx_invites_expires_open on invites(expires_at) where used_at is null;

alter table invites drop constraint if exists invites_single_use;
alter table invites add constraint invites_single_use check (
  (used_at is null and used_by is null) or (used_at is not null and used_by is not null)
);

-- Minimal audit log table (dev-friendly; can refine later)
create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id),
  user_id uuid,
  action text not null,
  entity_type text,
  entity_id text,
  metadata jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz default now()
);

create index if not exists idx_audit_logs_workspace on audit_logs(workspace_id, created_at desc);
create index if not exists idx_audit_logs_action on audit_logs(action, created_at desc);
