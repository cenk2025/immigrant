import React, { useState, useEffect, useCallback } from 'react';
import { Check, Search, X, Link2 } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { matchSkill, getSkillByUri } from '../lib/esco';
import type { SkillCandidate, Locale } from '../lib/esco';
import './EscoOccupationPicker.css';

interface Props {
    /** The free-text skill label used to seed the first search. */
    seedText: string;
    /** Currently stored ESCO skill concept_uri (if linked). */
    value?: string;
    /** Called with the chosen concept_uri, or undefined when cleared. */
    onChange: (uri: string | undefined) => void;
}

/**
 * Unobtrusive "link this free-text skill to its ESCO concept" control. Lets the
 * recommendation engine know which skills the user already has (the `S` set).
 * Mirrors EscoOccupationPicker but searches ESCO skills.
 */
export const EscoSkillPicker: React.FC<Props> = ({ seedText, value, onChange }) => {
    const { t, language } = useLanguage();
    const locale = language as Locale;

    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState(seedText);
    const [results, setResults] = useState<SkillCandidate[]>([]);
    const [loading, setLoading] = useState(false);
    const [confirmedLabel, setConfirmedLabel] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        if (value && !confirmedLabel) {
            getSkillByUri(value, locale).then((label) => {
                if (active && label) setConfirmedLabel(label);
            });
        }
        return () => { active = false; };
    }, [value, locale, confirmedLabel]);

    const runSearch = useCallback(async (q: string) => {
        setLoading(true);
        const res = await matchSkill(q, locale, 5);
        setResults(res);
        setLoading(false);
    }, [locale]);

    const openPicker = (seed: string) => {
        setOpen(true);
        setQuery(seed);
        if (seed.trim().length >= 2) runSearch(seed);
    };

    const select = (c: SkillCandidate) => {
        onChange(c.conceptUri);
        setConfirmedLabel(c.label);
        setOpen(false);
    };

    const clear = () => {
        onChange(undefined);
        setConfirmedLabel(null);
        setOpen(false);
    };

    if (value && !open) {
        return (
            <span className="esco-picker esco-matched-row">
                <span className="esco-matched">
                    <Check size={14} /> {confirmedLabel || t('cvBuilder.esco.matched')}
                </span>
                <button type="button" className="esco-link-btn" onClick={() => openPicker(confirmedLabel || seedText)}>
                    {t('cvBuilder.esco.change')}
                </button>
                <button type="button" className="esco-link-btn esco-danger" onClick={clear}>
                    {t('cvBuilder.esco.remove')}
                </button>
            </span>
        );
    }

    if (!open) {
        return (
            <button type="button" className="esco-match-trigger" onClick={() => openPicker(seedText)}>
                <Link2 size={14} /> ESCO
            </button>
        );
    }

    return (
        <div className="esco-picker esco-open">
            <div className="esco-search-row">
                <Search size={14} className="esco-search-icon" />
                <input
                    className="input esco-search-input"
                    value={query}
                    autoFocus
                    placeholder={t('cvBuilder.esco.skillSearchPlaceholder')}
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
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};
