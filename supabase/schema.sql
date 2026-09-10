-- ChapterLog — schéma databáze
-- Spusť celé v Supabase → SQL Editor → New query → Run.
-- Je psané tak, že se dá spustit opakovaně, aniž by to něco rozbilo.

-- ---------------------------------------------------------------
-- 1) Tabulka s knihovnou. Jeden řádek = jeden uživatel.
-- ---------------------------------------------------------------
create table if not exists public.libraries (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  data       jsonb       not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------
-- 2) Row Level Security — tohle je to, co zaručuje, že uživatel
--    nikdy nevidí cizí data. Platí i kdyby se v JS stala chyba.
-- ---------------------------------------------------------------
alter table public.libraries enable row level security;

drop policy if exists "vlastni radek - cteni" on public.libraries;
create policy "vlastni radek - cteni"
  on public.libraries for select
  using (auth.uid() = user_id);

drop policy if exists "vlastni radek - vlozeni" on public.libraries;
create policy "vlastni radek - vlozeni"
  on public.libraries for insert
  with check (auth.uid() = user_id);

drop policy if exists "vlastni radek - zmena" on public.libraries;
create policy "vlastni radek - zmena"
  on public.libraries for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "vlastni radek - smazani" on public.libraries;
create policy "vlastni radek - smazani"
  on public.libraries for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------
-- 3) updated_at si nastavuje databáze sama.
--    Aplikace posílá updated_at jen jako "verzi, kterou znám" —
--    kdyby si ho směla nastavit sama, dala by se kontrola konfliktů obejít.
-- ---------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists libraries_touch on public.libraries;
create trigger libraries_touch
  before insert or update on public.libraries
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------
-- 4) Ochrana proti obřím řádkům (překlep v aplikaci, pokus o zneužití).
--    2 MB JSONu je při ~250 bajtech na knihu zhruba 8 000 knih.
-- ---------------------------------------------------------------
alter table public.libraries drop constraint if exists libraries_data_size;
alter table public.libraries add constraint libraries_data_size
  check (pg_column_size(data) < 2 * 1024 * 1024);

-- ---------------------------------------------------------------
-- 5) Nový uživatel dostane rovnou prázdný řádek.
-- ---------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.libraries (user_id, data)
  values (new.id, '{}'::jsonb)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
