# ESCO v1.2.1 import — worklife-iq-finland

Read-only ESCO reference data that powers the CV **taidot / skills** recommendations.
You run every step below in the **Supabase SQL Editor** (and the Table Editor for the
CSV uploads). Claude does **not** run any DDL or import.

All ESCO tables are `esco_`-prefixed so they never collide with the app tables
(`profiles`, `cv_versions`, `community_*`, `mentorship_*`).

---

## 0. Get the 5 CSVs

You need ESCO **v1.2.1** in the bilingual **CSV classification** format, English + Finnish:

| CSV file | Language | Maps to staging table |
|---|---|---|
| `occupations_en.csv` | EN | `staging_occ_en` |
| `occupations_fi.csv` | FI | `staging_occ_fi` |
| `skills_en.csv` | EN | `staging_skill_en` |
| `skills_fi.csv` | FI | `staging_skill_fi` |
| `occupationSkillRelations_en.csv` | language-independent | `staging_relations` |

> **Note on the zip in the repo root.**
> `ESCO dataset - v1.2.1 - local_api - v1.2.1 - zip.zip` is the **local API** bundle
> (it contains a single nested `v1.2.1.zip`, ~3.9 GB), not the plain CSV download.
> The 5 files above come from the ESCO portal **"Download" → format CSV → v1.2.1**,
> picking the **English** and **Finnish** language packs. Extract just these 5 CSVs
> and drop them in `supabase/esco-import/csv/` (gitignored — do not commit the data).

Expected magnitudes (v1.2.1): **~3,000** occupations, **~13,939** skills,
**tens of thousands** of occupation⇄skill relations.

---

## 1. Run order

| # | File | Where | What it does |
|---|---|---|---|
| 1 | `supabase/migrations/0100_esco_tables.sql` | SQL Editor | Creates `esco_occupations`, `esco_skills`, `esco_occupation_skill_relations` |
| 2 | `supabase/esco-import/01_staging_tables.sql` | SQL Editor | Creates the 5 scratch `staging_*` tables (quoted columns match the CSV headers) |
| 3 | **Import the 5 CSVs** | Table Editor | One CSV → one staging table (see step 2 below) |
| 4 | `supabase/esco-import/02_transform.sql` | SQL Editor | Merges EN+FI → final `esco_` tables (idempotent upsert) + prints a sanity-check row |
| 5 | `supabase/migrations/0102_esco_indexes.sql` | SQL Editor | Relation indexes + `pg_trgm` GIN label indexes + `reuse_level` index |
| 6 | `supabase/migrations/0103_esco_rls.sql` | SQL Editor | Enables RLS, public `select` only (no writes via the API) |

> Steps 7–8 (`0104_esco_resolvers.sql`, `0105_recommend_cv_skills.sql`) arrive with
> Parts B & C — run them after the data is in.

### Career Paths feature (occupation pivot) — steps 9–11

The `/career-paths` page ("Urapolut") suggests *other* occupations the user's
current skills already fit. It runs on the **existing** `esco_` tables, so the
core needs **no new import** — only the two RPC migrations. The ISCO-group step
is optional and just adds a human-readable *field* label to each suggestion.

| # | File | Where | What it does |
|---|---|---|---|
| 9 | `supabase/migrations/0107_recommend_career_paths.sql` | SQL Editor | The `recommend_career_paths` RPC (pure SQL over existing relations) |
| 10 *(optional)* | `supabase/migrations/0106_esco_isco_groups.sql` | SQL Editor | Creates `esco_isco_groups` + RLS (field-label table) |
| 11 *(optional)* | `supabase/esco-import/03_isco_groups.sql` | SQL Editor + Table Editor | Imports `ISCOGroups_en/fi.csv` → `esco_isco_groups` |

> 0107 LEFT JOINs `esco_isco_groups`, so run it **with or without** steps 10–11.
> If you skip 10–11, suggestions still work; the field label is just blank.

---

## 2. Importing the CSVs (step 3)

After running `01_staging_tables.sql`, for **each** of the 5 staging tables:

1. **Table Editor** → select the staging table (e.g. `staging_occ_en`).
2. **Insert → Import data from CSV** → choose the matching CSV.
3. Supabase auto-maps columns by header because the staging columns are quoted to
   the exact ESCO header names (`"conceptUri"`, `"preferredLabel"`, `"altLabels"`,
   `"skillType"`, `"reuseLevel"`, `"iscoGroup"`, `"code"`, `"description"`,
   and for relations `"occupationUri"`, `"relationType"`, `"skillType"`, `"skillUri"`).

Prefer the dashboard importer over `COPY` — the SQL Editor can't read a local file
path. (If you have `psql` access you can `\copy staging_occ_en from 'occupations_en.csv' csv header` instead.)

---

## 3. Verify

`02_transform.sql` ends with a sanity-check `SELECT`. You should see roughly:

```
occupations | skills | relations | essential_relations | optional_relations
~3000       | ~13939 | tens of thousands | (most) | (some)
```

If `relations` is 0, the relation endpoints didn't match — re-check that
`occupations` and `skills` imported before you ran the transform.

## 4. Cleanup (optional, after verifying)

```sql
drop table staging_occ_en, staging_occ_fi, staging_skill_en,
           staging_skill_fi, staging_relations;
```

The `esco_` tables are now read-only reference data; re-running `02_transform.sql`
later (after a re-import) safely upserts.
