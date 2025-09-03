-- widget_instances table + indexes + demo seed (idempotent)

create table if not exists public.widget_instances (
  id uuid primary key default gen_random_uuid(),
  widget_id uuid not null references public.widgets(id) on delete cascade,
  public_id text not null unique,
  status text not null default 'draft' check (status in ('draft','published','inactive')),
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists widget_instances_widget_id_idx on public.widget_instances(widget_id);
create index if not exists widget_instances_public_id_idx on public.widget_instances(public_id);

insert into public.widget_instances (widget_id, public_id, status, config)
select w.id, 'DEMO', 'published', coalesce(w.config, '{}'::jsonb)
from public.widgets w
order by w.created_at asc
limit 1
on conflict (public_id) do nothing;



