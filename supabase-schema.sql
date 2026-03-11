-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- Catches table
create table catches (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  species text,
  length_inches numeric,
  weight_lbs numeric,
  fly text,
  technique text,
  date timestamptz default now(),
  location_name text,
  spot_id bigint,
  lat numeric,
  lng numeric,
  photo text,
  notes text,
  water_temp numeric,
  air_temp numeric,
  weather text,
  wind text,
  water_level text,
  water_clarity text,
  hatch_activity text,
  created_at timestamptz default now()
);

-- Flies table
create table flies (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  name text not null,
  type text,
  size text,
  color text,
  quantity integer default 1,
  notes text,
  created_at timestamptz default now()
);

-- Spots table
create table spots (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  name text not null,
  lat numeric not null,
  lng numeric not null,
  water_type text,
  access_notes text,
  species text,
  notes text,
  created_at timestamptz default now()
);

-- Enable Row Level Security on all tables
alter table catches enable row level security;
alter table flies enable row level security;
alter table spots enable row level security;

-- Policies: users can only see/modify their own data
create policy "Users can view own catches" on catches for select using (auth.uid() = user_id);
create policy "Users can insert own catches" on catches for insert with check (auth.uid() = user_id);
create policy "Users can update own catches" on catches for update using (auth.uid() = user_id);
create policy "Users can delete own catches" on catches for delete using (auth.uid() = user_id);

create policy "Users can view own flies" on flies for select using (auth.uid() = user_id);
create policy "Users can insert own flies" on flies for insert with check (auth.uid() = user_id);
create policy "Users can update own flies" on flies for update using (auth.uid() = user_id);
create policy "Users can delete own flies" on flies for delete using (auth.uid() = user_id);

create policy "Users can view own spots" on spots for select using (auth.uid() = user_id);
create policy "Users can insert own spots" on spots for insert with check (auth.uid() = user_id);
create policy "Users can update own spots" on spots for update using (auth.uid() = user_id);
create policy "Users can delete own spots" on spots for delete using (auth.uid() = user_id);
