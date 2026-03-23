-- SkillLens Supabase schema and RLS setup
-- Run this in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  avatar text,
  points integer not null default 0,
  streak integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.challenges (
  id bigint primary key,
  title text not null unique,
  description text not null,
  difficulty text not null,
  domain text not null,
  xp integer not null default 100,
  time_limit integer not null default 30,
  created_at timestamptz not null default now()
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  challenge_id bigint not null references public.challenges(id) on delete restrict,
  challenge_title text not null,
  lang text not null,
  code text not null,
  code_score integer not null,
  integrity_score integer not null,
  time_taken integer not null default 0,
  metrics jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.resume_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  profile jsonb not null default '{}'::jsonb,
  resume_text text not null default '',
  resume_file_name text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_submissions_user_created_at
  on public.submissions(user_id, created_at desc);

create index if not exists idx_submissions_challenge_id
  on public.submissions(challenge_id);

insert into public.challenges (id, title, description, difficulty, domain, xp, time_limit)
values
  (1, 'Two Sum', 'Return indices of two numbers that add up to target.', 'Easy', 'Arrays', 100, 30),
  (2, 'Reverse Linked List', 'Reverse a singly linked list and return head.', 'Medium', 'Linked Lists', 200, 45),
  (3, 'Binary Search', 'Find target index in sorted array in O(log n).', 'Easy', 'Search', 100, 25),
  (4, 'Valid Parentheses', 'Validate bracket sequence with stack logic.', 'Easy', 'Stack', 120, 25),
  (5, 'Maximum Subarray', 'Find contiguous subarray with maximum sum.', 'Medium', 'Dynamic Programming', 220, 40),
  (6, 'Climbing Stairs', 'Count ways to reach n stairs using 1 or 2 steps.', 'Easy', 'Dynamic Programming', 130, 20),
  (7, 'Merge Two Sorted Lists', 'Merge two sorted linked lists.', 'Easy', 'Linked Lists', 150, 30),
  (8, 'Best Time to Buy Stock', 'Compute max profit with one buy and one sell.', 'Easy', 'Arrays', 140, 25),
  (9, 'Longest Common Prefix', 'Find longest common prefix among strings.', 'Easy', 'Strings', 110, 20),
  (10, 'Number of Islands', 'Count connected land components in grid.', 'Hard', 'Graphs', 350, 60),
  (11, '3Sum', 'Find unique triplets that sum to zero.', 'Hard', 'Arrays', 320, 55),
  (12, 'LRU Cache', 'Design an O(1) LRU cache.', 'Hard', 'Design', 400, 70)
on conflict (id) do update
set
  title = excluded.title,
  description = excluded.description,
  difficulty = excluded.difficulty,
  domain = excluded.domain,
  xp = excluded.xp,
  time_limit = excluded.time_limit;

alter table public.profiles enable row level security;
alter table public.submissions enable row level security;
alter table public.challenges enable row level security;
alter table public.resume_profiles enable row level security;

-- Profiles: users can read/update only their own profile.
drop policy if exists "Profiles select own" on public.profiles;
create policy "Profiles select own"
  on public.profiles
  for select
  using (auth.uid() = id);

drop policy if exists "Profiles insert own" on public.profiles;
create policy "Profiles insert own"
  on public.profiles
  for insert
  with check (auth.uid() = id);

drop policy if exists "Profiles update own" on public.profiles;
create policy "Profiles update own"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Submissions: users can read/write only their own submissions.
drop policy if exists "Submissions select own" on public.submissions;
create policy "Submissions select own"
  on public.submissions
  for select
  using (auth.uid() = user_id);

drop policy if exists "Submissions insert own" on public.submissions;
create policy "Submissions insert own"
  on public.submissions
  for insert
  with check (auth.uid() = user_id);

-- Resume profiles: users can read/write only their own saved resume/profile payload.
drop policy if exists "Resume profiles select own" on public.resume_profiles;
create policy "Resume profiles select own"
  on public.resume_profiles
  for select
  using (auth.uid() = user_id);

drop policy if exists "Resume profiles insert own" on public.resume_profiles;
create policy "Resume profiles insert own"
  on public.resume_profiles
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Resume profiles update own" on public.resume_profiles;
create policy "Resume profiles update own"
  on public.resume_profiles
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Challenges: all authenticated users can read.
drop policy if exists "Challenges select authenticated" on public.challenges;
create policy "Challenges select authenticated"
  on public.challenges
  for select
  using (auth.role() = 'authenticated');
