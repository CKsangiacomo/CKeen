# Clickeen Dashboard

## Invite hardening (V0)
- Service-role client is dev-only guarded.
- Invites now have `expires_at`, `used_at`, `used_by` and indexes.
- Invite creation is rate-limited (5/min/IP) and validates email format.
- Invite accept marks invite as used and writes to `audit_logs`.
- Next step (V1): swap DEV_USER_ID shim for Supabase Auth + RLS policies.

## Auth (V1)
- Supabase SSR auth enabled: magic link login at /auth/login.
- Middleware protects all routes except /auth/* and /invites/accept.
- Queries now use user JWT; RLS policies enforce permissions.
- DEV_USER_ID shim removed.
