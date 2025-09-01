-- core roles
create type user_role as enum ('owner','admin','editor','viewer','billing');

-- tenants
create table if not exists workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null,
  default_locale text not null default 'en-US',
  enabled_locales text[] not null default array['en-US'],
  created_at timestamptz default now()
);

create table if not exists workspace_members (
  workspace_id uuid references workspaces(id) on delete cascade,
  user_id uuid not null,
  role user_role not null default 'editor',
  created_at timestamptz default now(),
  primary key (workspace_id, user_id)
);

-- widgets registry and instances
create table if not exists widget_types (
  id text primary key,
  title text not null,
  config_schema jsonb not null default '{}'::jsonb
);

create table if not exists widget_instances (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  type_id text not null references widget_types(id),
  public_id text unique not null,
  version int not null default 1,
  status text not null default 'draft', -- draft|published
  config jsonb not null default '{}'::jsonb,
  allowed_domains text[] not null default '{}',
  show_badge boolean not null default true,
  created_by uuid not null,
  created_at timestamptz default now()
);

-- forms + submissions
create table if not exists forms (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  kind text not null,
  schema jsonb not null,
  created_at timestamptz default now()
);

create table if not exists form_submissions (
  id bigint generated always as identity primary key,
  widget_instance_id uuid references widget_instances(id) on delete cascade,
  form_id uuid references forms(id) on delete cascade,
  payload jsonb not null,
  ip inet, ua text,
  created_at timestamptz default now(),
  check ((widget_instance_id is not null) <> (form_id is not null))
);

-- events + usage + billing (capability model)
create table if not exists events (
  id bigint generated always as identity primary key,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  type text not null,
  source text not null,
  payload jsonb not null,
  ts timestamptz default now()
);

create table if not exists billing_plans (id text primary key, features jsonb);
create table if not exists capabilities (id text primary key);
create table if not exists plan_capabilities (
  plan_id text references billing_plans(id) on delete cascade,
  capability_id text references capabilities(id),
  hard_limit bigint,
  soft_limit bigint,
  features jsonb,
  primary key (plan_id, capability_id)
);

create table if not exists workspace_usage (
  workspace_id uuid not null references workspaces(id) on delete cascade,
  month date not null,
  widget_views bigint not null default 0,
  api_calls bigint not null default 0,
  primary key (workspace_id, month)
);

-- invites (for later)
create table if not exists invites (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  email citext not null,
  role user_role not null default 'editor',
  token text not null,
  created_by uuid not null,
  created_at timestamptz default now(),
  unique (workspace_id, email)
);

-- indexes
create index if not exists idx_widget_instances_workspace on widget_instances(workspace_id);
create index if not exists idx_form_submissions_widget on form_submissions(widget_instance_id);
create index if not exists idx_events_workspace_ts on events(workspace_id, ts desc);

-- RLS enable
alter table workspaces enable row level security;
alter table workspace_members enable row level security;
alter table widget_instances enable row level security;
alter table form_submissions enable row level security;

-- RLS sample read policies (assumes auth.uid() = user_id)
create policy if not exists ws_read on workspaces for select using (
  exists (select 1 from workspace_members wm where wm.workspace_id = workspaces.id and wm.user_id = auth.uid())
);
create policy if not exists wm_read on workspace_members for select using (
  exists (select 1 from workspace_members wm where wm.workspace_id = workspace_members.workspace_id and wm.user_id = auth.uid())
);
create policy if not exists widgets_read on widget_instances for select using (
  exists (select 1 from workspace_members wm where wm.workspace_id = widget_instances.workspace_id and wm.user_id = auth.uid())
);
create policy if not exists form_submissions_read on form_submissions for select using (
  exists (select 1 from widget_instances wi join workspace_members wm on wm.workspace_id = wi.workspace_id
    where wi.id = form_submissions.widget_instance_id and wm.user_id = auth.uid())
);
-- NOTE: inserts to form_submissions happen via service role (server), not client.
