-- Create issue_categories table (if not exists) and seed default categories
-- Run this in Supabase SQL editor for your project

create table if not exists public.issue_categories (
  id serial primary key,
  name text not null unique,
  description text,
  icon text,
  color text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Keep updated_at current
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_issue_categories_updated_at on public.issue_categories;
create trigger trg_issue_categories_updated_at
  before update on public.issue_categories
  for each row execute function public.set_updated_at();

-- Enable RLS and allow public read (adjust as needed)
alter table public.issue_categories enable row level security;

drop policy if exists issue_categories_read_all on public.issue_categories;
create policy issue_categories_read_all on public.issue_categories
  for select to anon, authenticated
  using (true);

-- Seed default categories (id will auto-generate; name is unique)
insert into public.issue_categories (name, description, icon, color) values
  ('Water Supply', 'Water related issues', 'droplets', 'blue'),
  ('Roads & Infrastructure', 'Road and infrastructure issues', 'road', 'gray'),
  ('Electricity', 'Power and electrical issues', 'zap', 'yellow'),
  ('Waste Management', 'Garbage and cleanliness', 'trash-2', 'green'),
  ('Public Safety', 'Safety and security concerns', 'shield', 'red'),
  ('Other', 'Other civic issues', 'more-horizontal', 'gray')
on conflict (name) do nothing;
