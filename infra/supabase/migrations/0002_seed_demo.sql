insert into widget_types (id, title, config_schema)
values ('contact_form','Contact Form','{}')
on conflict (id) do nothing;

insert into workspaces (id, name, created_by)
values ('00000000-0000-0000-0000-000000000001','Demo Workspace','00000000-0000-0000-0000-000000000001')
on conflict (id) do nothing;

insert into widget_instances (workspace_id, type_id, public_id, status, config, allowed_domains, show_badge, created_by)
values ('00000000-0000-0000-0000-000000000001','contact_form','DEMO','published','{}','{}', true,'00000000-0000-0000-0000-000000000001')
on conflict (public_id) do nothing;
