-- ============================================================================
-- worklife-iq-finland — 0104 ESCO free-text → URI resolvers
-- Trigram-backed "search as you type / confirm the best match" helpers used by
-- the CV editor to turn a free-text job title or skill into an ESCO concept_uri.
-- Each returns the top-N candidates ranked by trigram similarity.
--
-- Requires 0100 (tables), 0102 (pg_trgm + GIN indexes), and the data import.
-- SECURITY INVOKER (default): runs as the caller; ESCO tables are public-read.
-- ============================================================================

create extension if not exists pg_trgm;

-- ── Occupation resolver ─────────────────────────────────────────────────────
create or replace function public.match_occupation(
  p_query  text,
  p_locale text default 'fi',
  p_limit  int  default 5
)
returns table (
  concept_uri text,
  label       text,
  code        text,
  isco_group  text,
  description text,
  similarity  real
)
language sql
stable
as $$
  select
    o.concept_uri,
    coalesce(nullif(case when p_locale = 'fi' then o.preferred_label_fi else o.preferred_label_en end, ''),
             o.preferred_label_en)                                                              as label,
    coalesce(o.code, '')                                                                        as code,
    o.isco_group,
    coalesce(nullif(case when p_locale = 'fi' then o.description_fi else o.description_en end, ''),
             o.description_en)                                                                  as description,
    greatest(
      similarity(coalesce(case when p_locale = 'fi' then o.preferred_label_fi else o.preferred_label_en end, ''), p_query),
      similarity(coalesce(case when p_locale = 'fi' then o.alt_labels_fi      else o.alt_labels_en      end, ''), p_query)
    )                                                                                           as similarity
  from public.esco_occupations o
  where length(btrim(p_query)) >= 2
    and (
         (case when p_locale = 'fi' then o.preferred_label_fi else o.preferred_label_en end) ilike '%' || p_query || '%'
      or (case when p_locale = 'fi' then o.alt_labels_fi      else o.alt_labels_en      end) ilike '%' || p_query || '%'
      or (case when p_locale = 'fi' then o.preferred_label_fi else o.preferred_label_en end) % p_query
    )
  order by similarity desc nulls last, label asc
  limit greatest(coalesce(p_limit, 5), 1);
$$;

-- ── Skill resolver ──────────────────────────────────────────────────────────
create or replace function public.match_skill(
  p_query  text,
  p_locale text default 'fi',
  p_limit  int  default 5
)
returns table (
  concept_uri text,
  label       text,
  skill_type  text,
  reuse_level text,
  description text,
  similarity  real
)
language sql
stable
as $$
  select
    s.concept_uri,
    coalesce(nullif(case when p_locale = 'fi' then s.preferred_label_fi else s.preferred_label_en end, ''),
             s.preferred_label_en)                                                              as label,
    s.skill_type,
    s.reuse_level,
    coalesce(nullif(case when p_locale = 'fi' then s.description_fi else s.description_en end, ''),
             s.description_en)                                                                  as description,
    greatest(
      similarity(coalesce(case when p_locale = 'fi' then s.preferred_label_fi else s.preferred_label_en end, ''), p_query),
      similarity(coalesce(case when p_locale = 'fi' then s.alt_labels_fi      else s.alt_labels_en      end, ''), p_query)
    )                                                                                           as similarity
  from public.esco_skills s
  where length(btrim(p_query)) >= 2
    and (
         (case when p_locale = 'fi' then s.preferred_label_fi else s.preferred_label_en end) ilike '%' || p_query || '%'
      or (case when p_locale = 'fi' then s.alt_labels_fi      else s.alt_labels_en      end) ilike '%' || p_query || '%'
      or (case when p_locale = 'fi' then s.preferred_label_fi else s.preferred_label_en end) % p_query
    )
  order by similarity desc nulls last, label asc
  limit greatest(coalesce(p_limit, 5), 1);
$$;

-- ── Grants: authenticated only (the resolver is used inside the CV editor) ───
revoke all on function public.match_occupation(text, text, int) from public;
revoke all on function public.match_skill(text, text, int)      from public;
grant execute on function public.match_occupation(text, text, int) to authenticated;
grant execute on function public.match_skill(text, text, int)      to authenticated;
