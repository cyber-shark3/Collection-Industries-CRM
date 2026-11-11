# Collection Industries CRM — Architecture

## Product direction
A multi-company business operations platform for Collection Industries with two acquisition channels:
1. Entrepreneurs: business-plan support, financial projections, funding-readiness work and optional advanced advisory.
2. Institutions: business development, analytics, portfolio reporting, KPI systems and decision-support engagements.

## Phase 1
- CRM contacts and leads with separate entrepreneur and institutional markets.
- Configurable service catalogue and campaign pricing.
- Quotations, invoices and payments as distinct records.
- Project delivery tracking and tenant-aware database design.

## Commercial rules
- Basic financial projections: N$2,500 standard reference price.
- Black Friday promotional price: N$1,000 (60% discount).
- DCF, WACC, advanced scenario modelling and advisory are separately scoped deliverables.
- Institutional opportunities are scoped before assigning a deal value.
- Draft quotations are not sales. Accepted quotations are not automatically recognised revenue.
- Issued invoices are receivables, not proof of cash collection. Confirmed payments are cash receipts.
- Tax and revenue recognition rules must be confirmed by the responsible accounting professional.

## Target architecture
- Web: Next.js App Router, TypeScript and Tailwind CSS.
- Database and identity: Supabase Postgres and Supabase Auth (planned; not configured).
- Tenant isolation: company_id on business records, memberships, PostgreSQL Row Level Security and role-based access.
- File storage: private object storage with company-scoped access (not configured).
- Financial processing: deterministic calculation services with versioned assumptions and human approval.
- AI: assist with extraction, explanation and draft analysis; never invent missing inputs or approve financial outputs.

## Security before production
1. Configure Supabase Auth and verify email flows.
2. Apply migrations to a development project first.
3. Test cross-company isolation with at least two companies and users.
4. Keep service-role secrets server-side only.
5. Restrict financial documents to authorised project members.
6. Audit financial model approvals, invoice changes and membership changes.
7. Back up data and define retention and deletion policies.
8. Do not upload real applicant or institutional financial data to the demo UI.

## Roadmap
- Milestone 1: CRM foundation, two markets, service pricing and tenant-aware schema.
- Milestone 2: authentication, company onboarding, roles and persisted contacts/leads.
- Milestone 3: quotations, invoices, payments and project workflow.
- Milestone 4: secure document intake and deterministic financial projections.
- Milestone 5: ratios, DCF/WACC, sensitivity and scenario analysis with review controls.
- Milestone 6: multi-company dashboards, institutional reporting and AI-assisted insights.
