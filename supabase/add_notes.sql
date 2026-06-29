-- ============================================================
-- Migration: add private per-day notes.
-- Run this in Supabase → SQL Editor if you already ran schema.sql
-- before notes existed. (schema.sql now includes all of this too.)
-- ============================================================

create table if not exists public.entry_notes (
  user_id    uuid not null references auth.users (id) on delete cascade,
  date       date not null,
  note       text not null default '',
  updated_at timestamptz not null default now(),
  primary key (user_id, date)
);

alter table public.entry_notes enable row level security;

drop policy if exists "notes_read"   on public.entry_notes;
drop policy if exists "notes_insert" on public.entry_notes;
drop policy if exists "notes_update" on public.entry_notes;
drop policy if exists "notes_delete" on public.entry_notes;
create policy "notes_read"   on public.entry_notes for select to authenticated using (auth.uid() = user_id);
create policy "notes_insert" on public.entry_notes for insert to authenticated with check (auth.uid() = user_id);
create policy "notes_update" on public.entry_notes for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "notes_delete" on public.entry_notes for delete to authenticated using (auth.uid() = user_id);
