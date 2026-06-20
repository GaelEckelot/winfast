-- WinFast — schéma de base de données (modèle "blob JSON par utilisateur").
-- À exécuter une fois dans Supabase : Dashboard → SQL Editor → coller → Run.

create table if not exists public.app_state (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  data       jsonb       not null default '{}'::jsonb,  -- état des modules (AppData)
  todos      jsonb       not null default '[]'::jsonb,  -- todos du jour
  name       text        not null default '',           -- prénom affiché
  updated_at timestamptz not null default now()
);

-- Sécurité au niveau ligne : chaque utilisateur n'accède qu'à SA ligne.
alter table public.app_state enable row level security;

drop policy if exists "app_state_select_own" on public.app_state;
drop policy if exists "app_state_insert_own" on public.app_state;
drop policy if exists "app_state_update_own" on public.app_state;

create policy "app_state_select_own" on public.app_state
  for select using (auth.uid() = user_id);

create policy "app_state_insert_own" on public.app_state
  for insert with check (auth.uid() = user_id);

create policy "app_state_update_own" on public.app_state
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
