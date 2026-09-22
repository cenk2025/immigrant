/**
 * ESCO domain types for the CV skill-recommendation feature.
 * These mirror the read-only `esco_*` tables and the resolver / recommend RPCs.
 * The rest of the app depends only on these resolved (camelCase) shapes — if a
 * SQL column or RPC field changes, adjust the mappers in `queries.ts` only.
 */

export type Locale = 'fi' | 'en';

export type EscoSkillType = 'skill/competence' | 'knowledge';
export type EscoReuseLevel =
  | 'transversal'
  | 'cross-sector'
  | 'sector-specific'
  | 'occupation-specific';
export type EscoRelationType = 'essential' | 'optional';

/** A candidate returned by the `match_occupation` resolver RPC. */
export interface OccupationCandidate {
  conceptUri: string;
  label: string;
  code: string;
  iscoGroup: string | null;
  description: string | null;
  similarity: number;
}

/** A candidate returned by the `match_skill` resolver RPC. */
export interface SkillCandidate {
  conceptUri: string;
  label: string;
  skillType: EscoSkillType | null;
  reuseLevel: EscoReuseLevel | null;
  description: string | null;
  similarity: number;
}

/** A skill reference (uri + resolved label) returned inside a career path. */
export interface SkillRef {
  uri: string;
  label: string;
}

/**
 * One ranked alternative occupation from the `recommend_career_paths` RPC.
 * "Given your work history, here's another occupation your skills already fit,
 * and the gap to close for it."
 */
export interface CareerPath {
  occupationUri: string;
  label: string;
  /** ISCO group code (e.g. '2512'); null if the occupation has none. */
  iscoGroup: string | null;
  /** Human-readable field/group label (needs esco_isco_groups import); else null. */
  fieldLabel: string | null;
  description: string | null;
  /** 0–100: share of this occupation's essential skills the user already has. */
  matchPct: number;
  /** How many essential skills the user already brings. */
  sharedCount: number;
  /** Total essential skills this occupation requires. */
  essentialCount: number;
  /** Skills the user already has for this occupation (the "you bring" set). */
  sharedSkills: SkillRef[];
  /** Essential skills the user is missing (the gap to close). */
  missingSkills: SkillRef[];
}

/** One ranked row from the `recommend_cv_skills` RPC (Part C). */
export interface RecommendedSkill {
  skillUri: string;
  label: string;
  description: string | null;
  skillType: EscoSkillType | null;
  reuseLevel: EscoReuseLevel | null;
  /** How many of the user's own history occupations require this as essential. */
  demandCount: number;
  /** essential = 1.0, optional = 0.4, summed across history occupations. */
  score: number;
  /** Labels of the user's own occupations that need this skill (the "why"). */
  whyOccupations: string[];
}
