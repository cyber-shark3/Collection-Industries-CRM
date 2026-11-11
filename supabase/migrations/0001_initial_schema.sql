-- Multi-company CRM foundation. Review and test on a development project first.
create extension if not exists pgcrypto;
create type public.member_role as enum ('owner','admin','manager','member','viewer');
create type public.lead_market as enum ('entrepreneur','institutional');
create type public.lead_stage as enum ('new_lead','contacted','meeting_booked','proposal_sent','won','lost');
create type public.quote_status as enum ('draft','sent','accepted','rejected','expired');
create type public.invoice_status as enum ('draft','issued','partially_paid','paid','overdue','void');
create type public.payment_status as enum ('pending','confirmed','failed','refunded');

create table public.companies (
 id uuid primary key default gen_random_uuid(), legal_name text not null, trading_name text,
 registration_number text, country_code char(2) not null default 'NA',
 base_currency char(3) not null default 'NAD', created_at timestamptz not null default now()
);
create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 full_name text not null, email text, created_at timestamptz not null default now()
);
create table public.company_memberships (
 company_id uuid not null references public.companies(id) on delete cascade,
 user_id uuid not null references public.profiles(id) on delete cascade,
 role public.member_role not null default 'member', created_at timestamptz not null default now(),
 primary key(company_id,user_id)
);
create table public.departments (
 id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies(id) on delete cascade,
 name text not null, description text, created_at timestamptz not null default now(),
 unique(company_id,name), unique(id,company_id)
);
create table public.contacts (
 id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies(id) on delete cascade,
 contact_type text not null check(contact_type in ('person','organisation')), full_name text not null,
 organisation_name text, email text, phone text, source text, notes text,
 created_by uuid references public.profiles(id), created_at timestamptz not null default now(),
 unique(id,company_id)
);
create table public.leads (
 id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies(id) on delete cascade,
 contact_id uuid, owner_user_id uuid references public.profiles(id), market public.lead_market not null,
 stage public.lead_stage not null default 'new_lead', title text not null, service_interest text,
 estimated_value numeric(14,2) not null default 0 check(estimated_value >= 0), currency char(3) not null default 'NAD',
 next_follow_up_at timestamptz, lost_reason text, created_at timestamptz not null default now(),
 foreign key(contact_id,company_id) references public.contacts(id,company_id), unique(id,company_id)
);
create table public.service_catalog (
 id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies(id) on delete cascade,
 name text not null, description text, category text not null, standard_price numeric(14,2) check(standard_price >= 0),
 currency char(3) not null default 'NAD', active boolean not null default true,
 unique(id,company_id), unique(company_id,name)
);
create table public.campaigns (
 id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies(id) on delete cascade,
 name text not null, starts_at timestamptz, ends_at timestamptz,
 status text not null default 'draft' check(status in ('draft','scheduled','active','paused','completed')),
 unique(id,company_id)
);
create table public.campaign_prices (
 id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies(id) on delete cascade,
 campaign_id uuid not null, service_id uuid not null,
 promotional_price numeric(14,2) not null check(promotional_price >= 0), currency char(3) not null default 'NAD',
 foreign key(campaign_id,company_id) references public.campaigns(id,company_id) on delete cascade,
 foreign key(service_id,company_id) references public.service_catalog(id,company_id), unique(campaign_id,service_id)
);
create table public.quotations (
 id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies(id) on delete cascade,
 lead_id uuid, contact_id uuid, quote_number text not null, status public.quote_status not null default 'draft',
 subtotal numeric(14,2) not null default 0 check(subtotal >= 0), discount_amount numeric(14,2) not null default 0 check(discount_amount >= 0),
 tax_amount numeric(14,2) not null default 0 check(tax_amount >= 0), total numeric(14,2) not null default 0 check(total >= 0),
 currency char(3) not null default 'NAD', valid_until date, issued_at timestamptz, created_at timestamptz not null default now(),
 foreign key(lead_id,company_id) references public.leads(id,company_id),
 foreign key(contact_id,company_id) references public.contacts(id,company_id),
 unique(company_id,quote_number), unique(id,company_id)
);
create table public.invoices (
 id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies(id) on delete cascade,
 quotation_id uuid, contact_id uuid, invoice_number text not null, status public.invoice_status not null default 'draft',
 subtotal numeric(14,2) not null default 0 check(subtotal >= 0), discount_amount numeric(14,2) not null default 0 check(discount_amount >= 0),
 tax_amount numeric(14,2) not null default 0 check(tax_amount >= 0), total numeric(14,2) not null default 0 check(total >= 0),
 amount_paid numeric(14,2) not null default 0 check(amount_paid >= 0), currency char(3) not null default 'NAD',
 issued_at timestamptz, due_at date, created_at timestamptz not null default now(),
 foreign key(quotation_id,company_id) references public.quotations(id,company_id),
 foreign key(contact_id,company_id) references public.contacts(id,company_id),
 unique(company_id,invoice_number), unique(id,company_id)
);
create table public.payments (
 id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies(id) on delete cascade,
 invoice_id uuid not null, amount numeric(14,2) not null check(amount > 0), currency char(3) not null default 'NAD',
 status public.payment_status not null default 'pending', payment_method text, reference text, received_at timestamptz,
 created_at timestamptz not null default now(), foreign key(invoice_id,company_id) references public.invoices(id,company_id)
);
create table public.projects (
 id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies(id) on delete cascade,
 contact_id uuid, lead_id uuid, name text not null, service_type text not null,
 status text not null default 'planned' check(status in ('planned','in_progress','review','completed','cancelled')),
 start_date date, due_date date, created_at timestamptz not null default now(),
 foreign key(contact_id,company_id) references public.contacts(id,company_id),
 foreign key(lead_id,company_id) references public.leads(id,company_id), unique(id,company_id)
);
create table public.documents (
 id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies(id) on delete cascade,
 project_id uuid, uploaded_by uuid references public.profiles(id), file_name text not null, storage_path text not null,
 mime_type text, document_type text not null default 'supporting', created_at timestamptz not null default now(),
 foreign key(project_id,company_id) references public.projects(id,company_id), unique(id,company_id)
);
create table public.financial_models (
 id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies(id) on delete cascade,
 project_id uuid not null, model_name text not null,
 model_type text not null check(model_type in ('projection','ratio_analysis','dcf','wacc','sensitivity','scenario','expected_loss')),
 input_document_id uuid, assumptions jsonb not null default '{}'::jsonb, outputs jsonb not null default '{}'::jsonb,
 review_status text not null default 'needs_review' check(review_status in ('needs_review','approved','rejected')),
 created_at timestamptz not null default now(),
 foreign key(project_id,company_id) references public.projects(id,company_id),
 foreign key(input_document_id,company_id) references public.documents(id,company_id), unique(id,company_id)
);
create table public.audit_events (
 id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies(id) on delete cascade,
 actor_user_id uuid references public.profiles(id), action text not null, entity_type text not null, entity_id uuid,
 metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);

create index leads_company_stage_idx on public.leads(company_id,stage);
create index leads_company_market_idx on public.leads(company_id,market);
create index invoices_company_status_idx on public.invoices(company_id,status);
create index payments_company_invoice_idx on public.payments(company_id,invoice_id);
create index projects_company_status_idx on public.projects(company_id,status);
create index audit_events_company_created_idx on public.audit_events(company_id,created_at desc);

create or replace function public.is_company_member(target_company_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
 select exists(select 1 from public.company_memberships m where m.company_id = target_company_id and m.user_id = auth.uid());
$$;
create or replace function public.has_company_role(target_company_id uuid, allowed_roles public.member_role[])
returns boolean language sql stable security definer set search_path = public as $$
 select exists(select 1 from public.company_memberships m where m.company_id = target_company_id and m.user_id = auth.uid() and m.role = any(allowed_roles));
$$;

alter table public.companies enable row level security;
alter table public.profiles enable row level security;
alter table public.company_memberships enable row level security;
alter table public.departments enable row level security;
alter table public.contacts enable row level security;
alter table public.leads enable row level security;
alter table public.service_catalog enable row level security;
alter table public.campaigns enable row level security;
alter table public.campaign_prices enable row level security;
alter table public.quotations enable row level security;
alter table public.invoices enable row level security;
alter table public.payments enable row level security;
alter table public.projects enable row level security;
alter table public.documents enable row level security;
alter table public.financial_models enable row level security;
alter table public.audit_events enable row level security;

create policy "members read own companies" on public.companies for select using(public.is_company_member(id));
create policy "company admins update company" on public.companies for update using(public.has_company_role(id,array['owner','admin']::public.member_role[])) with check(public.has_company_role(id,array['owner','admin']::public.member_role[]));
create policy "users read own profile" on public.profiles for select using(id = auth.uid());
create policy "users update own profile" on public.profiles for update using(id = auth.uid()) with check(id = auth.uid());
create policy "members read memberships" on public.company_memberships for select using(public.is_company_member(company_id));
create policy "admins manage memberships" on public.company_memberships for all using(public.has_company_role(company_id,array['owner','admin']::public.member_role[])) with check(public.has_company_role(company_id,array['owner','admin']::public.member_role[]));

-- Company-scoped access. Tighten write permissions per role before production.
do $$
declare t text;
begin
 foreach t in array array['departments','contacts','leads','service_catalog','campaigns','campaign_prices','quotations','invoices','payments','projects','documents','financial_models','audit_events'] loop
  execute format('create policy "members read %1$s" on public.%1$I for select using(public.is_company_member(company_id))',t);
  execute format('create policy "operators write %1$s" on public.%1$I for all using(public.has_company_role(company_id,array[''owner'',''admin'',''manager'',''member'']::public.member_role[])) with check(public.has_company_role(company_id,array[''owner'',''admin'',''manager'',''member'']::public.member_role[]))',t);
 end loop;
end $$;

-- Draft quotations are not sales; issued invoices are receivables, not proof of cash.
-- Revenue recognition must follow each company's approved accounting policy.
