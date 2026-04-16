-- Run this in your Supabase SQL editor
-- Table: profiles

create table if not exists public.profiles (
  id           uuid primary key default gen_random_uuid(),
  discord_id   text unique not null,
  username     text not null,
  global_name  text,
  email        text,
  avatar_url   text,
  banner_url   text,
  locale       text default 'pt-BR',
  premium_type integer default 0,
  verified     boolean default false,
  plan         text not null default 'free' check (plan in ('free', 'pro', 'elite')),
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- Row Level Security
alter table public.profiles enable row level security;

-- Policies: anyone can upsert their own profile (by discord_id)
create policy "Upsert own profile"
  on public.profiles
  for all
  using (true)
  with check (true);

-- Index for fast lookup
create index if not exists profiles_discord_id_idx on public.profiles (discord_id);
