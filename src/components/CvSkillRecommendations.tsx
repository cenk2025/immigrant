import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Sparkles, Plus, Check } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { recommendCvSkills } from '../lib/esco';
import type { RecommendedSkill, Locale } from '../lib/esco';
import type { WorkExperience, SkillLink } from '../lib/supabase';
import './CvSkillRecommendations.css';

interface Props {
    experience: WorkExperience[];
    skillLinks: SkillLink[];
    /** Adds a recommended skill to the CV (label into skills + records the link). */
    onAdd: (label: string, skillUri: string) => void;
}

/**
 * History-based skill recommendations, shown below the existing CV skills UI.
 * Derives the work-history occupation URIs (H) and the already-linked skill URIs
 * (S) from the CV, then calls the recommend_cv_skills RPC. All ranking math is
 * in the RPC — this component only fetches and renders.
 */
export const CvSkillRecommendations: React.FC<Props> = ({ experience, skillLinks, onAdd }) => {
    const { t, language } = useLanguage();
    const locale = language as Locale;

    const occupationUris = useMemo(
        () => Array.from(new Set(experience.map((e) => e.esco_occupation_uri).filter(Boolean))) as string[],
        [experience]
    );
    const existingSkillUris = useMemo(
        () => Array.from(new Set(skillLinks.map((l) => l.skill_uri))),
        [skillLinks]
    );

    const [essentialOnly, setEssentialOnly] = useState(true);
    const [recs, setRecs] = useState<RecommendedSkill[]>([]);
    const [loading, setLoading] = useState(false);
    const [added, setAdded] = useState<Set<string>>(new Set());

    const load = useCallback(async () => {
        if (occupationUris.length === 0) {
            setRecs([]);
            return;
        }
        setLoading(true);
        const data = await recommendCvSkills(occupationUris, existingSkillUris, locale, essentialOnly);
        setRecs(data);
        setLoading(false);
    }, [occupationUris, existingSkillUris, locale, essentialOnly]);

    useEffect(() => {
        // Intentional: fetch recommendations when inputs change (toggles `loading`).
        // eslint-disable-next-line react-hooks/set-state-in-effect
        load();
    }, [load]);

    const handleAdd = (rec: RecommendedSkill) => {
        onAdd(rec.label, rec.skillUri);
        setAdded((prev) => new Set(prev).add(rec.skillUri));
    };

    const typeBadge = (rec: RecommendedSkill): string | null => {
        if (rec.skillType === 'knowledge') return t('cvBuilder.esco.knowledge');
        if (rec.skillType === 'skill/competence') return t('cvBuilder.esco.skill');
        return null;
    };

    return (
        <section className="esco-recs" aria-labelledby="esco-recs-heading">
            <div className="esco-recs-header">
                <h3 id="esco-recs-heading">
                    <Sparkles size={18} /> {t('cvBuilder.esco.recTitle')}
                </h3>
                <label className="esco-recs-toggle">
                    <input
                        type="checkbox"
                        checked={essentialOnly}
                        onChange={(e) => setEssentialOnly(e.target.checked)}
                    />
                    {t('cvBuilder.esco.essentialOnly')}
                </label>
            </div>
            <p className="esco-recs-intro">{t('cvBuilder.esco.recIntro')}</p>

            {/* Empty state: no work history linked to ESCO yet */}
            {occupationUris.length === 0 && (
                <p className="esco-recs-empty">{t('cvBuilder.esco.recEmpty')}</p>
            )}

            {/* Skeleton loader */}
            {loading && occupationUris.length > 0 && (
                <div className="esco-recs-grid" aria-hidden="true">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="esco-rec-card esco-skeleton" />
                    ))}
                </div>
            )}

            {/* Recommendations */}
            {!loading && occupationUris.length > 0 && (
                <>
                    {recs.length === 0 ? (
                        <p className="esco-recs-empty">{t('cvBuilder.esco.noMatches')}</p>
                    ) : (
                        <ul className="esco-recs-grid">
                            {recs.map((rec) => {
                                const isAdded = added.has(rec.skillUri);
                                return (
                                    <li key={rec.skillUri} className="esco-rec-card">
                                        <div className="esco-rec-top">
                                            <span className="esco-rec-label">{rec.label}</span>
                                            <div className="esco-rec-badges">
                                                {typeBadge(rec) && (
                                                    <span className="esco-badge esco-badge-type">{typeBadge(rec)}</span>
                                                )}
                                                {rec.reuseLevel === 'transversal' && (
                                                    <span className="esco-badge esco-badge-transversal">
                                                        {t('cvBuilder.esco.transversal')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {rec.whyOccupations.length > 0 && (
                                            <p className="esco-rec-why">
                                                {t('cvBuilder.esco.why')}: {rec.whyOccupations.join(', ')}
                                            </p>
                                        )}

                                        {rec.description && (
                                            <details className="esco-rec-details">
                                                <summary>{t('cvBuilder.esco.showDescription')}</summary>
                                                <p>{rec.description}</p>
                                            </details>
                                        )}

                                        <button
                                            type="button"
                                            className={`btn btn-sm esco-rec-add ${isAdded ? 'is-added' : 'btn-primary'}`}
                                            onClick={() => handleAdd(rec)}
                                            disabled={isAdded}
                                        >
                                            {isAdded ? (
                                                <>
                                                    <Check size={14} /> {t('cvBuilder.esco.added')}
                                                </>
                                            ) : (
                                                <>
                                                    <Plus size={14} /> {t('cvBuilder.esco.addToCv')}
                                                </>
                                            )}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}

                    {/* Screen-reader-friendly tabular view of the same data */}
                    {recs.length > 0 && (
                        <table className="esco-sr-only">
                            <caption>{t('cvBuilder.esco.recTitle')}</caption>
                            <thead>
                                <tr>
                                    <th>{t('cvBuilder.sections.skills')}</th>
                                    <th>{t('cvBuilder.esco.why')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recs.map((rec) => (
                                    <tr key={rec.skillUri}>
                                        <td>{rec.label}</td>
                                        <td>{rec.whyOccupations.join(', ')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </>
            )}
        </section>
    );
};
