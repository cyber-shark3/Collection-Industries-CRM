# Collection Industries CRM

A multi-company CRM and business intelligence platform for Collection Industries.

## Current milestone
- Working CRM dashboard prototype.
- Separate entrepreneur and institutional lead markets.
- Lead creation, search, market filtering and pipeline-stage updates in demo memory.
- Tenant-aware Supabase/Postgres schema with company memberships and row-level security.
- Architecture and production-readiness documentation.

## Run locally
Requirements: Node.js 20 or later.

    npm install
    npm run dev

Open http://localhost:3000.

## Checks
    npm run typecheck
    npm run build

## Important status
The dashboard currently uses in-memory demo data. Changes disappear when the page reloads. Authentication, database persistence, document storage, invoicing and AI processing are not connected yet.

Do not enter real client, applicant, institutional or financial information into this prototype.

Review docs/architecture.md and supabase/migrations/0001_initial_schema.sql before applying the migration to a Supabase development project. Configure .env.local using .env.example only after creating and securing the Supabase project.

## Commercial baseline
- Basic financial projections: N$2,500 standard reference price.
- Black Friday basic package: N$1,000 promotional price.
- Advanced analysis and advisory: separately scoped and quoted.
- Entrepreneur and institutional opportunities use distinct pipelines.

Intelligence. Precision. Strategy. Build reliable workflows first; add automation and AI only after data quality, permissions and financial rules are dependable.
