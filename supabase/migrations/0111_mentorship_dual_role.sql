-- ============================================================================
-- worklife-iq-finland — 0111 One mentorship profile per role
--
-- A user may now be both a mentor and a mentee, with a separate profile
-- (display name, background, areas) for each role. Replaces any uniqueness on
-- user_id alone with uniqueness on (user_id, role).
--
-- mentorship_profiles was created in the dashboard, so this handles both a
-- UNIQUE constraint and a bare unique index on user_id. If user_id is the
-- primary key, it stops with an explanation instead of guessing.
--
-- Run in Supabase Dashboard → SQL Editor after 0110. Idempotent.
-- ============================================================================

do $$
declare
  c record;
begin
  if exists (
    select 1 from pg_constraint k
    where k.conrelid = 'public.mentorship_profiles'::regclass
      and k.contype = 'p'
      and k.conkey = array[(select attnum from pg_attribute
                            where attrelid = 'public.mentorship_profiles'::regclass and attname = 'user_id')]
  ) then
    raise exception 'mentorship_profiles uses user_id as its primary key; change the primary key to id before running this migration';
  end if;

  for c in
    select k.conname from pg_constraint k
    where k.conrelid = 'public.mentorship_profiles'::regclass
      and k.contype = 'u'
      and k.conkey = array[(select attnum from pg_attribute
                            where attrelid = 'public.mentorship_profiles'::regclass and attname = 'user_id')]
  loop
    execute format('alter table public.mentorship_profiles drop constraint %I', c.conname);
  end loop;

  for c in
    select i.relname from pg_index x
    join pg_class i on i.oid = x.indexrelid
    where x.indrelid = 'public.mentorship_profiles'::regclass
      and x.indisunique and not x.indisprimary
      and x.indnatts = 1
      and x.indkey[0] = (select attnum from pg_attribute
                         where attrelid = 'public.mentorship_profiles'::regclass and attname = 'user_id')
      and not exists (select 1 from pg_constraint k where k.conindid = x.indexrelid)
  loop
    execute format('drop index public.%I', c.relname);
  end loop;
end $$;

create unique index if not exists mentorship_profiles_user_role_key
  on public.mentorship_profiles (user_id, role);
