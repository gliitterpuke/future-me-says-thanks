-- ============================================================
-- future-me-says-thanks — Supabase schema
-- Paste this whole file into Supabase → SQL Editor → Run.
-- ============================================================

-- ---- Profiles -------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  gender       text not null check (gender in ('f', 'm')),
  avatar       text,
  created_at   timestamptz not null default now()
);

-- ---- Daily entries (one row per person per day) ---------------
create table if not exists public.entries (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  date          date not null,
  eat           boolean not null default false,
  -- 'none' | 'lvl1' | 'lvl2'
  --   girls: lvl1 = 15m (1pt), lvl2 = 45m (2pt)
  --   guys:  lvl1 = 30m (1pt)  (lvl2 unused)
  workout       text not null default 'none' check (workout in ('none', 'lvl1', 'lvl2')),
  -- girls: 5k steps, guys: 10k steps (1pt)
  walk          boolean not null default false,
  exempt        boolean not null default false,
  exempt_reason text check (exempt_reason in ('sick', 'period')),
  updated_at    timestamptz not null default now(),
  unique (user_id, date)
);

create index if not exists entries_user_date_idx on public.entries (user_id, date);
create index if not exists entries_date_idx on public.entries (date);

-- ---- Private per-day notes ------------------------------------
-- Kept in a separate table so they stay owner-only, while `entries`
-- remains group-readable for the leaderboard.
create table if not exists public.entry_notes (
  user_id    uuid not null references auth.users (id) on delete cascade,
  date       date not null,
  note       text not null default '',
  updated_at timestamptz not null default now(),
  primary key (user_id, date)
);

-- ---- Row Level Security ---------------------------------------
alter table public.profiles    enable row level security;
alter table public.entries     enable row level security;
alter table public.entry_notes enable row level security;

-- Everyone signed in can READ all profiles + entries (for the shared
-- leaderboard) but can only WRITE their own rows.

drop policy if exists "profiles_read"   on public.profiles;
drop policy if exists "profiles_insert" on public.profiles;
drop policy if exists "profiles_update" on public.profiles;
create policy "profiles_read"   on public.profiles for select to authenticated using (true);
create policy "profiles_insert" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "profiles_update" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "entries_read"   on public.entries;
drop policy if exists "entries_insert" on public.entries;
drop policy if exists "entries_update" on public.entries;
drop policy if exists "entries_delete" on public.entries;
create policy "entries_read"   on public.entries for select to authenticated using (true);
create policy "entries_insert" on public.entries for insert to authenticated with check (auth.uid() = user_id);
create policy "entries_update" on public.entries for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "entries_delete" on public.entries for delete to authenticated using (auth.uid() = user_id);

-- Notes are PRIVATE: you can only ever read or write your own.
drop policy if exists "notes_read"   on public.entry_notes;
drop policy if exists "notes_insert" on public.entry_notes;
drop policy if exists "notes_update" on public.entry_notes;
drop policy if exists "notes_delete" on public.entry_notes;
create policy "notes_read"   on public.entry_notes for select to authenticated using (auth.uid() = user_id);
create policy "notes_insert" on public.entry_notes for insert to authenticated with check (auth.uid() = user_id);
create policy "notes_update" on public.entry_notes for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "notes_delete" on public.entry_notes for delete to authenticated using (auth.uid() = user_id);
