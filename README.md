# Collection Industries CRM

Intelligence. Precision. Strategy.

Integrated workspace for Collection Industries business development and future CORE Intelligence client reporting.

## Product decisions
- Integrated CRM and CORE Intelligence platform.
- Staff and client access with separate permissions.
- Outreach is approval-based: a person approves messages before sending.
- Next.js App Router, TypeScript, Tailwind CSS, Supabase Auth and PostgreSQL, Vercel.

## First milestone
- Staff authentication.
- Company records.
- Lead records and pipeline stages.
- Follow-up tasks.
- Dashboard metrics.
- Contacts database table (dedicated contact screen is a later slice).

## Setup
1. Use Node.js 20.9 or later.
2. Create a Supabase project.
3. Copy the environment example file to a local environment file and add the Supabase project URL and anon key.
4. Apply supabase/migrations/0001_crm_foundation.sql in the Supabase SQL Editor.
5. Create the first user in Supabase Authentication.
6. Promote that user to admin in the SQL Editor by updating the matching profile role to admin.
7. Run npm install, then npm run dev. Open http://localhost:3000.

## Security
- Never commit local environment files or service-role keys.
- Browser uses only the Supabase anon/publishable key; Row Level Security protects records.
- New accounts default to client; an administrator promotes internal staff.
- CRM tables are staff-only in this first migration. Client-specific CORE Intelligence access will be added with a tenant-aware reporting schema.
- No email-sending integration is enabled. Outreach approval and suppression controls must be implemented first.

No credentials are included in this repository. See .env.example.
