-- Enable RLS
alter table workspaces enable row level security;
alter table workspace_members enable row level security;
alter table invites enable row level security;

-- Members: read if you belong to the workspace
create policy if not exists wm_read on workspace_members
for select using (
  exists (
    select 1 from workspace_members m2
    where m2.workspace_id = workspace_members.workspace_id
      and m2.user_id = auth.uid()
  )
);

-- Members: owners/admins can insert/update
create policy if not exists wm_insert on workspace_members
for insert with check (
  exists (
    select 1 from workspace_members m2
    where m2.workspace_id = workspace_members.workspace_id
      and m2.user_id = auth.uid()
      and m2.role in ('owner','admin')
  )
);

create policy if not exists wm_update on workspace_members
for update using (
  exists (
    select 1 from workspace_members m2
    where m2.workspace_id = workspace_members.workspace_id
      and m2.user_id = auth.uid()
      and m2.role in ('owner','admin')
  )
) with check (true);

-- Invites: owners/admins can select/insert; delete allowed to owners/admins (accept flow also updates used_at which is allowed by insert/update policies)
create policy if not exists inv_select on invites
for select using (
  exists (
    select 1 from workspace_members m
    where m.workspace_id = invites.workspace_id
      and m.user_id = auth.uid()
      and m.role in ('owner','admin')
  )
);

create policy if not exists inv_insert on invites
for insert with check (
  exists (
    select 1 from workspace_members m
    where m.workspace_id = invites.workspace_id
      and m.user_id = auth.uid()
      and m.role in ('owner','admin')
  )
);

create policy if not exists inv_update on invites
for update using (
  exists (
    select 1 from workspace_members m
    where m.workspace_id = invites.workspace_id
      and m.user_id = auth.uid()
      and m.role in ('owner','admin')
  )
) with check (true);

create policy if not exists inv_delete on invites
for delete using (
  exists (
    select 1 from workspace_members m
    where m.workspace_id = invites.workspace_id
      and m.user_id = auth.uid()
      and m.role in ('owner','admin')
  )
);
