# Clickeen Monorepo

Fast, lightweight widgets platform built with Next.js and Supabase.

## Dev servers

- `pnpm dev:site` → http://localhost:3000 (marketing site)
- `pnpm dev:app` → http://localhost:3001 (dashboard)
- `pnpm dev:embed` → http://localhost:3002 (embed service)
- `pnpm dev` → run all three in parallel

## Quick start

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

3. Start development:
   ```bash
   pnpm dev:site    # Marketing site
   pnpm dev:app     # Dashboard
   pnpm dev:embed   # Embed service
   # or run all: pnpm dev
   ```

## Project structure

- `apps/site` - Marketing site with widget landing pages
- `apps/app` - Dashboard for managing widgets
- `services/embed` - Edge service for widget delivery
- `packages/` - Shared packages and widgets
- `infra/supabase` - Database migrations and schema
