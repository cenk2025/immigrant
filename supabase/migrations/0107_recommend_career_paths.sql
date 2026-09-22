-- ============================================================================
-- worklife-iq-finland — 0107 recommend_career_paths RPC (history-based, SQL only)
-- Powers the "Career Paths" page: "Given the occupations in your CV work
-- history, here are *other* occupations your current skills already qualify you
-- for — and the gap to close for each."
--
--   H = p_occupation_uris   → ESCO occupations from the CV work history
--   X = p_extra_skill_uris  → extra ESCO skills the user has (e.g. CV skills)
--
-- user_skills = the ESSENTIAL skills implied by H, plus X.
-- For every candidate occupation C (not in H):
--   essential_count = number of C's essential skills
--   shared_count    = how many of those the user already has
--   match_pct       = shared_count / essential_count            (0–100)
-- Ranked by match_pct, then shared_count. Each row also returns the top
-- shared skills ("what you bring") and missing skills ("the gap") as JSON.
--
-- No AI: pure SQL over the existing esco_ relation tables — needs NO new import.
-- The esco_isco_groups LEFT JOIN (0106) only adds a friendly field label and is
-- optional. SECURITY INVOKER; granted to authenticated.
-- Requires 0100 (tables), 0102 (indexes), the data import, and optionally 0106.
-- ============================================================================

create or replace function public.recommend_career_paths(
  p_occupation_uris  text[],
  p_extra_skill_uris text[]  default '{}',
  p_locale           text    default 'fi',
  p_limit            int     default 12,
  p_min_essentials   int     default 4
)
returns table (
  occupation_uri  text,
  label           text,
  isco_group      text,
  field_label     text,
  description     text,
  match_pct       int,
  shared_count    int,
  essential_count int,
  shared_skills   jsonb,
  missing_skills  jsonb
)
language sql
stable
as $$
  with user_skills as (
    -- Essential skills implied by the user's own history occupations …
    select distinct r.skill_uri
    from public.esco_occupation_skill_relations r
    where r.occupation_uri = any(p_occupation_uris)
      and r.relation_type = 'essential'
    union
    -- … plus any extra skills passed in (e.g. the CV's confirmed skills).
    select distinct s
    from unnest(coalesce(p_extra_skill_uris, '{}')) as s
    where s is not null and s <> ''
  ),
  cand as (
    -- Every essential relation of every *candidate* occupation (excluding H),
    -- flagged with whether the user already has that skill.
    select
      r.occupation_uri,
      r.skill_uri,
      (us.skill_uri is not null) as has
    from public.esco_occupation_skill_relations r
    left join user_skills us on us.skill_uri = r.skill_uri
    where r.relation_type = 'essential'
      and r.occupation_uri <> all (p_occupation_uris)
  ),
  agg as (
    select
      occupation_uri,
      count(*)::int                              as essential_count,
      count(*) filter (where has)::int           as shared_count
    from cand
    group by occupation_uri
    having count(*) >= greatest(coalesce(p_min_essentials, 4), 1)
       and count(*) filter (where has) >= 2          -- require real overlap
  ),
  ranked as (
    select
      a.*,
      (a.shared_count::numeric / a.essential_count) as match_ratio
    from agg a
    order by match_ratio desc, shared_count desc
    limit greatest(coalesce(p_limit, 12), 1)
  )
  select
    o.concept_uri as occupation_uri,
    coalesce(nullif(case when p_locale = 'fi' then o.preferred_label_fi else o.preferred_label_en end, ''),
             o.preferred_label_en)                                                              as label,
    o.isco_group,
    coalesce(nullif(case when p_locale = 'fi' then g.preferred_label_fi else g.preferred_label_en end, ''),
             g.preferred_label_en)                                                              as field_label,
    coalesce(nullif(case when p_locale = 'fi' then o.description_fi else o.description_en end, ''),
             o.description_en)                                                                  as description,
    round(r.match_ratio * 100)::int                                                             as match_pct,
    r.shared_count,
    r.essential_count,
    -- Skills the user already brings to this occupation (top 8 by label).
    (
      select coalesce(jsonb_agg(jsonb_build_object('uri', x.skill_uri, 'label', x.label)
                                order by x.label), '[]'::jsonb)
      from (
        select c.skill_uri,
               coalesce(nullif(case when p_locale = 'fi' then s.preferred_label_fi else s.preferred_label_en end, ''),
                        s.preferred_label_en) as label
        from cand c
        join public.esco_skills s on s.concept_uri = c.skill_uri
        where c.occupation_uri = o.concept_uri and c.has
        order by label
        limit 8
      ) x
    )                                                                                           as shared_skills,
    -- The gap: essential skills this occupation needs that the user lacks (top 8).
    (
      select coalesce(jsonb_agg(jsonb_build_object('uri', y.skill_uri, 'label', y.label)
                                order by y.label), '[]'::jsonb)
      from (
        select c.skill_uri,
               coalesce(nullif(case when p_locale = 'fi' then s.preferred_label_fi else s.preferred_label_en end, ''),
                        s.preferred_label_en) as label
        from cand c
        join public.esco_skills s on s.concept_uri = c.skill_uri
        where c.occupation_uri = o.concept_uri and not c.has
        order by label
        limit 8
      ) y
    )                                                                                           as missing_skills
  from ranked r
  join public.esco_occupations o on o.concept_uri = r.occupation_uri
  left join public.esco_isco_groups g on g.code = o.isco_group
  order by r.match_ratio desc, r.shared_count desc, label asc;
$$;

-- ── Grants: authenticated only (suggestions are derived from the user's CV) ──
revoke all on function public.recommend_career_paths(text[], text[], text, int, int) from public;
grant execute on function public.recommend_career_paths(text[], text[], text, int, int) to authenticated;
