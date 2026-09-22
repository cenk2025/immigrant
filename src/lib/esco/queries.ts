/**
 * ALL ESCO read access for the CV recommendation feature lives here. Every call
 * is locale-aware (the SQL coalesces FI → EN) and defensive: on any error it
 * resolves to an empty result so the CV editor shows an empty state instead of
 * crashing. No business logic in components — they call these wrappers, and the
 * ranking math stays in the Postgres RPCs.
 */

import { supabase } from '../supabase';
import type {
  Locale,
  OccupationCandidate,
  SkillCandidate,
  RecommendedSkill,
  CareerPath,
  SkillRef,
  EscoSkillType,
  EscoReuseLevel,
} from './types';

// ── Raw RPC row shapes (snake_case, as Postgres returns them) ────────────────
interface MatchOccupationRow {
  concept_uri: string;
  label: string;
  code: string;
  isco_group: string | null;
  description: string | null;
  similarity: number;
}
interface MatchSkillRow {
  concept_uri: string;
  label: string;
  skill_type: string | null;
  reuse_level: string | null;
  description: string | null;
  similarity: number;
}
interface RecommendSkillRow {
  skill_uri: string;
  label: string;
  description: string | null;
  skill_type: string | null;
  reuse_level: string | null;
  demand_count: number;
  score: number;
  why_occupations: string[] | null;
}
interface CareerPathRow {
  occupation_uri: string;
  label: string;
  isco_group: string | null;
  field_label: string | null;
  description: string | null;
  match_pct: number;
  shared_count: number;
  essential_count: number;
  shared_skills: SkillRef[] | null;
  missing_skills: SkillRef[] | null;
}

const MIN_QUERY = 2;

/** Free-text job title → top-N ESCO occupation candidates (trigram ranked). */
export async function matchOccupation(
  query: string,
  locale: Locale,
  limit = 5
): Promise<OccupationCandidate[]> {
  const q = query.trim();
  if (q.length < MIN_QUERY) return [];
  const { data, error } = await supabase.rpc('match_occupation', {
    p_query: q,
    p_locale: locale,
    p_limit: limit,
  });
  if (error) {
    console.error('matchOccupation failed:', error.message);
    return [];
  }
  return (data as MatchOccupationRow[] | null ?? []).map((r) => ({
    conceptUri: r.concept_uri,
    label: r.label,
    code: r.code,
    iscoGroup: r.isco_group,
    description: r.description,
    similarity: r.similarity,
  }));
}

/** Free-text skill → top-N ESCO skill candidates (trigram ranked). */
export async function matchSkill(
  query: string,
  locale: Locale,
  limit = 5
): Promise<SkillCandidate[]> {
  const q = query.trim();
  if (q.length < MIN_QUERY) return [];
  const { data, error } = await supabase.rpc('match_skill', {
    p_query: q,
    p_locale: locale,
    p_limit: limit,
  });
  if (error) {
    console.error('matchSkill failed:', error.message);
    return [];
  }
  return (data as MatchSkillRow[] | null ?? []).map((r) => ({
    conceptUri: r.concept_uri,
    label: r.label,
    skillType: (r.skill_type as EscoSkillType | null) ?? null,
    reuseLevel: (r.reuse_level as EscoReuseLevel | null) ?? null,
    description: r.description,
    similarity: r.similarity,
  }));
}

/** Resolve a single occupation's locale label from its concept_uri (FI→EN). */
export async function getOccupationByUri(
  uri: string,
  locale: Locale
): Promise<string | null> {
  if (!uri) return null;
  const { data, error } = await supabase
    .from('esco_occupations')
    .select('preferred_label_en, preferred_label_fi')
    .eq('concept_uri', uri)
    .maybeSingle();
  if (error || !data) return null;
  const row = data as { preferred_label_en: string | null; preferred_label_fi: string | null };
  const primary = locale === 'fi' ? row.preferred_label_fi : row.preferred_label_en;
  return (primary && primary.trim()) || row.preferred_label_en || null;
}

/** Resolve a single skill's locale label from its concept_uri (FI→EN). */
export async function getSkillByUri(
  uri: string,
  locale: Locale
): Promise<string | null> {
  if (!uri) return null;
  const { data, error } = await supabase
    .from('esco_skills')
    .select('preferred_label_en, preferred_label_fi')
    .eq('concept_uri', uri)
    .maybeSingle();
  if (error || !data) return null;
  const row = data as { preferred_label_en: string | null; preferred_label_fi: string | null };
  const primary = locale === 'fi' ? row.preferred_label_fi : row.preferred_label_en;
  return (primary && primary.trim()) || row.preferred_label_en || null;
}

/**
 * History-based skill recommendations (Part C). Pure ESCO function: pass the
 * occupation URIs from the CV's work history and the skill URIs already on the
 * CV; the RPC excludes the latter and ranks the rest.
 */
export async function recommendCvSkills(
  occupationUris: string[],
  existingSkillUris: string[],
  locale: Locale,
  essentialOnly: boolean
): Promise<RecommendedSkill[]> {
  if (occupationUris.length === 0) return [];
  const { data, error } = await supabase.rpc('recommend_cv_skills', {
    p_occupation_uris: occupationUris,
    p_existing_skill_uris: existingSkillUris,
    p_locale: locale,
    p_essential_only: essentialOnly,
  });
  if (error) {
    console.error('recommendCvSkills failed:', error.message);
    return [];
  }
  return (data as RecommendSkillRow[] | null ?? []).map((r) => ({
    skillUri: r.skill_uri,
    label: r.label,
    description: r.description,
    skillType: (r.skill_type as EscoSkillType | null) ?? null,
    reuseLevel: (r.reuse_level as EscoReuseLevel | null) ?? null,
    demandCount: r.demand_count,
    score: r.score,
    whyOccupations: r.why_occupations ?? [],
  }));
}

/**
 * Career-pivot suggestions. Given the ESCO occupation URIs from the user's work
 * history (and, optionally, extra skill URIs they hold), returns *other*
 * occupations their current skills already qualify them for, ranked by skill
 * overlap, each with the skills they bring and the gap to close. All ranking
 * math lives in the recommend_career_paths RPC; this only fetches and maps.
 */
export async function recommendCareerPaths(
  occupationUris: string[],
  extraSkillUris: string[],
  locale: Locale,
  limit = 12
): Promise<CareerPath[]> {
  if (occupationUris.length === 0) return [];
  const { data, error } = await supabase.rpc('recommend_career_paths', {
    p_occupation_uris: occupationUris,
    p_extra_skill_uris: extraSkillUris,
    p_locale: locale,
    p_limit: limit,
  });
  if (error) {
    console.error('recommendCareerPaths failed:', error.message);
    return [];
  }
  return (data as CareerPathRow[] | null ?? []).map((r) => ({
    occupationUri: r.occupation_uri,
    label: r.label,
    iscoGroup: r.isco_group,
    fieldLabel: r.field_label,
    description: r.description,
    matchPct: r.match_pct,
    sharedCount: r.shared_count,
    essentialCount: r.essential_count,
    sharedSkills: r.shared_skills ?? [],
    missingSkills: r.missing_skills ?? [],
  }));
}
