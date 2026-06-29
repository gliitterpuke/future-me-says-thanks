-- ============================================================
-- Migration: add emoji avatars to profiles.
-- Run in Supabase → SQL Editor if you set up before avatars existed.
-- ============================================================

alter table public.profiles add column if not exists avatar text;
