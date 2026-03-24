-- SkillLens Supabase schema and RLS setup
-- Run this in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  avatar text,
  role text not null default 'student',
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
  resume_file_data text not null default '',
  resume_file_mime text not null default '',
  resume_file_size integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  company text not null,
  description text not null,
  required_skills text[] not null default '{}',
  domain text not null,
  min_skill_score integer not null default 50,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.job_matches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  match_score integer not null,
  match_reasons text[] not null default '{}',
  missing_skills text[] not null default '{}',
  created_at timestamptz not null default now(),
  unique(user_id, job_id)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid references public.jobs(id) on delete set null,
  message text not null,
  seen boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.company_tests (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  role_title text not null,
  description text not null default '',
  created_by uuid not null references auth.users(id) on delete cascade,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.company_test_questions (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null references public.company_tests(id) on delete cascade,
  challenge_id bigint not null references public.challenges(id) on delete restrict,
  question_order integer not null default 1,
  weight integer not null default 1,
  created_at timestamptz not null default now(),
  unique(test_id, challenge_id)
);

create table if not exists public.company_test_assignments (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null references public.company_tests(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  assigned_by uuid not null references auth.users(id) on delete cascade,
  status text not null default 'assigned',
  assigned_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(test_id, user_id)
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_role_check'
  ) then
    alter table public.profiles
      add constraint profiles_role_check check (role in ('student', 'recruiter', 'admin'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'jobs_min_skill_score_check'
  ) then
    alter table public.jobs
      add constraint jobs_min_skill_score_check check (min_skill_score between 0 and 100);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'job_matches_match_score_check'
  ) then
    alter table public.job_matches
      add constraint job_matches_match_score_check check (match_score between 0 and 100);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'company_test_assignments_status_check'
  ) then
    alter table public.company_test_assignments
      add constraint company_test_assignments_status_check check (status in ('assigned', 'in_progress', 'completed'));
  end if;
end $$;

-- Ensure newly added resume file columns exist for already-provisioned databases.
alter table if exists public.resume_profiles
  add column if not exists resume_file_data text not null default '';

alter table if exists public.resume_profiles
  add column if not exists resume_file_mime text not null default '';

alter table if exists public.resume_profiles
  add column if not exists resume_file_size integer not null default 0;

alter table if exists public.profiles
  add column if not exists role text not null default 'student';

alter table if exists public.jobs
  add column if not exists required_skills text[] not null default '{}';

alter table if exists public.jobs
  add column if not exists min_skill_score integer not null default 50;

alter table if exists public.jobs
  add column if not exists updated_at timestamptz not null default now();

create index if not exists idx_submissions_user_created_at
  on public.submissions(user_id, created_at desc);

create index if not exists idx_submissions_challenge_id
  on public.submissions(challenge_id);

create index if not exists idx_jobs_created_by
  on public.jobs(created_by, created_at desc);

create index if not exists idx_job_matches_user
  on public.job_matches(user_id, match_score desc);

create index if not exists idx_notifications_user_seen
  on public.notifications(user_id, seen, created_at desc);

create index if not exists idx_company_tests_creator
  on public.company_tests(created_by, created_at desc);

create index if not exists idx_company_test_questions_test
  on public.company_test_questions(test_id, question_order);

create index if not exists idx_company_test_assignments_test
  on public.company_test_assignments(test_id, assigned_at desc);

create index if not exists idx_company_test_assignments_user
  on public.company_test_assignments(user_id, assigned_at desc);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_resume_profiles_updated_at on public.resume_profiles;
create trigger trg_resume_profiles_updated_at
before update on public.resume_profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_jobs_updated_at on public.jobs;
create trigger trg_jobs_updated_at
before update on public.jobs
for each row execute function public.set_updated_at();

drop trigger if exists trg_company_tests_updated_at on public.company_tests;
create trigger trg_company_tests_updated_at
before update on public.company_tests
for each row execute function public.set_updated_at();

drop trigger if exists trg_company_test_assignments_updated_at on public.company_test_assignments;
create trigger trg_company_test_assignments_updated_at
before update on public.company_test_assignments
for each row execute function public.set_updated_at();

insert into public.challenges (id, title, description, difficulty, domain, xp, time_limit)
values
  (1, 'Google SDE Screen - Pair Sum', 'Company test: Google SDE screening round. Return indices of two numbers that add up to target.', 'Easy', 'SDE Screening', 100, 30),
  (2, 'Meta Backend Round - Reverse Linked List', 'Company test: Meta backend engineer evaluation. Reverse a singly linked list.', 'Medium', 'Backend Hiring', 200, 45),
  (3, 'Amazon OA - Binary Search in Logs', 'Company test: Amazon online assessment. Find target index in sorted array in O(log n).', 'Easy', 'SDE Screening', 100, 25),
  (4, 'Microsoft Frontend Test - Bracket Validator', 'Company test: Microsoft frontend interview challenge. Validate bracket sequence with stack logic.', 'Easy', 'Frontend Hiring', 120, 25),
  (5, 'Netflix Data Role - Maximum Subarray', 'Company test: Netflix data engineering round. Find contiguous subarray with maximum sum.', 'Medium', 'Data Engineering', 220, 40),
  (6, 'Uber Internship Test - Climbing Stairs', 'Company test: Uber SWE internship screening. Count ways to reach n stairs using 1 or 2 steps.', 'Easy', 'Internship Hiring', 130, 20),
  (7, 'Apple Platform Round - Merge Sorted Lists', 'Company test: Apple platform engineering interview. Merge two sorted linked lists.', 'Easy', 'Platform Hiring', 150, 30),
  (8, 'Stripe Backend Test - Max Profit Stream', 'Company test: Stripe backend hiring assessment. Compute max profit with one buy and one sell.', 'Easy', 'Backend Hiring', 140, 25),
  (9, 'Atlassian UI Round - Longest Common Prefix', 'Company test: Atlassian UI engineer assessment. Find longest common prefix among strings.', 'Easy', 'Frontend Hiring', 110, 20),
  (10, 'Google Maps Round - Number of Islands', 'Company test: Google Maps backend interview. Count connected land components in grid.', 'Hard', 'Distributed Systems', 350, 60),
  (11, 'Palantir Platform Test - 3Sum', 'Company test: Palantir platform engineer round. Find unique triplets that sum to zero.', 'Hard', 'Platform Hiring', 320, 55),
  (12, 'FAANG Final Round - LRU Cache', 'Company test: FAANG final technical round. Design an O(1) LRU cache.', 'Hard', 'System Design', 400, 70)
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
alter table public.jobs enable row level security;
alter table public.job_matches enable row level security;
alter table public.notifications enable row level security;
alter table public.company_tests enable row level security;
alter table public.company_test_questions enable row level security;
alter table public.company_test_assignments enable row level security;

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

drop policy if exists "Profiles role update own" on public.profiles;
create policy "Profiles role update own"
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

-- Jobs: all authenticated users can read; only recruiters/admin can insert.
drop policy if exists "Jobs select authenticated" on public.jobs;
create policy "Jobs select authenticated"
  on public.jobs
  for select
  using (auth.role() = 'authenticated');

drop policy if exists "Jobs insert recruiter" on public.jobs;
create policy "Jobs insert recruiter"
  on public.jobs
  for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('recruiter', 'admin')
    )
  );

drop policy if exists "Jobs update creator" on public.jobs;
create policy "Jobs update creator"
  on public.jobs
  for update
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

-- Job matches: users can read their own matches.
drop policy if exists "Job matches select own" on public.job_matches;
create policy "Job matches select own"
  on public.job_matches
  for select
  using (auth.uid() = user_id);

-- Notifications: users can read/update own notifications.
drop policy if exists "Notifications select own" on public.notifications;
create policy "Notifications select own"
  on public.notifications
  for select
  using (auth.uid() = user_id);

drop policy if exists "Notifications update own" on public.notifications;
create policy "Notifications update own"
  on public.notifications
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Company tests: recruiters/admin can create and manage their own tests.
drop policy if exists "Company tests select authenticated" on public.company_tests;
create policy "Company tests select authenticated"
  on public.company_tests
  for select
  using (auth.role() = 'authenticated');

drop policy if exists "Company tests insert recruiter" on public.company_tests;
create policy "Company tests insert recruiter"
  on public.company_tests
  for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('recruiter', 'admin')
    )
  );

drop policy if exists "Company tests update creator" on public.company_tests;
create policy "Company tests update creator"
  on public.company_tests
  for update
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

drop policy if exists "Company test questions select authenticated" on public.company_test_questions;
create policy "Company test questions select authenticated"
  on public.company_test_questions
  for select
  using (auth.role() = 'authenticated');

drop policy if exists "Company test questions insert recruiter" on public.company_test_questions;
create policy "Company test questions insert recruiter"
  on public.company_test_questions
  for insert
  with check (
    exists (
      select 1
      from public.company_tests t
      join public.profiles p on p.id = auth.uid()
      where t.id = company_test_questions.test_id
        and t.created_by = auth.uid()
        and p.role in ('recruiter', 'admin')
    )
  );

drop policy if exists "Company test assignments select own_or_owner" on public.company_test_assignments;
create policy "Company test assignments select own_or_owner"
  on public.company_test_assignments
  for select
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.company_tests t
      where t.id = company_test_assignments.test_id
        and t.created_by = auth.uid()
    )
  );

drop policy if exists "Company test assignments insert recruiter_owner" on public.company_test_assignments;
create policy "Company test assignments insert recruiter_owner"
  on public.company_test_assignments
  for insert
  with check (
    exists (
      select 1
      from public.company_tests t
      join public.profiles p on p.id = auth.uid()
      where t.id = company_test_assignments.test_id
        and t.created_by = auth.uid()
        and p.role in ('recruiter', 'admin')
    )
  );

drop policy if exists "Company test assignments update own_or_owner" on public.company_test_assignments;
create policy "Company test assignments update own_or_owner"
  on public.company_test_assignments
  for update
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.company_tests t
      where t.id = company_test_assignments.test_id
        and t.created_by = auth.uid()
    )
  )
  with check (
    auth.uid() = user_id
    or exists (
      select 1 from public.company_tests t
      where t.id = company_test_assignments.test_id
        and t.created_by = auth.uid()
    )
  );
