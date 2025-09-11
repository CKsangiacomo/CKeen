# System: Paris — Templates

## Identity
- Tier: Core
- Purpose: Template catalog for widgets
- Owner: Platform

## Interfaces
- GET templates, GET template/:id (served via app UI; data in Supabase)
- Outputs TemplateConfig (validated by Geneva)

## Dependencies
- Depends on: Geneva
- Used by: Bob, Venice

## Deployment
- Data in Supabase; UI in c-keen-app

## Rules
- Template payloads small (<50KB)
- Must validate against Geneva

## Links
- Back: ../../CONTEXT.md
