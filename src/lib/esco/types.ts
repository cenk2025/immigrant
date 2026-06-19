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
