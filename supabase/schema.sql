-- Run in Supabase SQL Editor (Dashboard → SQL)

create table if not exists public.rabbits (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null default '兔兔',
  age_label text default '',
  breed text default '',
  weight numeric,
  avatar text,
  notes text,
  diary_title text default '兔子日記',
  custom_topics jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.user_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  active_rabbit_id text references public.rabbits (id) on delete set null
);

create table if not exists public.daily_logs (
  user_id uuid not null references auth.users (id) on delete cascade,
  rabbit_id text not null references public.rabbits (id) on delete cascade,
  log_date date not null,
  appetite text,
  poop text,
  activity text,
  weight numeric,
  teeth text,
  pain text,
  notes text,
  primary key (rabbit_id, log_date)
);

alter table public.rabbits enable row level security;
alter table public.user_settings enable row level security;
alter table public.daily_logs enable row level security;

create policy "rabbits_own" on public.rabbits
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "settings_own" on public.user_settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "logs_own" on public.daily_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
