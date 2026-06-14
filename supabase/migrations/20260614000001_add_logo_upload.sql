-- Migration for DAR-25: Logo Upload support
-- 1. Add logo_url to profiles
alter table if exists public.profiles
  add column if not exists logo_url text;

-- 2. Create 'logos' bucket
insert into storage.buckets (id, name, public)
values ('logos', 'logos', true)
on conflict (id) do nothing;

-- 3. Storage RLS Policies for 'logos'
-- Allow public read access to logos
do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'Public Access' and tablename = 'objects' and schemaname = 'storage') then
    create policy "Public Access"
      on storage.objects for select
      using ( bucket_id = 'logos' );
  end if;
end;
$$;

-- Allow authenticated users to upload their own logos
-- The path structure is expected to be 'user_id/filename'
do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'Authenticated users can upload logos' and tablename = 'objects' and schemaname = 'storage') then
    create policy "Authenticated users can upload logos"
      on storage.objects for insert
      with check (
        bucket_id = 'logos' AND
        (storage.foldername(name))[1] = auth.uid()::text
      );
  end if;
end;
$$;

-- Allow authenticated users to update their own logos
do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'Authenticated users can update own logos' and tablename = 'objects' and schemaname = 'storage') then
    create policy "Authenticated users can update own logos"
      on storage.objects for update
      using (
        bucket_id = 'logos' AND
        (storage.foldername(name))[1] = auth.uid()::text
      );
  end if;
end;
$$;

-- Allow authenticated users to delete their own logos
do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'Authenticated users can delete own logos' and tablename = 'objects' and schemaname = 'storage') then
    create policy "Authenticated users can delete own logos"
      on storage.objects for delete
      using (
        bucket_id = 'logos' AND
        (storage.foldername(name))[1] = auth.uid()::text
      );
  end if;
end;
$$;
