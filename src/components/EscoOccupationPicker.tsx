import React, { useState, useEffect, useCallback } from 'react';
import { Check, Search, X, Link2 } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { matchOccupation, getOccupationByUri } from '../lib/esco';
import type { OccupationCandidate, Locale } from '../lib/esco';
import './EscoOccupationPicker.css';

interface Props {
    /** The free-text job title used to seed the first search. */
    seedTitle: string;
    /** Currently stored ESCO occupation concept_uri (if confirmed). */
    value?: string;
    /** Called with the chosen concept_uri, or undefined when cleared. */
    onChange: (uri: string | undefined) => void;
}

/**
 * Unobtrusive "match this job title to an ESCO occupation" control for a CV
 * work-history entry. Collapsed by default; on open it runs a trigram search
 * (via the match_occupation RPC) and lets the user confirm the best of the
 * top-5. Stores only the concept_uri on the experience entry.
 */
export const EscoOccupationPicker: React.FC<Props> = ({ seedTitle, value, onChange }) => {
    const { t, language } = useLanguage();
    const locale = language as Locale;

    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState(seedTitle);
    const [results, setResults] = useState<OccupationCandidate[]>([]);
    const [loading, setLoading] = useState(false);
    const [confirmedLabel, setConfirmedLabel] = useState<string | null>(null);

    // Resolve a display label for an already-stored URI (e.g. after CV reload).
    useEffect(() => {
        let active = true;
        if (value && !confirmedLabel) {
            getOccupationByUri(value, locale).then((label) => {
                if (active && label) setConfirmedLabel(label);
            });
        }
        return () => { active = false; };
    }, [value, locale, confirmedLabel]);

    const runSearch = useCallback(async (q: string) => {
        setLoading(true);
        const res = await matchOccupation(q, locale, 5);
        setResults(res);
        setLoading(false);
    }, [locale]);

    const openPicker = (seed: string) => {
        setOpen(true);
        setQuery(seed);
        if (seed.trim().length >= 2) runSearch(seed);
    };

    const select = (c: OccupationCandidate) => {
        onChange(c.conceptUri);
        setConfirmedLabel(c.label);
        setOpen(false);
    };

    const clear = () => {
        onChange(undefined);
        setConfirmedLabel(null);
        setOpen(false);
    };

    // ── Collapsed: matched ──────────────────────────────────────────────────
    if (value && !open) {
        return (
            <div className="esco-picker esco-matched-row">
                <span className="esco-matched">
                    <Check size={14} /> {confirmedLabel || t('cvBuilder.esco.matched')}
                </span>
                <button type="button" className="esco-link-btn" onClick={() => openPicker(confirmedLabel || seedTitle)}>
                    {t('cvBuilder.esco.change')}
                </button>
                <button type="button" className="esco-link-btn esco-danger" onClick={clear}>
                    {t('cvBuilder.esco.remove')}
                </button>
            </div>
        );
    }

    // ── Collapsed: not matched yet ──────────────────────────────────────────
    if (!open) {
        return (
            <button type="button" className="esco-match-trigger" onClick={() => openPicker(seedTitle)}>
                <Link2 size={14} /> {t('cvBuilder.esco.matchOccupation')}
            </button>
        );
    }

    // ── Open: search + confirm ──────────────────────────────────────────────
    return (
        <div className="esco-picker esco-open">
            <div className="esco-search-row">
                <Search size={14} className="esco-search-icon" />
                <input
                    className="input esco-search-input"
                    value={query}
                    autoFocus
                    placeholder={t('cvBuilder.esco.searchPlaceholder')}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); runSearch(query); } }}
                />
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => runSearch(query)}>
                    <Search size={14} />
                </button>
                <button type="button" className="esco-icon-btn" onClick={() => setOpen(false)} aria-label="Close">
                    <X size={14} />
                </button>
            </div>
            <p className="esco-hint">{t('cvBuilder.esco.confirmHint')}</p>
            {loading && <p className="esco-hint">{t('cvBuilder.esco.loading')}</p>}
            {!loading && results.length === 0 && query.trim().length >= 2 && (
                <p className="esco-hint">{t('cvBuilder.esco.noMatches')}</p>
            )}
            <ul className="esco-results">
                {results.map((c) => (
                    <li key={c.conceptUri}>
                        <button type="button" className="esco-result" onClick={() => select(c)}>
                            <span className="esco-result-label">{c.label}</span>
                            {c.code && <span className="esco-result-code">{c.code}</span>}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};
