-- Aurora Weather — free-tier Supabase schema (run in SQL editor or via CLI)

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.favorite_locations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  geocode_id integer not null default 0,
  name text not null,
  country text not null default '',
  admin1 text,
  latitude double precision not null,
  longitude double precision not null,
  sort_order integer not null default 0,
  unique (user_id, latitude, longitude)
);

create index favorite_locations_user_order
  on public.favorite_locations (user_id, sort_order);

alter table public.profiles enable row level security;
alter table public.favorite_locations enable row level security;

create policy profiles_select_own on public.profiles
  for select using (auth.uid() = id);

create policy profiles_update_own on public.profiles
  for update using (auth.uid() = id);

create policy profiles_insert_own on public.profiles
  for insert with check (auth.uid() = id);

create policy favorites_all_own on public.favorite_locations
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, split_part(coalesce(new.email, 'user'), '@', 1))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();