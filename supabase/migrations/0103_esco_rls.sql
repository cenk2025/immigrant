-- ============================================================================
-- worklife-iq-finland — 0103 ESCO read-only RLS
-- ESCO reference data is public knowledge: anyone (anon or authenticated) may
-- read it, nobody may write it through the API. The import (02_transform.sql)
-- runs in the SQL editor as service_role, which bypasses RLS.
-- ============================================================================

alter table public.esco_occupations               enable row level security;
alter table public.esco_skills                     enable row level security;
alter table public.esco_occupation_skill_relations enable row level security;

drop policy if exists "esco_occupations_read" on public.esco_occupations;
create policy "esco_occupations_read" on public.esco_occupations
  for select using (true);

drop policy if exists "esco_skills_read" on public.esco_skills;
create policy "esco_skills_read" on public.esco_skills
  for select using (true);

drop policy if exists "esco_relations_read" on public.esco_occupation_skill_relations;
create policy "esco_relations_read" on public.esco_occupation_skill_relations
  for select using (true);

-- No INSERT / UPDATE / DELETE policies are defined, so writes are denied for
-- the anon and authenticated roles (service_role still bypasses RLS for imports).
