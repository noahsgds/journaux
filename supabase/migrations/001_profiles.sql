-- Profiles table for VectorLens Subject Profiles feature

create table if not exists profiles (
  id         uuid        primary key default gen_random_uuid(),
  name       text        not null,
  subjects   text[]      not null default '{}',
  color      text        not null default '#3B82F6',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function update_updated_at_column()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on profiles;

create trigger profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at_column();

-- RLS (enable if using Supabase Auth; adjust policies to your auth setup)
-- alter table profiles enable row level security;
-- create policy "Service role full access" on profiles using (true);
