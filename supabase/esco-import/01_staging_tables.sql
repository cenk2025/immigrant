-- ============================================================================
-- ESCO import — step 1: staging tables
-- ESCO ships labels per language (occupations_en.csv, occupations_fi.csv, …).
-- Each raw CSV is imported into a staging table, then EN+FI are merged in
-- step 2 (02_transform.sql). Columns are quoted to match the EXACT ESCO CSV
-- headers so Supabase's CSV importer maps them automatically.
--
-- Staging tables are intentionally un-prefixed and dropped/recreated on each
-- run — they are scratch space, not part of the app schema.
-- ============================================================================

drop table if exists staging_occ_en;
drop table if exists staging_occ_fi;
drop table if exists staging_skill_en;
drop table if exists staging_skill_fi;
drop table if exists staging_relations;

-- occupations_en.csv / occupations_fi.csv  (ESCO v1.2.1: 15 columns incl. naceCode)
create table staging_occ_en (
  "conceptType" text, "conceptUri" text, "iscoGroup" text, "preferredLabel" text,
  "altLabels" text, "hiddenLabels" text, "status" text, "modifiedDate" text,
  "regulatedProfessionNote" text, "scopeNote" text, "definition" text,
  "inScheme" text, "description" text, "code" text, "naceCode" text
);
create table staging_occ_fi (like staging_occ_en including all);

-- skills_en.csv / skills_fi.csv
create table staging_skill_en (
  "conceptType" text, "conceptUri" text, "skillType" text, "reuseLevel" text,
  "preferredLabel" text, "altLabels" text, "hiddenLabels" text, "status" text,
  "modifiedDate" text, "scopeNote" text, "definition" text, "inScheme" text,
  "description" text
);
create table staging_skill_fi (like staging_skill_en including all);

-- occupationSkillRelations_en.csv (language-independent; 6 columns incl. labels)
create table staging_relations (
  "occupationUri" text, "occupationLabel" text, "relationType" text,
  "skillType" text, "skillUri" text, "skillLabel" text
);
