-- NYDF five-year financial projection module.
-- Applicant financial information is restricted to authorised CI staff until the client portal is secured.
create table if not exists public.financial_projection_models (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  business_name text not null,
  owner_name text,
  model_name text not null default 'NYDF Five-Year Financial Projection',
  currency char(3) not null default 'NAD' check (currency = 'NAD'),
  model_data jsonb not null,
  status text not null default 'draft'
    check (status in ('draft','submitted','under_review','approved','rejected')),
  created_by uuid not null references public.profiles(id),
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  review_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists financial_projection_company_created_idx
  on public.financial_projection_models(company_id, created_at desc);
create index if not exists financial_projection_status_idx
  on public.financial_projection_models(status);

alter table public.financial_projection_models enable row level security;

create policy "Staff can read financial projections"
  on public.financial_projection_models for select to authenticated
  using (
    public.current_user_role() in ('admin','manager')
    or (public.current_user_role() = 'analyst' and created_by = (select auth.uid()))
  );

create policy "Staff can create financial projections"
  on public.financial_projection_models for insert to authenticated
  with check (
    public.current_user_role() in ('admin','manager','analyst')
    and created_by = (select auth.uid())
  );

create policy "Staff can update financial projections"
  on public.financial_projection_models for update to authenticated
  using (
    public.current_user_role() in ('admin','manager')
    or (public.current_user_role() = 'analyst' and created_by = (select auth.uid()))
  )
  with check (
    public.current_user_role() in ('admin','manager')
    or (public.current_user_role() = 'analyst' and created_by = (select auth.uid()))
  );

create trigger financial_projection_models_updated_at
  before update on public.financial_projection_models
  for each row execute procedure public.set_updated_at();

grant select, insert, update on public.financial_projection_models to authenticated;

comment on table public.financial_projection_models is
  'Five-year applicant financial projections based on the NYDF Financial Projection Template. Internal staff workflow only until client RLS and portal access are separately implemented.';
