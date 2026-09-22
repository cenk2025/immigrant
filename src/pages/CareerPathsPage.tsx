import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Compass, Search, X, Plus, Target, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { supabase } from '../lib/supabase';
import type { CVVersion } from '../lib/supabase';
import {
    matchOccupation,
    getOccupationByUri,
    recommendCareerPaths,
} from '../lib/esco';
import type { CareerPath, OccupationCandidate, Locale } from '../lib/esco';
import './CareerPathsPage.css';

interface SourceOccupation {
    uri: string;
    label: string;
}

/**
 * Career Paths — the ESCO "career pivot" feature. Takes the occupations from
 * the user's CV work history (auto-loaded) plus any they add by hand, and asks
 * recommend_career_paths for *other* occupations their current skills already
 * fit, ranked by overlap, each with the skills they bring and the gap to close.
 * All ranking lives in the RPC; this page only gathers inputs and renders.
 */
export const CareerPathsPage: React.FC = () => {
    const { t, language } = useLanguage();
    const locale = language as Locale;
    const { user } = useAuth();
    const navigate = useNavigate();

    const [sources, setSources] = useState<SourceOccupation[]>([]);
    const [extraSkillUris, setExtraSkillUris] = useState<string[]>([]);
    const [results, setResults] = useState<CareerPath[]>([]);
    const [loadingSources, setLoadingSources] = useState(true);
    const [loadingResults, setLoadingResults] = useState(false);

    // ── Manual occupation adder (inline trigram search) ─────────────────────
    const [query, setQuery] = useState('');
    const [searchResults, setSearchResults] = useState<OccupationCandidate[]>([]);
    const [searching, setSearching] = useState(false);
    const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const sourceUris = useMemo(() => sources.map((s) => s.uri), [sources]);

    // ── Load occupations + skills from the user's CVs ───────────────────────
    const loadFromCvs = useCallback(async () => {
        if (!user) return;
        setLoadingSources(true);

        const { data, error } = await supabase
            .from('cv_versions')
            .select('*')
            .eq('user_id', user.id);

        const occUris = new Set<string>();
        const skillUris = new Set<string>();
        if (!error && data) {
            for (const cv of data as CVVersion[]) {
                for (const exp of cv.data?.experience ?? []) {
                    if (exp.esco_occupation_uri) occUris.add(exp.esco_occupation_uri);
                }
                for (const link of cv.data?.skill_links ?? []) {
                    if (link.skill_uri) skillUris.add(link.skill_uri);
                }
            }
        }

        // Resolve a display label for each unique occupation URI.
        const resolved = await Promise.all(
            Array.from(occUris).map(async (uri) => ({
                uri,
                label: (await getOccupationByUri(uri, locale)) || uri,
            }))
        );

        setExtraSkillUris(Array.from(skillUris));
        setSources(resolved);
        setLoadingSources(false);
    }, [user, locale]);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        // Intentional: initial load toggles `loadingSources`.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadFromCvs();
    }, [user, navigate, loadFromCvs]);

    // ── Fetch career paths whenever the source set changes ──────────────────
    const loadResults = useCallback(async () => {
        if (sourceUris.length === 0) {
            setResults([]);
            return;
        }
        setLoadingResults(true);
        const data = await recommendCareerPaths(sourceUris, extraSkillUris, locale, 12);
        setResults(data);
        setLoadingResults(false);
    }, [sourceUris, extraSkillUris, locale]);

    useEffect(() => {
        // Intentional: refetch suggestions when the inputs change.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadResults();
    }, [loadResults]);

    // ── Debounced occupation search for the manual adder ────────────────────
    useEffect(() => {
        if (searchTimer.current) clearTimeout(searchTimer.current);
        const q = query.trim();
        if (q.length < 2) {
            // Intentional: clearing stale results when the query is too short.
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSearchResults([]);
            return;
        }
        searchTimer.current = setTimeout(async () => {
            setSearching(true);
            const res = await matchOccupation(q, locale, 6);
            // Hide ones already selected.
            setSearchResults(res.filter((r) => !sourceUris.includes(r.conceptUri)));
            setSearching(false);
        }, 250);
        return () => {
            if (searchTimer.current) clearTimeout(searchTimer.current);
        };
    }, [query, locale, sourceUris]);

    const addSource = (c: OccupationCandidate) => {
        if (sourceUris.includes(c.conceptUri)) return;
        setSources((prev) => [...prev, { uri: c.conceptUri, label: c.label }]);
        setQuery('');
        setSearchResults([]);
    };

    const removeSource = (uri: string) => {
        setSources((prev) => prev.filter((s) => s.uri !== uri));
    };

    if (!user) return null;

    const hasSources = sources.length > 0;

    return (
        <div className="career-page">
            <div className="career-container">
                {/* Hero / heading */}
                <header className="career-hero">
                    <div className="career-hero-icon"><Compass size={28} /></div>
                    <div>
                        <h1>{t('careerPaths.title')}</h1>
                        <p>{t('careerPaths.subtitle')}</p>
                    </div>
                </header>

                {/* Source occupations */}
                <section className="career-sources" aria-labelledby="career-sources-heading">
                    <h2 id="career-sources-heading">{t('careerPaths.basedOn')}</h2>
                    <p className="career-muted">{t('careerPaths.basedOnHint')}</p>

                    {loadingSources ? (
                        <p className="career-muted">{t('careerPaths.loadingSources')}</p>
                    ) : (
                        <div className="career-chips">
                            {sources.map((s) => (
                                <span key={s.uri} className="career-chip">
                                    {s.label}
                                    <button
                                        type="button"
                                        aria-label={t('careerPaths.remove')}
                                        onClick={() => removeSource(s.uri)}
                                    >
                                        <X size={14} />
                                    </button>
                                </span>
                            ))}
                            {!hasSources && (
                                <span className="career-muted">{t('careerPaths.noSources')}</span>
                            )}
                        </div>
                    )}

                    {/* Manual occupation adder */}
                    <div className="career-add">
                        <div className="career-search-row">
                            <Search size={16} className="career-search-icon" />
                            <input
                                className="career-search-input"
                                value={query}
                                placeholder={t('careerPaths.addPlaceholder')}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                            {query && (
                                <button type="button" className="career-icon-btn" onClick={() => setQuery('')} aria-label={t('careerPaths.remove')}>
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                        {searching && <p className="career-muted career-search-status">{t('careerPaths.searching')}</p>}
                        {searchResults.length > 0 && (
                            <ul className="career-search-results">
                                {searchResults.map((c) => (
                                    <li key={c.conceptUri}>
                                        <button type="button" onClick={() => addSource(c)}>
                                            <Plus size={14} />
                                            <span>{c.label}</span>
                                            {c.code && <span className="career-result-code">{c.code}</span>}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </section>

                {/* Results */}
                <section className="career-results" aria-labelledby="career-results-heading">
                    <h2 id="career-results-heading">
                        <Sparkles size={18} /> {t('careerPaths.resultsTitle')}
                    </h2>

                    {!hasSources && !loadingSources && (
                        <div className="career-empty">
                            <p>{t('careerPaths.emptyTitle')}</p>
                            <Link to="/cv-builder" className="btn btn-primary btn-sm">
                                {t('careerPaths.goToCv')} <ArrowRight size={14} />
                            </Link>
                        </div>
                    )}

                    {hasSources && loadingResults && (
                        <div className="career-grid" aria-hidden="true">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="career-card career-skeleton" />
                            ))}
                        </div>
                    )}

                    {hasSources && !loadingResults && results.length === 0 && (
                        <p className="career-muted">{t('careerPaths.noResults')}</p>
                    )}

                    {hasSources && !loadingResults && results.length > 0 && (
                        <ul className="career-grid">
                            {results.map((path) => (
                                <li key={path.occupationUri} className="career-card">
                                    <div className="career-card-head">
                                        <div className="career-card-title">
                                            <h3>{path.label}</h3>
                                            {path.fieldLabel && (
                                                <span className="career-field">{path.fieldLabel}</span>
                                            )}
                                        </div>
                                        <div className="career-match" title={t('careerPaths.matchTitle')}>
                                            <span className="career-match-pct">{path.matchPct}%</span>
                                            <span className="career-match-label">{t('careerPaths.match')}</span>
                                        </div>
                                    </div>

                                    <div className="career-meter" aria-hidden="true">
                                        <div className="career-meter-fill" style={{ width: `${path.matchPct}%` }} />
                                    </div>
                                    <p className="career-fit">
                                        {t('careerPaths.youHave')
                                            .replace('{shared}', String(path.sharedCount))
                                            .replace('{total}', String(path.essentialCount))}
                                    </p>

                                    {path.sharedSkills.length > 0 && (
                                        <div className="career-skillset">
                                            <span className="career-skillset-label career-have">
                                                <Target size={13} /> {t('careerPaths.youBring')}
                                            </span>
                                            <div className="career-skill-tags">
                                                {path.sharedSkills.map((s) => (
                                                    <span key={s.uri} className="career-tag career-tag-have">{s.label}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {path.missingSkills.length > 0 && (
                                        <div className="career-skillset">
                                            <span className="career-skillset-label career-gap">
                                                <Plus size={13} /> {t('careerPaths.toLearn')}
                                            </span>
                                            <div className="career-skill-tags">
                                                {path.missingSkills.map((s) => (
                                                    <span key={s.uri} className="career-tag career-tag-gap">{s.label}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {path.description && (
                                        <details className="career-desc">
                                            <summary>{t('careerPaths.about')}</summary>
                                            <p>{path.description}</p>
                                        </details>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <p className="career-disclaimer">{t('careerPaths.disclaimer')}</p>
            </div>
        </div>
    );
};
