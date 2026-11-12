# NYDF Five-Year Financial Projections Module

**Status:** Initial implementation on `feat/nydf-financial-projections`  
**Source template:** NYDF Financial Projection Template (5 Years)  
**Currency:** NAD

## Purpose

Provide CI staff with a structured financial projection builder for entrepreneurs preparing funding applications. This is an independent CI support tool; it does not make CI an NYDF representative, evaluator, guarantor, or funding decision-maker.

## Template coverage

1. Revenue by product/service, Years 1–5, with total revenue.
2. Cost of goods sold by product/service, Years 1–5, with total COGS.
3. Operating expenses: salaries and wages, rent/utilities, marketing/sales, other OPEX, and total OPEX. Users may add line items.
4. Capital expenditure: equipment, vehicles, IT/software, other CapEx, and total CapEx. Users may add line items.
5. Working capital: inventory days, receivable days, payable days, and net working capital in N$ for Years 1–5.

## Current implementation

- CRM navigation entry and protected `/financial-projections` route.
- Applicant business selected from the existing CRM company register.
- Editable five-year schedules and automatic subtotals.
- Gross profit subtotal is calculated as revenue less COGS.
- Net working capital is entered by the analyst because the source template does not define a calculation formula.
- Draft model data is saved to `financial_projection_models` with the applicant company, creator, status, and timestamps.
- The database migration is `supabase/migrations/0002_nydf_financial_projections.sql`.

## Explicit exclusions

The source template does not provide assumptions or schedules for tax, depreciation, interest, financing, cash flow, balance sheet, valuation, or funding eligibility. These are not silently inferred by this module. Advanced DCF, WACC, sensitivity, and advisory work remain separately scoped services.

## Security and release limitations

- The initial workflow is for authenticated CI staff roles only.
- The applicant client portal and applicant self-service access are not part of this first implementation.
- Apply the migration only to a development Supabase project first; test RLS, role access, tenant isolation, validation, and persistence before production.
- Do not enter real applicant financial or identity documents until the database and storage security controls have been verified.
- The app code being committed does not mean Supabase is connected or that production deployment is complete.
