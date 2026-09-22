-- ============================================================================
-- worklife-iq-finland — 0106 ESCO ISCO groups (occupation taxonomy labels)
-- Optional reference table that gives every occupation a human-readable
-- *field* / group name (e.g. "Software developers", "Health professionals").
-- Powers the "field" label shown on each Career Paths suggestion.
--
-- The Career Paths RPC (0107) LEFT JOINs this table, so it is genuinely
-- optional: career suggestions work without it (you just lose the group label).
-- Import the data via supabase/esco-import/03_isco_groups.sql.
--
-- Join key: esco_occupations.isco_group (a numeric code like '2654') matches
-- esco_isco_groups.code. ISCO codes are hierarchical (1–4 digits = major →
-- unit group); this table holds all levels.
-- ============================================================================

create table if not exists public.esco_isco_groups (
  code               text primary key,   -- '0', '2', '25', '251', '2512' …
  concept_uri        text,
  preferred_label_en text,
  preferred_label_fi text,
  description_en     text,
  description_fi     text
);

-- Public-read only, consistent with the other esco_ tables (see 0103).
alter table public.esco_isco_groups enable row level security;

drop policy if exists "esco_isco_groups_read" on public.esco_isco_groups;
create policy "esco_isco_groups_read" on public.esco_isco_groups
  for select using (true);
