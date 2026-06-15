create table if not exists public.subscriptions (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references public.profiles on delete cascade,
  plan                  text not null default 'free' check (plan in ('free', 'pro', 'business')),
  status                text not null default 'active' check (status in ('active', 'canceled', 'past_due', 'trialing', 'incomplete')),
  current_period_start  timestamptz,
  current_period_end    timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);


create unique index if not exists idx_subscriptions_user_id on public.subscriptions (user_id);

create or replace function public.handle_subscription_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'set_subscriptions_updated_at'
      and tgrelid = 'public.subscriptions'::regclass
  ) then
    create trigger set_subscriptions_updated_at
      before update on public.subscriptions
      for each row
      execute function public.handle_subscription_updated_at();
  end if;
end;
$$;

alter table if exists public.subscriptions enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'Users can view own subscription' and tablename = 'subscriptions') then
    create policy "Users can view own subscription"
      on public.subscriptions for select
      using (user_id = auth.uid());
  end if;
end;
$$;

do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'Users can insert own subscription' and tablename = 'subscriptions') then
    create policy "Users can insert own subscription"
      on public.subscriptions for insert
      with check (user_id = auth.uid());
  end if;
end;
$$;

do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'Users can update own subscription' and tablename = 'subscriptions') then
    create policy "Users can update own subscription"
      on public.subscriptions for update
      using (user_id = auth.uid());
  end if;
end;
$$;

-- Auto-create free subscription row on user signup
create or replace function public.handle_new_user_subscription()
returns trigger as $$
begin
  insert into public.subscriptions (user_id, plan, status)
  values (new.id, 'free', 'active');
  return new;
end;
$$ language plpgsql security definer;

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'on_auth_user_created_subscription'
      and tgrelid = 'auth.users'::regclass
  ) then
    create trigger on_auth_user_created_subscription
      after insert on auth.users
      for each row
      execute function public.handle_new_user_subscription();
  end if;
end;
$$;
