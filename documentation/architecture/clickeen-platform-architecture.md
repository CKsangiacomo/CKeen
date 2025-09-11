## Anon Widget Creation (Production)
- **System user**: Anonymous widgets are owned by a non-interactive system user with fixed UUID `11111111-1111-1111-1111-111111111111`. This user must exist in `auth.users` in each environment.
- **Atomic RPC**: Widget + published instance are created via `public.create_widget_with_instance(name text, config jsonb)` (SECURITY DEFINER). It inserts into `public.widgets` (sets `user_id` to the system user) and `public.widget_instances` (status `published`), then returns `{ public_key, public_id }`.
- **Schema guarantees**:
  - `widgets.user_id` is NOT NULL (enforced).
  - `widget_instances.public_id` is UNIQUE.
  - Compat columns (`allowed_domains text[] default '{}'`, `show_badge boolean default true`, `created_by uuid null`) exist for embed parity.
- **Smoke**: Production smoke creates an anon widget, checks embed headers for that `publicId`, and submits a form via the embed endpoint expecting `{ ok: true }`.


