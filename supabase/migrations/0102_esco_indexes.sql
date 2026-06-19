-- ============================================================================
-- worklife-iq-finland — 0102 ESCO indexes + trigram fuzzy search
-- Run AFTER 0100 and AFTER the data import (02_transform.sql). Speeds up the
-- recommendation joins and the occupation/skill title → ESCO resolver
-- (search-as-you-type / confirm-match flows in the CV editor).
-- ============================================================================

create extension if not exists pg_trgm;

-- Relation lookups — recommend_cv_skills joins heavily on these.
create index if not exists idx_esco_osr_skill_uri
  on public.esco_occupation_skill_relations (skill_uri);
create index if not exists idx_esco_osr_occupation_uri
  on public.esco_occupation_skill_relations (occupation_uri);

-- Trigram GIN indexes backing case-insensitive ILIKE '%q%' / similarity()
-- search on occupation labels (free-text job title → ESCO occupation resolver).
create index if not exists idx_esco_occ_label_fi_trgm
  on public.esco_occupations using gin (preferred_label_fi gin_trgm_ops);
create index if not exists idx_esco_occ_label_en_trgm
  on public.esco_occupations using gin (preferred_label_en gin_trgm_ops);
create index if not exists idx_esco_occ_alt_fi_trgm
  on public.esco_occupations using gin (alt_labels_fi gin_trgm_ops);
create index if not exists idx_esco_occ_alt_en_trgm
  on public.esco_occupations using gin (alt_labels_en gin_trgm_ops);

-- Trigram GIN indexes on skill labels (free-text skill → ESCO skill resolver).
create index if not exists idx_esco_skill_label_fi_trgm
  on public.esco_skills using gin (preferred_label_fi gin_trgm_ops);
create index if not exists idx_esco_skill_label_en_trgm
  on public.esco_skills using gin (preferred_label_en gin_trgm_ops);
create index if not exists idx_esco_skill_alt_fi_trgm
  on public.esco_skills using gin (alt_labels_fi gin_trgm_ops);
create index if not exists idx_esco_skill_alt_en_trgm
  on public.esco_skills using gin (alt_labels_en gin_trgm_ops);

-- Reuse-level filter (e.g. surfacing "transversal" skills in the UI).
create index if not exists idx_esco_skill_reuse_level
  on public.esco_skills (reuse_level);
