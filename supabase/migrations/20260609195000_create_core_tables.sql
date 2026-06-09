-- InvoiceFlow v1: Core database schema
-- Tables: profiles, invoices, invoice_line_items, reminders

-- ============================================================
-- 1. profiles (extends Supabase Auth users)
-- ============================================================
create table public.profiles (
  id         uuid primary key references auth.users on delete cascade,
  name       text,
  company    text,
  created_at timestamptz not null default now()
);

comment on table public.profiles is 'User profile, extending Supabase Auth users.';

-- ============================================================
-- 2. invoices
-- ============================================================
create table public.invoices (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles on delete cascade,
  invoice_number text not null,
  client_name    text not null,
  client_email   text not null,
  client_address text,
  issue_date     date not null,
  due_date       date not null,
  status         text not null default 'draft' check (status in ('draft', 'sent', 'paid', 'overdue')),
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

comment on table public.invoices is 'Invoice header with client info and status.';

-- ============================================================
-- 3. invoice_line_items
-- ============================================================
create table public.invoice_line_items (
  id          uuid primary key default gen_random_uuid(),
  invoice_id  uuid not null references public.invoices on delete cascade,
  description text not null,
  quantity    numeric(12,2) not null,
  unit_price  numeric(12,2) not null
);

comment on table public.invoice_line_items is 'Line items belonging to an invoice.';

-- ============================================================
-- 4. reminders
-- ============================================================
create table public.reminders (
  id         uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices on delete cascade,
  sent_at    timestamptz not null default now(),
  status     text not null check (status in ('sent', 'failed'))
);

comment on table public.reminders is 'Payment reminder emails sent for an invoice.';

-- ============================================================
-- 5. Indexes for dashboard query performance
-- ============================================================
create index idx_invoices_user_id on public.invoices (user_id);
create index idx_invoices_due_date_status on public.invoices (due_date, status);
create index idx_invoice_line_items_invoice_id on public.invoice_line_items (invoice_id);
create index idx_reminders_invoice_id on public.reminders (invoice_id);

-- ============================================================
-- 6. Updated-at trigger for invoices
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
  before update on public.invoices
  for each row
  execute function public.handle_updated_at();

-- ============================================================
-- 7. Row Level Security
-- ============================================================
alter table public.profiles enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_line_items enable row level security;
alter table public.reminders enable row level security;

-- profiles: users can read/update only their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (id = auth.uid());

create policy "Users can update own profile"
  on public.profiles for update
  using (id = auth.uid());

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (id = auth.uid());

-- invoices: users can CRUD only their own invoices
create policy "Users can view own invoices"
  on public.invoices for select
  using (user_id = auth.uid());

create policy "Users can create own invoices"
  on public.invoices for insert
  with check (user_id = auth.uid());

create policy "Users can update own invoices"
  on public.invoices for update
  using (user_id = auth.uid());

create policy "Users can delete own invoices"
  on public.invoices for delete
  using (user_id = auth.uid());

-- invoice_line_items: access through parent invoice ownership
create policy "Users can view own invoice line items"
  on public.invoice_line_items for select
  using (
    invoice_id in (
      select id from public.invoices where user_id = auth.uid()
    )
  );

create policy "Users can create own invoice line items"
  on public.invoice_line_items for insert
  with check (
    invoice_id in (
      select id from public.invoices where user_id = auth.uid()
    )
  );

create policy "Users can update own invoice line items"
  on public.invoice_line_items for update
  using (
    invoice_id in (
      select id from public.invoices where user_id = auth.uid()
    )
  );

create policy "Users can delete own invoice line items"
  on public.invoice_line_items for delete
  using (
    invoice_id in (
      select id from public.invoices where user_id = auth.uid()
    )
  );

-- reminders: access through parent invoice ownership
create policy "Users can view own reminders"
  on public.reminders for select
  using (
    invoice_id in (
      select id from public.invoices where user_id = auth.uid()
    )
  );

create policy "Users can create own reminders"
  on public.reminders for insert
  with check (
    invoice_id in (
      select id from public.invoices where user_id = auth.uid()
    )
  );

-- ============================================================
-- 8. Auto-create profile on user signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, created_at)
  values (new.id, new.raw_user_meta_data ->> 'name', now());
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
