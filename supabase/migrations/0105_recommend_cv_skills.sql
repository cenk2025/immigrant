-- ============================================================================
-- worklife-iq-finland — 0105 recommend_cv_skills RPC (history-based, SQL only)
-- Answers, for the CV "taidot / skills" section: "Based on the occupations in
-- your CV work history, here are skills you likely should add or develop."
--
--   H = p_occupation_uris      → ESCO occupations from the CV work history
--   S = p_existing_skill_uris  → ESCO skills already listed on the CV (excluded)
--
-- Per candidate skill:
--   demand_count = how many H occupations require it as ESSENTIAL
--   score        = Σ over H of (essential ? 1.0 : 0.4)
-- Ranked by score DESC, then demand_count DESC. Top 25. Excludes skills in S.
-- why_occupations = the user's own occupation labels that require the skill.
--
-- No AI: pure SQL over the ESCO relations. SECURITY INVOKER (default) so RLS on
-- the public-read ESCO tables applies; granted to authenticated only.
-- Requires 0100 (tables), 0102 (indexes), and the data import.
-- ============================================================================

create or replace function public.recommend_cv_skills(
  p_occupation_uris     text[],
  p_existing_skill_uris text[] default '{}',
  p_locale              text   default 'fi',
  p_essential_only      boolean default true
)
returns table (
  skill_uri       text,
  label           text,
  description     text,
  skill_type      text,
  reuse_level     text,
  demand_count    int,
  score           numeric,
  why_occupations text[]
)
language sql
stable
as $$
  with rel as (
    -- Relations from the user's history occupations, optionally essential-only.
    select r.skill_uri, r.relation_type, r.occupation_uri
    from public.esco_occupation_skill_relations r
    where r.occupation_uri = any(p_occupation_uris)
      and (not p_essential_only or r.relation_type = 'essential')
  )
  select
    s.concept_uri as skill_uri,
    coalesce(nullif(case when p_locale = 'fi' then s.preferred_label_fi else s.preferred_label_en end, ''),
             s.preferred_label_en)                                                              as label,
    coalesce(nullif(case when p_locale = 'fi' then s.description_fi else s.description_en end, ''),
             s.description_en)                                                                  as description,
    s.skill_type,
    s.reuse_level,
    count(*) filter (where rel.relation_type = 'essential')::int                                as demand_count,
    sum(case when rel.relation_type = 'essential' then 1.0 else 0.4 end)                        as score,
    array_agg(distinct
      coalesce(nullif(case when p_locale = 'fi' then o.preferred_label_fi else o.preferred_label_en end, ''),
               o.preferred_label_en)
    )                                                                                           as why_occupations
  from rel
  join public.esco_skills      s on s.concept_uri = rel.skill_uri
  join public.esco_occupations o on o.concept_uri = rel.occupation_uri
  where rel.skill_uri <> all (coalesce(p_existing_skill_uris, '{}'))
  group by s.concept_uri, s.preferred_label_fi, s.preferred_label_en,
           s.description_fi, s.description_en, s.skill_type, s.reuse_level
  order by score desc, demand_count desc, label asc
  limit 25;
$$;

-- ── Grants: authenticated only (anon does not see CV-derived recommendations) ─
revoke all on function public.recommend_cv_skills(text[], text[], text, boolean) from public;
grant execute on function public.recommend_cv_skills(text[], text[], text, boolean) to authenticated;
