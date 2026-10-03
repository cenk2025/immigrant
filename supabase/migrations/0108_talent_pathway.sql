-- ============================================================================
-- worklife-iq-finland — 0108 Talent Pathway (Osaajapolku)
--
--   pathway_profiles      one row per student: arrival date, permit tracker,
--                         completed pre-arrival tasks, cohort membership
--   job_postings          internships / part-time jobs posted by employers,
--                         tagged with ESCO skills for CV matching
--   institutions          B2B workspaces for higher-education institutions
--   institution_admins    advisors of an institution (owner / advisor)
--   institution_cohorts   student groups, joined with an invite code
--   institution_content   advisor-written content shown to their students
--   retention_responses   "Are you still in the region?" follow-up survey
--
-- Privacy model: advisors NEVER read individual student rows. They only get
-- aggregates through SECURITY DEFINER RPCs, and those return nothing but the
-- group size when a cohort has fewer than 5 students (k-anonymity).
--
-- Run in Supabase Dashboard → SQL Editor. Idempotent.
-- ============================================================================

-- ── Tables ──────────────────────────────────────────────────────────────────

create table if not exists public.institutions (
  id                   uuid primary key default gen_random_uuid(),
  name                 text not null check (char_length(name) between 2 and 160),
  region               text,
  advisor_invite_code  text not null unique
                       default upper(substr(md5(random()::text || clock_timestamp()::text), 1, 10)),
  is_verified          boolean not null default false,
  created_by           uuid not null references auth.users(id) on delete cascade,
  created_at           timestamptz not null default now()
);

create table if not exists public.institution_admins (
  institution_id  uuid not null references public.institutions(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  role            text not null default 'advisor' check (role in ('owner', 'advisor')),
  created_at      timestamptz not null default now(),
  primary key (institution_id, user_id)
);

create table if not exists public.institution_cohorts (
  id                     uuid primary key default gen_random_uuid(),
  institution_id         uuid not null references public.institutions(id) on delete cascade,
  name                   text not null check (char_length(name) between 2 and 120),
  intake_term            text,
  invite_code            text not null unique
                         default upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8)),
  retention_survey_open  boolean not null default false,
  created_at             timestamptz not null default now()
);

create table if not exists public.pathway_profiles (
  user_id              uuid primary key references auth.users(id) on delete cascade,
  arrival_date         date,
  permit_status        text not null default 'not_started'
                       check (permit_status in (
                         'not_started', 'submitted', 'identity_verified',
                         'additional_info', 'decision_positive', 'card_received'
                       )),
  permit_submitted_on  date,
  completed_tasks      text[] not null default '{}',
  cohort_id            uuid references public.institution_cohorts(id) on delete set null,
  updated_at           timestamptz not null default now()
);

create table if not exists public.institution_content (
  id              uuid primary key default gen_random_uuid(),
  institution_id  uuid not null references public.institutions(id) on delete cascade,
  cohort_id       uuid references public.institution_cohorts(id) on delete cascade,
  title           text not null check (char_length(title) between 2 and 160),
  body            text not null default '',
  link_url        text,
  created_by      uuid references auth.users(id) on delete set null,
  created_at      timestamptz not null default now()
);

create table if not exists public.retention_responses (
  id                uuid primary key default gen_random_uuid(),
  cohort_id         uuid not null references public.institution_cohorts(id) on delete cascade,
  user_id           uuid not null references auth.users(id) on delete cascade,
  in_region         boolean not null,
  status            text not null check (status in ('employed', 'studying', 'job_seeking', 'entrepreneur', 'other')),
  employed_in_field boolean,
  would_recommend   smallint check (would_recommend between 1 and 5),
  created_at        timestamptz not null default now(),
  unique (cohort_id, user_id)
);

create table if not exists public.job_postings (
  id                    uuid primary key default gen_random_uuid(),
  employer_user_id      uuid not null references auth.users(id) on delete cascade,
  company_name          text not null check (char_length(company_name) between 2 and 120),
  title                 text not null check (char_length(title) between 2 and 160),
  description           text not null default '',
  job_type              text not null check (job_type in ('internship', 'part_time', 'summer', 'thesis')),
  region                text not null,
  city                  text,
  language_requirements text,
  apply_url             text,
  contact_email         text,
  skills                jsonb not null default '[]'::jsonb,   -- [{ "uri": "...", "label": "..." }]
  is_active             boolean not null default true,
  expires_on            date,
  created_at            timestamptz not null default now()
);

create index if not exists job_postings_active_idx on public.job_postings (is_active, created_at desc);
create index if not exists pathway_profiles_cohort_idx on public.pathway_profiles (cohort_id);
create index if not exists institution_cohorts_inst_idx on public.institution_cohorts (institution_id);
create index if not exists retention_responses_cohort_idx on public.retention_responses (cohort_id);

-- ── Helpers (SECURITY DEFINER so policies don't recurse through RLS) ────────

create or replace function public.is_institution_admin(p_institution_id uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.institution_admins
    where institution_id = p_institution_id and user_id = auth.uid()
  );
$$;

create or replace function public.my_cohort_institution()
returns uuid
language sql stable security definer set search_path = public
as $$
  select c.institution_id
  from public.pathway_profiles p
  join public.institution_cohorts c on c.id = p.cohort_id
  where p.user_id = auth.uid();
$$;

create or replace function public.cohort_survey_open(p_cohort_id uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select coalesce((select retention_survey_open from public.institution_cohorts where id = p_cohort_id), false);
$$;

-- ── RLS ─────────────────────────────────────────────────────────────────────

alter table public.institutions         enable row level security;
alter table public.institution_admins   enable row level security;
alter table public.institution_cohorts  enable row level security;
alter table public.pathway_profiles     enable row level security;
alter table public.institution_content  enable row level security;
alter table public.retention_responses  enable row level security;
alter table public.job_postings         enable row level security;

-- institutions: only its advisors see the row (it holds the advisor code).
-- Creation goes through create_institution(); verification is set by the
-- platform operator in the SQL editor.
drop policy if exists "institutions_admin_read" on public.institutions;
create policy "institutions_admin_read" on public.institutions
  for select using (public.is_institution_admin(id));

drop policy if exists "institutions_owner_update" on public.institutions;
create policy "institutions_owner_update" on public.institutions
  for update using (
    exists (select 1 from public.institution_admins a
            where a.institution_id = id and a.user_id = auth.uid() and a.role = 'owner')
  );

-- institution_admins: advisors see the advisor list of their institutions.
drop policy if exists "institution_admins_read" on public.institution_admins;
create policy "institution_admins_read" on public.institution_admins
  for select using (public.is_institution_admin(institution_id));

-- institution_cohorts: advisors manage cohorts. Students reach their own
-- cohort through my_cohort() instead of reading this table.
drop policy if exists "cohorts_admin_read" on public.institution_cohorts;
create policy "cohorts_admin_read" on public.institution_cohorts
  for select using (public.is_institution_admin(institution_id));

drop policy if exists "cohorts_admin_insert" on public.institution_cohorts;
create policy "cohorts_admin_insert" on public.institution_cohorts
  for insert with check (public.is_institution_admin(institution_id));

drop policy if exists "cohorts_admin_update" on public.institution_cohorts;
create policy "cohorts_admin_update" on public.institution_cohorts
  for update using (public.is_institution_admin(institution_id));

drop policy if exists "cohorts_admin_delete" on public.institution_cohorts;
create policy "cohorts_admin_delete" on public.institution_cohorts
  for delete using (public.is_institution_admin(institution_id));

-- pathway_profiles: strictly own row. Cohort membership changes go through
-- join_cohort() / leave_cohort(), so the client may not set cohort_id itself.
drop policy if exists "pathway_own_read" on public.pathway_profiles;
create policy "pathway_own_read" on public.pathway_profiles
  for select using (auth.uid() = user_id);

drop policy if exists "pathway_own_insert" on public.pathway_profiles;
create policy "pathway_own_insert" on public.pathway_profiles
  for insert with check (auth.uid() = user_id and cohort_id is null);

drop policy if exists "pathway_own_update" on public.pathway_profiles;
create policy "pathway_own_update" on public.pathway_profiles
  for update using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and cohort_id is not distinct from (
      select p.cohort_id from public.pathway_profiles p where p.user_id = auth.uid()
    )
  );

drop policy if exists "pathway_own_delete" on public.pathway_profiles;
create policy "pathway_own_delete" on public.pathway_profiles
  for delete using (auth.uid() = user_id);

-- institution_content: advisors write; their students read.
drop policy if exists "content_read" on public.institution_content;
create policy "content_read" on public.institution_content
  for select using (
    public.is_institution_admin(institution_id)
    or (
      institution_id = public.my_cohort_institution()
      and (
        cohort_id is null
        or cohort_id = (select p.cohort_id from public.pathway_profiles p where p.user_id = auth.uid())
      )
    )
  );

drop policy if exists "content_admin_insert" on public.institution_content;
create policy "content_admin_insert" on public.institution_content
  for insert with check (public.is_institution_admin(institution_id) and created_by = auth.uid());

drop policy if exists "content_admin_update" on public.institution_content;
create policy "content_admin_update" on public.institution_content
  for update using (public.is_institution_admin(institution_id));

drop policy if exists "content_admin_delete" on public.institution_content;
create policy "content_admin_delete" on public.institution_content
  for delete using (public.is_institution_admin(institution_id));

-- retention_responses: a student answers for their own cohort, only while the
-- survey is open. Advisors only see aggregates (cohort_retention_stats).
drop policy if exists "retention_own_read" on public.retention_responses;
create policy "retention_own_read" on public.retention_responses
  for select using (auth.uid() = user_id);

drop policy if exists "retention_own_insert" on public.retention_responses;
create policy "retention_own_insert" on public.retention_responses
  for insert with check (
    auth.uid() = user_id
    and cohort_id = (select p.cohort_id from public.pathway_profiles p where p.user_id = auth.uid())
    and public.cohort_survey_open(cohort_id)
  );

drop policy if exists "retention_own_update" on public.retention_responses;
create policy "retention_own_update" on public.retention_responses
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- job_postings: active postings are public; employers manage their own.
drop policy if exists "jobs_read" on public.job_postings;
create policy "jobs_read" on public.job_postings
  for select using (
    (is_active and (expires_on is null or expires_on >= current_date))
    or employer_user_id = auth.uid()
  );

drop policy if exists "jobs_own_insert" on public.job_postings;
create policy "jobs_own_insert" on public.job_postings
  for insert with check (auth.uid() = employer_user_id);

drop policy if exists "jobs_own_update" on public.job_postings;
create policy "jobs_own_update" on public.job_postings
  for update using (auth.uid() = employer_user_id) with check (auth.uid() = employer_user_id);

drop policy if exists "jobs_own_delete" on public.job_postings;
create policy "jobs_own_delete" on public.job_postings
  for delete using (auth.uid() = employer_user_id);

-- ── RPCs: institution & cohort membership ───────────────────────────────────

create or replace function public.create_institution(p_name text, p_region text)
returns uuid
language plpgsql security definer set search_path = public
as $$
declare
  v_id uuid;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  insert into public.institutions (name, region, created_by)
  values (trim(p_name), nullif(trim(p_region), ''), auth.uid())
  returning id into v_id;
  insert into public.institution_admins (institution_id, user_id, role)
  values (v_id, auth.uid(), 'owner');
  return v_id;
end;
$$;

create or replace function public.join_institution_as_advisor(p_code text)
returns uuid
language plpgsql security definer set search_path = public
as $$
declare
  v_id uuid;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  select id into v_id from public.institutions
  where advisor_invite_code = upper(trim(p_code));
  if v_id is null then
    raise exception 'invalid code';
  end if;
  insert into public.institution_admins (institution_id, user_id, role)
  values (v_id, auth.uid(), 'advisor')
  on conflict do nothing;
  return v_id;
end;
$$;

create or replace function public.join_cohort(p_code text)
returns uuid
language plpgsql security definer set search_path = public
as $$
declare
  v_cohort uuid;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  select id into v_cohort from public.institution_cohorts
  where invite_code = upper(trim(p_code));
  if v_cohort is null then
    raise exception 'invalid code';
  end if;
  insert into public.pathway_profiles (user_id, cohort_id)
  values (auth.uid(), v_cohort)
  on conflict (user_id) do update set cohort_id = excluded.cohort_id, updated_at = now();
  return v_cohort;
end;
$$;

create or replace function public.leave_cohort()
returns void
language sql security definer set search_path = public
as $$
  update public.pathway_profiles set cohort_id = null, updated_at = now()
  where user_id = auth.uid();
$$;

-- The student's own cohort + institution names (they can't read those tables).
create or replace function public.my_cohort()
returns table (
  cohort_id             uuid,
  cohort_name           text,
  institution_name      text,
  institution_verified  boolean,
  retention_survey_open boolean
)
language sql stable security definer set search_path = public
as $$
  select c.id, c.name, i.name, i.is_verified, c.retention_survey_open
  from public.pathway_profiles p
  join public.institution_cohorts c on c.id = p.cohort_id
  join public.institutions i on i.id = c.institution_id
  where p.user_id = auth.uid();
$$;

-- ── RPCs: anonymous aggregates for advisors ─────────────────────────────────
-- Below 5 students only member_count is returned; every other field is null.

drop function if exists public.cohort_progress_stats(uuid);
create or replace function public.cohort_progress_stats(p_cohort_id uuid, p_total_tasks int)
returns table (
  member_count        int,
  avg_completion_pct  numeric,
  with_arrival_date   int,
  arrived_count       int,
  task_counts         jsonb,   -- { "task_id": completed_count }
  permit_counts       jsonb    -- { "status": count }
)
language plpgsql stable security definer set search_path = public
as $$
declare
  v_inst  uuid;
  v_count int;
  v_total int := greatest(coalesce(p_total_tasks, 1), 1);
begin
  select institution_id into v_inst from public.institution_cohorts where id = p_cohort_id;
  if v_inst is null or not public.is_institution_admin(v_inst) then
    raise exception 'not allowed';
  end if;

  select count(*) into v_count from public.pathway_profiles where cohort_id = p_cohort_id;

  if v_count < 5 then
    return query select v_count, null::numeric, null::int, null::int, null::jsonb, null::jsonb;
    return;
  end if;

  return query
  select
    v_count,
    round(avg(least(coalesce(array_length(p.completed_tasks, 1), 0), v_total)::numeric / v_total * 100), 1),
    count(*) filter (where p.arrival_date is not null)::int,
    count(*) filter (where p.arrival_date <= current_date)::int,
    (select coalesce(jsonb_object_agg(t.task, t.n), '{}'::jsonb)
       from (select unnest(p2.completed_tasks) as task, count(*) as n
               from public.pathway_profiles p2 where p2.cohort_id = p_cohort_id
              group by 1) t),
    (select coalesce(jsonb_object_agg(s.permit_status, s.n), '{}'::jsonb)
       from (select p3.permit_status, count(*) as n
               from public.pathway_profiles p3 where p3.cohort_id = p_cohort_id
              group by 1) s)
  from public.pathway_profiles p
  where p.cohort_id = p_cohort_id;
end;
$$;

create or replace function public.cohort_retention_stats(p_cohort_id uuid)
returns table (
  response_count       int,
  in_region_pct        numeric,
  employed_in_field_pct numeric,
  avg_recommend        numeric,
  status_counts        jsonb
)
language plpgsql stable security definer set search_path = public
as $$
declare
  v_inst  uuid;
  v_count int;
begin
  select institution_id into v_inst from public.institution_cohorts where id = p_cohort_id;
  if v_inst is null or not public.is_institution_admin(v_inst) then
    raise exception 'not allowed';
  end if;

  select count(*) into v_count from public.retention_responses where cohort_id = p_cohort_id;

  if v_count < 5 then
    return query select v_count, null::numeric, null::numeric, null::numeric, null::jsonb;
    return;
  end if;

  return query
  select
    v_count,
    round(avg(case when r.in_region then 100 else 0 end), 1),
    round(avg(case when r.employed_in_field then 100 else 0 end)
          filter (where r.employed_in_field is not null), 1),
    round(avg(r.would_recommend), 1),
    (select coalesce(jsonb_object_agg(s.status, s.n), '{}'::jsonb)
       from (select r2.status, count(*) as n from public.retention_responses r2
              where r2.cohort_id = p_cohort_id group by 1) s)
  from public.retention_responses r
  where r.cohort_id = p_cohort_id;
end;
$$;

-- Member counts for the cohort list (counts only — safe at any size).
create or replace function public.institution_cohort_sizes(p_institution_id uuid)
returns table (cohort_id uuid, member_count int)
language plpgsql stable security definer set search_path = public
as $$
begin
  if not public.is_institution_admin(p_institution_id) then
    raise exception 'not allowed';
  end if;
  return query
  select c.id, count(p.user_id)::int
  from public.institution_cohorts c
  left join public.pathway_profiles p on p.cohort_id = c.id
  where c.institution_id = p_institution_id
  group by c.id;
end;
$$;

-- ── Grants ──────────────────────────────────────────────────────────────────

revoke all on function public.create_institution(text, text)       from public, anon;
revoke all on function public.join_institution_as_advisor(text)     from public, anon;
revoke all on function public.join_cohort(text)                     from public, anon;
revoke all on function public.leave_cohort()                        from public, anon;
revoke all on function public.my_cohort()                           from public, anon;
revoke all on function public.cohort_progress_stats(uuid, int)      from public, anon;
revoke all on function public.cohort_retention_stats(uuid)          from public, anon;
revoke all on function public.institution_cohort_sizes(uuid)        from public, anon;

grant execute on function public.create_institution(text, text)     to authenticated;
grant execute on function public.join_institution_as_advisor(text)  to authenticated;
grant execute on function public.join_cohort(text)                  to authenticated;
grant execute on function public.leave_cohort()                     to authenticated;
grant execute on function public.my_cohort()                        to authenticated;
grant execute on function public.cohort_progress_stats(uuid, int)   to authenticated;
grant execute on function public.cohort_retention_stats(uuid)       to authenticated;
grant execute on function public.institution_cohort_sizes(uuid)     to authenticated;
