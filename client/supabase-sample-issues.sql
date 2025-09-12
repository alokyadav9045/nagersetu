-- Seed: Three sample issue reports
-- Usage: Run in Supabase SQL editor after creating categories
-- If you haven't yet, run: client/supabase-issue-categories.sql first

-- Optional: Uncomment to allow inserts if RLS blocks with 42501
-- alter table public.issues enable row level security;
-- drop policy if exists issues_insert_all on public.issues;
-- create policy issues_insert_all on public.issues for insert
--   to anon, authenticated using (true) with check (true);
-- drop policy if exists user_profiles_insert_all on public.user_profiles;
-- create policy user_profiles_insert_all on public.user_profiles for insert
--   to anon, authenticated using (true) with check (true);

begin;

-- Ensure a sample user exists
insert into public.user_profiles (id, email, full_name, role, is_active)
values
  ('11111111-1111-1111-1111-111111111111', 'citizen1@nagarsetu.gov.in', 'Asha Verma', 'citizen', true)
on conflict (id) do nothing;

-- Insert sample issues using category names to resolve category_id
insert into public.issues (
  title,
  description,
  category_id,
  category,
  status,
  priority,
  location_lat,
  location_lng,
  location_address,
  images,
  citizen_id
) values
(
  'Water leakage near Sector 12',
  'Continuous water leakage from main pipeline causing road damage and water wastage.',
  (select id from public.issue_categories where name = 'Water Supply' limit 1),
  'Water Supply',
  'pending',
  'high',
  28.6139,
  77.2090,
  'Sector 12, Near Community Center, City',
  array['/globe.svg','/nextjs.png'],
  '11111111-1111-1111-1111-111111111111'
),
(
  'Potholes on main road',
  'Multiple potholes developed after rain; risk of accidents for two-wheelers.',
  (select id from public.issue_categories where name = 'Roads & Infrastructure' limit 1),
  'Roads & Infrastructure',
  'pending',
  'medium',
  28.4595,
  77.0266,
  'Main Road, Near Market Square, City',
  array['/window.svg'],
  '11111111-1111-1111-1111-111111111111'
),
(
  'Garbage not collected for 3 days',
  'Waste bins overflowing and foul smell in the lane. Needs urgent attention.',
  (select id from public.issue_categories where name = 'Waste Management' limit 1),
  'Waste Management',
  'pending',
  'urgent',
  19.0760,
  72.8777,
  'Lane 4, Housing Society, City',
  array['/file.svg','/vercel.svg'],
  '11111111-1111-1111-1111-111111111111'
);

commit;

-- Verify
select id, title, status, priority, category_id, citizen_id, created_at
from public.issues
order by created_at desc
limit 10;
