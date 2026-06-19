-- ============================================================================
-- worklife-iq-finland — 0100 ESCO reference tables (schema only)
-- Run this FIRST, before 0102 / 0103 (and before 0104 / 0105 from later parts).
-- Creates the read-only ESCO v1.2.1 tables the CV skill-recommendation engine
-- reads from. Import the actual ESCO data afterwards — see ESCO_IMPORT.md for
-- the bilingual EN+FI CSV → these-tables recipe.
--
-- Tables are esco_-prefixed so they never collide with the app's existing
-- tables (profiles, cv_versions, community_*, mentorship_*). Column shapes match
-- src/lib/esco/types.ts — if you rename a column here, update the SELECT
-- projections in src/lib/esco/queries.ts to match.
-- ============================================================================

create extension if not exists "uuid-ossp";

-- Occupations (one row per ESCO occupation, EN + FI labels merged into columns)
create table if not exists public.esco_occupations (
  concept_uri        text primary key,
  isco_group         text,
  code               text,
  preferred_label_en text,
  preferred_label_fi text,
  alt_labels_en      text,
  alt_labels_fi      text,
  description_en     text,
  description_fi     text
);

-- Skills / knowledge (EN + FI labels merged into columns)
create table if not exists public.esco_skills (
  concept_uri        text primary key,
  skill_type         text,   -- 'skill/competence' | 'knowledge'
  reuse_level        text,   -- 'transversal' | 'cross-sector' | 'sector-specific' | 'occupation-specific'
  preferred_label_en text,
  preferred_label_fi text,
  alt_labels_en      text,
  alt_labels_fi      text,
  description_en     text,
  description_fi     text
);

-- Occupation ⇄ skill relations (language-independent)
create table if not exists public.esco_occupation_skill_relations (
  occupation_uri text not null references public.esco_occupations(concept_uri) on delete cascade,
  skill_uri      text not null references public.esco_skills(concept_uri) on delete cascade,
  relation_type  text not null,   -- 'essential' | 'optional'
  primary key (occupation_uri, skill_uri, relation_type)
);
