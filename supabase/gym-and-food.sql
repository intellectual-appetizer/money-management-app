-- Create gym_entries and food_entries tables
-- Run this in your Supabase SQL editor or add to your migration scripts

-- gym_entries: stores per-user gym logs
create table if not exists public.gym_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise text not null,
  reps integer not null,
  sets integer not null,
  datetime timestamp with time zone not null,
  comment text,
  created_at timestamp with time zone default now()
);

create index if not exists idx_gym_entries_user_id on public.gym_entries(user_id);
create index if not exists idx_gym_entries_datetime on public.gym_entries(user_id, datetime);

alter table public.gym_entries enable row level security;

drop policy if exists "Users can view own gym entries" on public.gym_entries;
drop policy if exists "Users can insert own gym entries" on public.gym_entries;
drop policy if exists "Users can update own gym entries" on public.gym_entries;
drop policy if exists "Users can delete own gym entries" on public.gym_entries;

create policy "Users can view own gym entries"
  on public.gym_entries for select
  using (auth.uid() = user_id);

create policy "Users can insert own gym entries"
  on public.gym_entries for insert
  with check (auth.uid() = user_id);

create policy "Users can update own gym entries"
  on public.gym_entries for update
  using (auth.uid() = user_id);

create policy "Users can delete own gym entries"
  on public.gym_entries for delete
  using (auth.uid() = user_id);

-- food_entries: stores per-user food logs
create table if not exists public.food_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  food text not null,
  quantity text,
  datetime timestamp with time zone not null,
  comment text,
  created_at timestamp with time zone default now()
);

create index if not exists idx_food_entries_user_id on public.food_entries(user_id);
create index if not exists idx_food_entries_datetime on public.food_entries(user_id, datetime);

alter table public.food_entries enable row level security;

drop policy if exists "Users can view own food entries" on public.food_entries;
drop policy if exists "Users can insert own food entries" on public.food_entries;
drop policy if exists "Users can update own food entries" on public.food_entries;
drop policy if exists "Users can delete own food entries" on public.food_entries;

create policy "Users can view own food entries"
  on public.food_entries for select
  using (auth.uid() = user_id);

create policy "Users can insert own food entries"
  on public.food_entries for insert
  with check (auth.uid() = user_id);

create policy "Users can update own food entries"
  on public.food_entries for update
  using (auth.uid() = user_id);

create policy "Users can delete own food entries"
  on public.food_entries for delete
  using (auth.uid() = user_id);