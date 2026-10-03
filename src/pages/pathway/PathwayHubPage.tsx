import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Route, PlaneLanding, Briefcase, HeartHandshake, Building2, ArrowRight,
    GraduationCap, AlertTriangle, ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import {
    getMyCohort, joinCohort, leaveCohort, getVisibleInstitutionContent,
    getMyRetentionAnswer, submitRetentionAnswer,
} from '../../lib/pathway';
import type { MyCohort, InstitutionContent, RetentionAnswer, RetentionStatus } from '../../lib/pathway';
import { safeUrl } from './utils';
import './Pathway.css';

const CARDS = [
    { key: 'preArrival', to: '/pathway/pre-arrival', icon: <PlaneLanding size={26} /> },
    { key: 'jobs', to: '/pathway/jobs', icon: <Briefcase size={26} /> },
    { key: 'family', to: '/pathway/family', icon: <HeartHandshake size={26} /> },
    { key: 'institutions', to: '/pathway/institutions', icon: <Building2 size={26} /> },
] as const;

const STATUSES: RetentionStatus[] = ['employed', 'studying', 'job_seeking', 'entrepreneur', 'other'];

export const PathwayHubPage: React.FC = () => {
    const { t } = useLanguage();
    const { user } = useAuth();

    return (
        <div className="pw-page">
            <div className="pw-container">
                <header className="pw-hero">
                    <div className="pw-hero-icon"><Route size={32} /></div>
                    <div>
                        <span className="pw-eyebrow">{t('pathway.name')}</span>
                        <h1>{t('pathway.heroTitle')}</h1>
                        <p>{t('pathway.heroSubtitle')}</p>
                    </div>
                </header>

                <div className="pw-cards">
                    {CARDS.map((c) => (
                        <Link key={c.key} to={c.to} className="pw-card">
                            <div className="pw-card-icon">{c.icon}</div>
                            <h2>{t(`pathway.cards.${c.key}.title`)}</h2>
                            <p>{t(`pathway.cards.${c.key}.description`)}</p>
                            <span className="pw-card-cta">
                                {t(`pathway.cards.${c.key}.cta`)} <ArrowRight size={16} />
                            </span>
                        </Link>
                    ))}
                </div>

                {user && <MyCohortPanel userId={user.id} />}
            </div>
        </div>
    );
};

const MyCohortPanel: React.FC<{ userId: string }> = ({ userId }) => {
    const { t } = useLanguage();
    const [cohort, setCohort] = useState<MyCohort | null>(null);
    const [content, setContent] = useState<InstitutionContent[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [code, setCode] = useState('');
    const [joining, setJoining] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        const c = await getMyCohort();
        setCohort(c);
        setContent(c ? await getVisibleInstitutionContent() : []);
        setLoaded(true);
    }, []);

    useEffect(() => {
        // Intentional: initial fetch of the student's cohort.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        load();
    }, [load]);

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code.trim()) return;
        setJoining(true);
        setError(null);
        const res = await joinCohort(code);
        setJoining(false);
        if (!res.ok) {
            setError(t('pathway.cohort.invalidCode'));
            return;
        }
        setCode('');
        await load();
    };

    const handleLeave = async () => {
        if (!window.confirm(t('pathway.cohort.leaveConfirm'))) return;
        if (await leaveCohort()) await load();
    };

    if (!loaded) return null;

    if (!cohort) {
        return (
            <section className="pw-panel">
                <h2><GraduationCap size={20} /> {t('pathway.cohort.joinTitle')}</h2>
                <p className="pw-panel-sub">{t('pathway.cohort.joinHint')}</p>
                <form className="pw-inline" onSubmit={handleJoin}>
                    <input
                        className="input"
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        placeholder={t('pathway.cohort.codePlaceholder')}
                        maxLength={16}
                        aria-label={t('pathway.cohort.codePlaceholder')}
                    />
                    <button className="btn btn-primary" disabled={joining || !code.trim()}>
                        {joining ? t('pathway.cohort.joining') : t('pathway.cohort.join')}
                    </button>
                </form>
                {error && <p className="pw-error">{error}</p>}
            </section>
        );
    }

    return (
        <section className="pw-panel">
            <h2><GraduationCap size={20} /> {t('pathway.cohort.title')}</h2>
            <div className="pw-status-row">
                <p className="pw-panel-sub" style={{ margin: 0 }}>
                    {t('pathway.cohort.memberOf')} <strong>{cohort.cohort_name}</strong> · {cohort.institution_name}
                </p>
                <button className="btn btn-secondary btn-sm" onClick={handleLeave}>{t('pathway.cohort.leave')}</button>
            </div>
            {!cohort.institution_verified && (
                <div className="pw-note pw-note-warn" style={{ marginBottom: 'var(--space-lg)' }}>
                    <AlertTriangle size={16} /> <span>{t('pathway.cohort.unverified')}</span>
                </div>
            )}

            <h3>{t('pathway.cohort.contentTitle')}</h3>
            {content.length === 0 ? (
                <p className="pw-muted">{t('pathway.cohort.noContent')}</p>
            ) : (
                <div>
                    {content.map((item) => {
                        const href = safeUrl(item.link_url);
                        return (
                            <article key={item.id} className="pw-content-item">
                                <div>
                                    <h4>{item.title}</h4>
                                    {item.body && <p>{item.body}</p>}
                                    {href && (
                                        <a href={href} target="_blank" rel="noopener noreferrer" className="pw-link">
                                            {new URL(href).hostname} <ExternalLink size={13} />
                                        </a>
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}

            {cohort.retention_survey_open && <RetentionSurvey cohortId={cohort.cohort_id} userId={userId} />}
        </section>
    );
};

const RetentionSurvey: React.FC<{ cohortId: string; userId: string }> = ({ cohortId, userId }) => {
    const { t } = useLanguage();
    const [answer, setAnswer] = useState<RetentionAnswer>({
        in_region: true,
        status: 'employed',
        employed_in_field: null,
        would_recommend: null,
    });
    const [hasAnswered, setHasAnswered] = useState(false);
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState<'ok' | 'error' | null>(null);

    useEffect(() => {
        let active = true;
        getMyRetentionAnswer(cohortId, userId).then((a) => {
            if (active && a) {
                setAnswer(a);
                setHasAnswered(true);
            }
        });
        return () => { active = false; };
    }, [cohortId, userId]);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        const ok = await submitRetentionAnswer(cohortId, userId, answer);
        setSending(false);
        setResult(ok ? 'ok' : 'error');
        if (ok) setHasAnswered(true);
    };

    const set = <K extends keyof RetentionAnswer>(k: K, v: RetentionAnswer[K]) => {
        setAnswer((a) => ({ ...a, [k]: v }));
        setResult(null);
    };

    return (
        <form onSubmit={submit} style={{ marginTop: 'var(--space-xl)' }}>
            <h3>{t('pathway.survey.title')}</h3>
            <p className="pw-panel-sub">{t('pathway.survey.intro')}</p>

            <div className="pw-field">
                <span className="pw-label">{t('pathway.survey.inRegion')}</span>
                <div className="pw-choice">
                    <button type="button" className={answer.in_region ? 'active' : ''} onClick={() => set('in_region', true)}>{t('pathway.survey.yes')}</button>
                    <button type="button" className={!answer.in_region ? 'active' : ''} onClick={() => set('in_region', false)}>{t('pathway.survey.no')}</button>
                </div>
            </div>

            <div className="pw-field">
                <label htmlFor="pw-survey-status">{t('pathway.survey.status')}</label>
                <select
                    id="pw-survey-status"
                    className="select"
                    value={answer.status}
                    onChange={(e) => {
                        const status = e.target.value as RetentionStatus;
                        setAnswer((a) => ({
                            ...a,
                            status,
                            employed_in_field: status === 'employed' ? a.employed_in_field : null,
                        }));
                        setResult(null);
                    }}
                >
                    {STATUSES.map((s) => (
                        <option key={s} value={s}>{t(`pathway.survey.statusOptions.${s}`)}</option>
                    ))}
                </select>
            </div>

            {answer.status === 'employed' && (
                <div className="pw-field">
                    <span className="pw-label">{t('pathway.survey.inField')}</span>
                    <div className="pw-choice">
                        <button type="button" className={answer.employed_in_field === true ? 'active' : ''} onClick={() => set('employed_in_field', true)}>{t('pathway.survey.yes')}</button>
                        <button type="button" className={answer.employed_in_field === false ? 'active' : ''} onClick={() => set('employed_in_field', false)}>{t('pathway.survey.no')}</button>
                        <button type="button" className={answer.employed_in_field === null ? 'active' : ''} onClick={() => set('employed_in_field', null)}>{t('pathway.survey.notApplicable')}</button>
                    </div>
                </div>
            )}

            <div className="pw-field">
                <span className="pw-label">{t('pathway.survey.recommend')}</span>
                <div className="pw-choice">
                    {[1, 2, 3, 4, 5].map((n) => (
                        <button key={n} type="button" className={answer.would_recommend === n ? 'active' : ''} onClick={() => set('would_recommend', n)}>{n}</button>
                    ))}
                </div>
            </div>

            <button className="btn btn-primary" disabled={sending}>
                {hasAnswered ? t('pathway.survey.update') : t('pathway.survey.submit')}
            </button>
            {result === 'ok' && <p className="pw-success">{t('pathway.survey.thanks')}</p>}
            {result === 'error' && <p className="pw-error">{t('pathway.saveError')}</p>}
        </form>
    );
};
