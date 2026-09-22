-- ============================================================================
-- ESCO import — step 3 (OPTIONAL): ISCO groups → esco_isco_groups
-- Adds the human-readable occupation *field* labels used by the Career Paths
-- page (e.g. "Software and applications developers and analysts"). Optional:
-- recommend_career_paths (0107) LEFT JOINs this table, so career suggestions
-- still work without it — you just won't see the field label.
--
-- Prereq: run migration 0106_esco_isco_groups.sql first (creates the table).
-- CSVs: ISCOGroups_en.csv (EN) + ISCOGroups_fi.csv (FI) from the same ESCO
-- v1.2.1 classification download. Header:
--   conceptType,conceptUri,code,preferredLabel,status,altLabels,inScheme,description
-- ============================================================================

-- ── Staging (quoted to the exact ESCO headers; scratch tables) ──────────────
drop table if exists staging_isco_en;
drop table if exists staging_isco_fi;

create table staging_isco_en (
  "conceptType" text, "conceptUri" text, "code" text, "preferredLabel" text,
  "status" text, "altLabels" text, "inScheme" text, "description" text
);
create table staging_isco_fi (like staging_isco_en including all);

-- ── Import the 2 CSVs into the 2 staging tables (Table Editor → Import CSV) ──
--   ISCOGroups_en.csv → staging_isco_en
--   ISCOGroups_fi.csv → staging_isco_fi
-- …then run the merge below.

-- ── Merge EN + FI → esco_isco_groups, keyed on the ISCO code ────────────────
insert into public.esco_isco_groups
  (code, concept_uri, preferred_label_en, preferred_label_fi, description_en, description_fi)
select
  en."code",
  nullif(en."conceptUri", ''),
  nullif(en."preferredLabel", ''),
  nullif(fi."preferredLabel", ''),
  nullif(en."description", ''),
  nullif(fi."description", '')
from staging_isco_en en
left join staging_isco_fi fi on fi."code" = en."code"
where en."code" is not null and en."code" <> ''
on conflict (code) do update set
  concept_uri        = excluded.concept_uri,
  preferred_label_en = excluded.preferred_label_en,
  preferred_label_fi = excluded.preferred_label_fi,
  description_en     = excluded.description_en,
  description_fi     = excluded.description_fi;

-- ── Sanity check — ESCO v1.2.1 has ~600 ISCO groups across levels 1–4 ───────
select
  (select count(*) from public.esco_isco_groups)                          as isco_groups,
  (select count(*) from public.esco_occupations o
     join public.esco_isco_groups g on g.code = o.isco_group)             as occupations_with_field_label;

-- ── Optional cleanup once the counts look right ─────────────────────────────
--   drop table staging_isco_en, staging_isco_fi;
