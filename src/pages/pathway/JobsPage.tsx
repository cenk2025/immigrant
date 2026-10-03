import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Briefcase, MapPin, Calendar, Languages, X, Plus, Mail, ExternalLink, Info, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { jobRegions, jobTypes } from '../../data/pathwayData';
import type { JobType } from '../../data/pathwayData';
import {
    listActiveJobs, listMyJobs, createJob, setJobActive, deleteJob, getMyCvSkills, matchJobSkills,
} from '../../lib/pathway';
import type { JobPosting, JobSkill, NewJobPosting } from '../../lib/pathway';
import { matchSkill } from '../../lib/esco';
import type { Locale, SkillCandidate } from '../../lib/esco';
import { BackToPathway, LoginPrompt } from './components';
import { fmt, safeUrl, usePick } from './utils';
import './Pathway.css';

type Tab = 'find' | 'post' | 'mine';

export const JobsPage: React.FC = () => {
    const { t } = useLanguage();
    const { user } = useAuth();
    const [tab, setTab] = useState<Tab>('find');
    const [justPublished, setJustPublished] = useState(false);

    const selectTab = (id: Tab) => {
        setTab(id);
        setJustPublished(false);
    };

    return (
        <div className="pw-page">
            <div className="pw-container">
                <BackToPathway />
                <header className="pw-hero">
                    <div className="pw-hero-icon"><Briefcase size={32} /></div>
                    <div>
                        <span className="pw-eyebrow">{t('pathway.name')}</span>
                        <h1>{t('pathway.jobs.title')}</h1>
                        <p>{t('pathway.jobs.subtitle')}</p>
                    </div>
                </header>

                <div className="pw-tabs" role="tablist">
                    {(['find', 'post', 'mine'] as Tab[]).map((id) => (
                        <button
                            key={id}
                            role="tab"
                            aria-selected={tab === id}
                            className={tab === id ? 'active' : ''}
                            onClick={() => selectTab(id)}
                        >
                            {t(`pathway.jobs.tab${id[0].toUpperCase()}${id.slice(1)}`)}
                        </button>
                    ))}
                </div>

                {tab === 'find' && <FindJobs userId={user?.id ?? null} />}
                {tab === 'post' && (user
                    ? <PostJob userId={user.id} onPublished={() => { setTab('mine'); setJustPublished(true); }} />
                    : <LoginPrompt message={t('pathway.loginRequired')} />)}
                {tab === 'mine' && justPublished && (
                    <p className="pw-success" style={{ marginTop: 0, marginBottom: 'var(--space-md)' }}>{t('pathway.jobs.form.published')}</p>
                )}
                {tab === 'mine' && (user
                    ? <MyJobs userId={user.id} />
                    : <LoginPrompt message={t('pathway.loginRequired')} />)}
            </div>
        </div>
    );
};

// ── Find ────────────────────────────────────────────────────────────────────

const FindJobs: React.FC<{ userId: string | null }> = ({ userId }) => {
    const { t } = useLanguage();
    const [jobs, setJobs] = useState<JobPosting[] | null>(null);
    const [mySkills, setMySkills] = useState<{ uris: Set<string>; labels: Set<string> } | null>(null);
    const [query, setQuery] = useState('');
    const [type, setType] = useState<JobType | ''>('');
    const [region, setRegion] = useState('');
    const [sort, setSort] = useState<'match' | 'newest'>('match');

    useEffect(() => {
        let active = true;
        listActiveJobs().then((j) => { if (active) setJobs(j); });
        if (userId) getMyCvSkills(userId).then((s) => { if (active) setMySkills(s); });
        return () => { active = false; };
    }, [userId]);

    const hasSkills = !!mySkills && (mySkills.uris.size > 0 || mySkills.labels.size > 0);

    const rows = useMemo(() => {
        const q = query.trim().toLowerCase();
        const list = (jobs ?? [])
            .filter((j) => !type || j.job_type === type)
            .filter((j) => !region || j.region === region)
            .filter((j) => !q || j.title.toLowerCase().includes(q) || j.company_name.toLowerCase().includes(q))
            .map((job) => ({ job, match: mySkills ? matchJobSkills(job, mySkills) : null }));
        if (sort === 'match' && hasSkills) {
            list.sort((a, b) => (b.match?.pct ?? -1) - (a.match?.pct ?? -1));
        }
        return list;
    }, [jobs, mySkills, query, type, region, sort, hasSkills]);

    if (!jobs) return <p className="pw-muted">{t('pathway.loading')}</p>;

    return (
        <>
            <div className="pw-filters">
                <input className="input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('pathway.jobs.search')} aria-label={t('pathway.jobs.search')} />
                <select className="select" value={type} onChange={(e) => setType(e.target.value as JobType | '')} aria-label={t('pathway.jobs.form.type')}>
                    <option value="">{t('pathway.jobs.allTypes')}</option>
                    {jobTypes.map((jt) => <OptionLabel key={jt.id} value={jt.id} label={jt.label} />)}
                </select>
                <select className="select" value={region} onChange={(e) => setRegion(e.target.value)} aria-label={t('pathway.jobs.form.region')}>
                    <option value="">{t('pathway.jobs.allRegions')}</option>
                    {jobRegions.map((r) => <OptionLabel key={r.id} value={r.id} label={r.label} />)}
                </select>
                <select className="select" value={sort} onChange={(e) => setSort(e.target.value as 'match' | 'newest')} aria-label="sort">
                    <option value="match">{t('pathway.jobs.bestMatch')}</option>
                    <option value="newest">{t('pathway.jobs.newest')}</option>
                </select>
            </div>

            {userId && mySkills && !hasSkills && (
                <div className="pw-note" style={{ marginBottom: 'var(--space-lg)' }}>
                    <Info size={16} /> <span>{t('pathway.jobs.noSkillsOnCv')}</span>
                </div>
            )}

            {rows.length === 0 ? (
                <div className="pw-panel"><p className="pw-muted" style={{ margin: 0 }}>{t('pathway.jobs.empty')}</p></div>
            ) : (
                rows.map(({ job, match }) => (
                    <JobCard key={job.id} job={job} matchedUris={new Set(match?.matched.map((s) => s.uri) ?? [])} matchCount={hasSkills ? match?.matched.length ?? 0 : null} />
                ))
            )}
        </>
    );
};

const OptionLabel: React.FC<{ value: string; label: { en: string; fi: string } }> = ({ value, label }) => {
    const pick = usePick();
    return <option value={value}>{pick(label)}</option>;
};

const JobCard: React.FC<{
    job: JobPosting;
    matchedUris: Set<string>;
    matchCount: number | null;
    footer?: React.ReactNode;
}> = ({ job, matchedUris, matchCount, footer }) => {
    const { t, language } = useLanguage();
    const pick = usePick();
    const typeLabel = jobTypes.find((jt) => jt.id === job.job_type)?.label;
    const regionLabel = jobRegions.find((r) => r.id === job.region)?.label;
    const applyHref = safeUrl(job.apply_url);
    const emailHref = job.contact_email ? safeUrl(`mailto:${job.contact_email}`) : null;
    const total = job.skills.length;

    return (
        <article className="pw-job">
            <div className="pw-job-head">
                <div>
                    <h3>{job.title}</h3>
                    <div className="pw-job-company">{job.company_name}</div>
                </div>
                {matchCount !== null && total > 0 && (
                    <div className="pw-match">
                        <strong>{Math.round((matchCount / total) * 100)} %</strong>
                        {fmt(t('pathway.jobs.yourMatch'), { m: matchCount, n: total })}
                    </div>
                )}
            </div>
            <div className="pw-job-meta">
                {typeLabel && <span className="pw-badge">{pick(typeLabel)}</span>}
                <span><MapPin size={14} /> {[job.city, regionLabel && pick(regionLabel)].filter(Boolean).join(', ')}</span>
                {job.language_requirements && <span><Languages size={14} /> {job.language_requirements}</span>}
                {job.expires_on && (
                    <span><Calendar size={14} /> {t('pathway.jobs.expires')} {new Date(job.expires_on).toLocaleDateString(language === 'fi' ? 'fi-FI' : 'en-GB')}</span>
                )}
            </div>
            {job.description && <p className="pw-job-desc">{job.description}</p>}
            {total > 0 && (
                <div className="pw-chips" aria-label={t('pathway.jobs.skills')}>
                    {job.skills.map((s) => (
                        <span key={s.uri} className={`pw-chip ${matchedUris.has(s.uri) ? 'have' : ''}`}>{s.label}</span>
                    ))}
                </div>
            )}
            <div className="pw-job-actions">
                {applyHref && (
                    <a className="btn btn-primary btn-sm" href={applyHref} target="_blank" rel="noopener noreferrer">
                        {t('pathway.jobs.apply')} <ExternalLink size={14} />
                    </a>
                )}
                {emailHref && (
                    <a className="btn btn-secondary btn-sm" href={emailHref}>
                        <Mail size={14} /> {t('pathway.jobs.contact')}
                    </a>
                )}
                {footer}
            </div>
        </article>
    );
};

// ── Post ────────────────────────────────────────────────────────────────────

const EMPTY_FORM: NewJobPosting = {
    company_name: '',
    title: '',
    description: '',
    job_type: 'internship',
    region: '',
    city: null,
    language_requirements: null,
    apply_url: null,
    contact_email: null,
    skills: [],
    expires_on: null,
};

const PostJob: React.FC<{ userId: string; onPublished: () => void }> = ({ userId, onPublished }) => {
    const { t } = useLanguage();
    const [form, setForm] = useState<NewJobPosting>(EMPTY_FORM);
    const [error, setError] = useState<string | null>(null);
    const [publishing, setPublishing] = useState(false);

    const set = <K extends keyof NewJobPosting>(k: K, v: NewJobPosting[K]) => setForm((f) => ({ ...f, [k]: v }));
    const text = (k: 'city' | 'language_requirements' | 'apply_url' | 'contact_email') =>
        (e: React.ChangeEvent<HTMLInputElement>) => set(k, e.target.value.trim() ? e.target.value : null);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!form.company_name.trim() || !form.title.trim() || !form.region) {
            setError(t('pathway.jobs.form.needFields'));
            return;
        }
        const applyUrl = form.apply_url ? safeUrl(form.apply_url) : null;
        if (!applyUrl && !form.contact_email) {
            setError(t('pathway.jobs.form.needContact'));
            return;
        }
        setPublishing(true);
        const res = await createJob(userId, {
            ...form,
            company_name: form.company_name.trim(),
            title: form.title.trim(),
            apply_url: applyUrl,
        });
        setPublishing(false);
        if (!res.ok) {
            setError(res.error ?? t('pathway.saveError'));
            return;
        }
        setForm(EMPTY_FORM);
        onPublished();
    };

    return (
        <form className="pw-panel" onSubmit={submit}>
            <div className="pw-note" style={{ marginBottom: 'var(--space-lg)' }}>
                <Info size={16} /> <span>{t('pathway.jobs.employerNote')}</span>
            </div>
            <div className="pw-grid-2">
                <Field id="pj-company" label={t('pathway.jobs.form.company')}>
                    <input id="pj-company" className="input" required maxLength={120} value={form.company_name} onChange={(e) => set('company_name', e.target.value)} />
                </Field>
                <Field id="pj-title" label={t('pathway.jobs.form.title')}>
                    <input id="pj-title" className="input" required maxLength={160} value={form.title} onChange={(e) => set('title', e.target.value)} />
                </Field>
                <Field id="pj-type" label={t('pathway.jobs.form.type')}>
                    <select id="pj-type" className="select" value={form.job_type} onChange={(e) => set('job_type', e.target.value as JobType)}>
                        {jobTypes.map((jt) => <OptionLabel key={jt.id} value={jt.id} label={jt.label} />)}
                    </select>
                </Field>
                <Field id="pj-region" label={t('pathway.jobs.form.region')}>
                    <select id="pj-region" className="select" required value={form.region} onChange={(e) => set('region', e.target.value)}>
                        <option value="">—</option>
                        {jobRegions.map((r) => <OptionLabel key={r.id} value={r.id} label={r.label} />)}
                    </select>
                </Field>
                <Field id="pj-city" label={t('pathway.jobs.form.city')}>
                    <input id="pj-city" className="input" maxLength={80} value={form.city ?? ''} onChange={text('city')} />
                </Field>
                <Field id="pj-expires" label={t('pathway.jobs.form.expiresOn')}>
                    <input id="pj-expires" type="date" className="input" min={new Date().toISOString().slice(0, 10)} value={form.expires_on ?? ''} onChange={(e) => set('expires_on', e.target.value || null)} />
                </Field>
            </div>
            <Field id="pj-desc" label={t('pathway.jobs.form.description')} hint={t('pathway.jobs.form.descriptionHint')}>
                <textarea id="pj-desc" className="textarea" rows={5} maxLength={3000} value={form.description} onChange={(e) => set('description', e.target.value)} />
            </Field>
            <Field id="pj-lang" label={t('pathway.jobs.form.languages')} hint={t('pathway.jobs.form.languagesHint')}>
                <input id="pj-lang" className="input" maxLength={160} value={form.language_requirements ?? ''} onChange={text('language_requirements')} />
            </Field>
            <SkillPicker skills={form.skills} onChange={(skills) => set('skills', skills)} />
            <div className="pw-grid-2">
                <Field id="pj-url" label={t('pathway.jobs.form.applyUrl')}>
                    <input id="pj-url" type="url" className="input" placeholder="https://" value={form.apply_url ?? ''} onChange={text('apply_url')} />
                </Field>
                <Field id="pj-email" label={t('pathway.jobs.form.contactEmail')}>
                    <input id="pj-email" type="email" className="input" value={form.contact_email ?? ''} onChange={text('contact_email')} />
                </Field>
            </div>
            <button className="btn btn-primary" disabled={publishing}>
                {publishing ? t('pathway.jobs.form.publishing') : t('pathway.jobs.form.publish')}
            </button>
            {error && <p className="pw-error">{error}</p>}
        </form>
    );
};

const Field: React.FC<{ id: string; label: string; hint?: string; children: React.ReactNode }> = ({ id, label, hint, children }) => (
    <div className="pw-field">
        <label htmlFor={id}>{label}</label>
        {children}
        {hint && <small>{hint}</small>}
    </div>
);

const SkillPicker: React.FC<{ skills: JobSkill[]; onChange: (skills: JobSkill[]) => void }> = ({ skills, onChange }) => {
    const { t, language } = useLanguage();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SkillCandidate[]>([]);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const search = useCallback((q: string) => {
        if (timer.current) clearTimeout(timer.current);
        if (q.trim().length < 2) {
            setResults([]);
            return;
        }
        timer.current = setTimeout(async () => {
            setResults(await matchSkill(q, language as Locale, 8));
        }, 250);
    }, [language]);

    useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

    const add = (c: SkillCandidate) => {
        if (!skills.some((s) => s.uri === c.conceptUri)) onChange([...skills, { uri: c.conceptUri, label: c.label }]);
        setQuery('');
        setResults([]);
    };

    const taken = new Set(skills.map((s) => s.uri));

    return (
        <div className="pw-field">
            <label htmlFor="pj-skill">{t('pathway.jobs.form.skills')}</label>
            {skills.length > 0 && (
                <div className="pw-chips" style={{ marginBottom: 0 }}>
                    {skills.map((s) => (
                        <button key={s.uri} type="button" className="pw-chip have" onClick={() => onChange(skills.filter((x) => x.uri !== s.uri))} aria-label={`${s.label} ×`}>
                            {s.label} <X size={12} />
                        </button>
                    ))}
                </div>
            )}
            <div className="pw-inline">
                <Search size={16} aria-hidden />
                <input
                    id="pj-skill"
                    className="input"
                    value={query}
                    placeholder={t('pathway.jobs.form.skillSearch')}
                    onChange={(e) => { setQuery(e.target.value); search(e.target.value); }}
                    autoComplete="off"
                />
            </div>
            {results.length > 0 && (
                <ul className="pw-suggest">
                    {results.filter((r) => !taken.has(r.conceptUri)).map((r) => (
                        <li key={r.conceptUri}>
                            <button type="button" onClick={() => add(r)}><Plus size={13} /> {r.label}</button>
                        </li>
                    ))}
                </ul>
            )}
            <small>{t('pathway.jobs.form.skillsHint')}</small>
        </div>
    );
};

// ── Mine ────────────────────────────────────────────────────────────────────

const MyJobs: React.FC<{ userId: string }> = ({ userId }) => {
    const { t } = useLanguage();
    const [jobs, setJobs] = useState<JobPosting[] | null>(null);

    const load = useCallback(async () => setJobs(await listMyJobs(userId)), [userId]);

    useEffect(() => {
        // Intentional: initial fetch of the employer's postings.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        load();
    }, [load]);

    const toggle = async (job: JobPosting) => {
        if (await setJobActive(job.id, !job.is_active)) load();
    };

    const remove = async (job: JobPosting) => {
        if (!window.confirm(t('pathway.jobs.mine.removeConfirm'))) return;
        if (await deleteJob(job.id)) load();
    };

    if (!jobs) return <p className="pw-muted">{t('pathway.loading')}</p>;
    if (jobs.length === 0) return <div className="pw-panel"><p className="pw-muted" style={{ margin: 0 }}>{t('pathway.jobs.mine.empty')}</p></div>;

    return (
        <>
            {jobs.map((job) => (
                <JobCard
                    key={job.id}
                    job={job}
                    matchedUris={new Set()}
                    matchCount={null}
                    footer={
                        <>
                            <span className={`pw-badge ${job.is_active ? 'ok' : ''}`} style={{ alignSelf: 'center' }}>
                                {job.is_active ? t('pathway.jobs.mine.active') : t('pathway.jobs.mine.hidden')}
                            </span>
                            <button className="btn btn-secondary btn-sm" onClick={() => toggle(job)}>
                                {job.is_active ? t('pathway.jobs.mine.hide') : t('pathway.jobs.mine.show')}
                            </button>
                            <button className="btn btn-secondary btn-sm" onClick={() => remove(job)}>{t('pathway.jobs.mine.remove')}</button>
                        </>
                    }
                />
            ))}
        </>
    );
};
