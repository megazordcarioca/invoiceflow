-- Waitlist table for early access signups
create table if not exists public.waitlist (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  created_at timestamptz not null default now()
);

comment on table public.waitlist is 'Early access waitlist signups.';

alter table if exists public.waitlist enable row level security;

-- Only service role can manage waitlist
create policy "Service role can manage waitlist"
  on public.waitlist
  using (true)
  with check (true);
