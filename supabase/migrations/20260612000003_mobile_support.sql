-- Mobile support: push_tokens table + avatar_url on profiles

-- ============================================================
-- 1. Add avatar_url to profiles
-- ============================================================
alter table public.profiles
  add column if not exists avatar_url text;

-- ============================================================
-- 2. push_tokens — Expo Push Notification tokens
-- ============================================================
create table if not exists public.push_tokens (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles on delete cascade,
  token      text not null,
  platform   text not null check (platform in ('ios', 'android', 'web')),
  created_at timestamptz not null default now(),
  unique (user_id, token)
);

comment on table public.push_tokens is 'Expo push notification tokens per user device.';

create index if not exists idx_push_tokens_user_id on public.push_tokens (user_id);

alter table public.push_tokens enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'Users can manage own push tokens' and tablename = 'push_tokens') then
    create policy "Users can manage own push tokens"
      on public.push_tokens
      using (user_id = auth.uid())
      with check (user_id = auth.uid());
  end if;
end;
$$;

-- ============================================================
-- 3. Supabase Storage bucket for avatars (idempotent hint)
-- ============================================================
-- Run in Supabase dashboard or via supabase-js admin:
--   supabase.storage.createBucket('avatars', { public: true })
-- The migration itself cannot create storage buckets via SQL.
