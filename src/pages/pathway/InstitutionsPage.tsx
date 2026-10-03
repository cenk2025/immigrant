import React, { useCallback, useEffect, useState } from 'react';
import {
    Building2, CheckCircle2, Copy, Check, Users, BarChart3, MapPinned, Download, FileText, ShieldCheck, Trash2, ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { jobRegions, pathwayPhases, pathwayTaskIds, permitSteps } from '../../data/pathwayData';
import {
    MIN_GROUP_SIZE, listMyInstitutions, createInstitution, joinInstitutionAsAdvisor, listCohorts, getCohortSizes,
    createCohort, setRetentionSurveyOpen, getCohortProgressStats, getCohortRetentionStats,
    listInstitutionContent, addInstitutionContent, deleteInstitutionContent,
} from '../../lib/pathway';
import type {
    Institution, Cohort, CohortProgressStats, CohortRetentionStats, InstitutionContent, RetentionStatus,
} from '../../lib/pathway';
import { BackToPathway, LoginPrompt } from './components';
import { fmt, safeUrl, usePick } from './utils';
import './Pathway.css';

const RETENTION_STATUSES: RetentionStatus[] = ['employed', 'studying', 'job_seeking', 'entrepreneur', 'other'];

export const InstitutionsPage: React.FC = () => {
    const { t } = useLanguage();
    const { user } = useAuth();
    const [institutions, setInstitutions] = useState<Institution[] | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const load = useCallback(async (selectId?: string) => {
        const list = await listMyInstitutions();
        setInstitutions(list);
        setSelectedId((cur) => selectId ?? cur ?? list[0]?.id ?? null);
    }, []);

    useEffect(() => {
        if (!user) return;
        // Intentional: initial fetch of the advisor's institutions.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        load();
    }, [user, load]);

    const selected = institutions?.find((i) => i.id === selectedId) ?? null;

    return (
        <div className="pw-page">
            <div className="pw-container">
                <BackToPathway />
                <header className="pw-hero">
                    <div className="pw-hero-icon"><Building2 size={32} /></div>
                    <div>
                        <span className="pw-eyebrow">{t('pathway.name')}</span>
                        <h1>{t('pathway.inst.title')}</h1>
                        <p>{t('pathway.inst.subtitle')}</p>
                    </div>
                </header>

                {(!user || (institutions && institutions.length === 0)) && <Benefits />}

                {!user && <LoginPrompt message={t('pathway.loginRequired')} />}

                {user && !institutions && <p className="pw-muted">{t('pathway.loading')}</p>}

                {user && institutions && institutions.length > 1 && (
                    <div className="pw-choice" style={{ marginBottom: 'var(--space-lg)' }}>
                        {institutions.map((i) => (
                            <button key={i.id} type="button" className={i.id === selectedId ? 'active' : ''} onClick={() => setSelectedId(i.id)}>
                                {i.name}
                            </button>
                        ))}
                    </div>
                )}

                {user && selected && <InstitutionDashboard key={selected.id} institution={selected} userId={user.id} />}

                {user && institutions && (
                    institutions.length === 0
                        ? <SetupForms onDone={load} />
                        : (
                            <details className="pw-panel">
                                <summary style={{ cursor: 'pointer', fontWeight: 600 }}>
                                    {t('pathway.inst.createTitle')} / {t('pathway.inst.joinTitle')}
                                </summary>
                                <div style={{ marginTop: 'var(--space-lg)' }}><SetupForms onDone={load} /></div>
                            </details>
                        )
                )}
            </div>
        </div>
    );
};

const Benefits: React.FC = () => {
    const { t } = useLanguage();
    return (
        <ul className="pw-benefits">
            {(['cohorts', 'anonymous', 'content', 'retention'] as const).map((k) => (
                <li key={k}><CheckCircle2 size={18} /> {t(`pathway.inst.benefits.${k}`)}</li>
            ))}
        </ul>
    );
};

const SetupForms: React.FC<{ onDone: (selectId?: string) => void }> = ({ onDone }) => {
    const { t } = useLanguage();
    const pick = usePick();
    const [name, setName] = useState('');
    const [region, setRegion] = useState('');
    const [code, setCode] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const create = async (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim().length < 2) return;
        setBusy(true);
        setError(null);
        const res = await createInstitution(name.trim(), region);
        setBusy(false);
        if (res.error) setError(t('pathway.saveError'));
        else onDone(res.id);
    };

    const join = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code.trim()) return;
        setBusy(true);
        setError(null);
        const res = await joinInstitutionAsAdvisor(code);
        setBusy(false);
        if (res.error) setError(t('pathway.inst.invalidCode'));
        else onDone(res.id);
    };

    return (
        <div className="pw-grid-2">
            <form className="pw-panel" onSubmit={create} style={{ marginBottom: 0 }}>
                <h2>{t('pathway.inst.createTitle')}</h2>
                <div className="pw-field">
                    <label htmlFor="pi-name">{t('pathway.inst.name')}</label>
                    <input id="pi-name" className="input" required minLength={2} maxLength={160} value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="pw-field">
                    <label htmlFor="pi-region">{t('pathway.inst.region')}</label>
                    <select id="pi-region" className="select" value={region} onChange={(e) => setRegion(e.target.value)}>
                        <option value="">—</option>
                        {jobRegions.filter((r) => r.id !== 'remote').map((r) => (
                            <option key={r.id} value={pick(r.label)}>{pick(r.label)}</option>
                        ))}
                    </select>
                </div>
                <button className="btn btn-primary" disabled={busy}>{t('pathway.inst.create')}</button>
            </form>
            <form className="pw-panel" onSubmit={join} style={{ marginBottom: 0 }}>
                <h2>{t('pathway.inst.joinTitle')}</h2>
                <p className="pw-panel-sub">{t('pathway.inst.joinHint')}</p>
                <div className="pw-field">
                    <label htmlFor="pi-code">{t('pathway.inst.advisorCode')}</label>
                    <input id="pi-code" className="input" value={code} maxLength={16} onChange={(e) => setCode(e.target.value.toUpperCase())} />
                </div>
                <button className="btn btn-secondary" disabled={busy}>{t('pathway.inst.join')}</button>
            </form>
            {error && <p className="pw-error">{error}</p>}
        </div>
    );
};

const CopyCode: React.FC<{ code: string }> = ({ code }) => {
    const { t } = useLanguage();
    const [copied, setCopied] = useState(false);
    const copy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            setCopied(false);
        }
    };
    return (
        <span className="pw-inline" style={{ gap: '0.4rem' }}>
            <span className="pw-code">{code}</span>
            <button type="button" className="btn btn-secondary btn-sm" onClick={copy} aria-label={`${t('pathway.inst.copy')} ${code}`}>
                {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? t('pathway.inst.copied') : t('pathway.inst.copy')}
            </button>
        </span>
    );
};

const InstitutionDashboard: React.FC<{ institution: Institution; userId: string }> = ({ institution, userId }) => {
    const { t } = useLanguage();
    const [cohorts, setCohorts] = useState<Cohort[]>([]);
    const [sizes, setSizes] = useState<Record<string, number>>({});
    const [selectedCohortId, setSelectedCohortId] = useState<string | null>(null);
    const [cohortName, setCohortName] = useState('');
    const [intake, setIntake] = useState('');

    const loadCohorts = useCallback(async () => {
        const [list, counts] = await Promise.all([listCohorts(institution.id), getCohortSizes(institution.id)]);
        setCohorts(list);
        setSizes(counts);
        setSelectedCohortId((cur) => cur ?? list[0]?.id ?? null);
    }, [institution.id]);

    useEffect(() => {
        // Intentional: initial fetch of cohorts for this institution.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadCohorts();
    }, [loadCohorts]);

    const addCohort = async (e: React.FormEvent) => {
        e.preventDefault();
        if (cohortName.trim().length < 2) return;
        if (await createCohort(institution.id, cohortName.trim(), intake.trim())) {
            setCohortName('');
            setIntake('');
            loadCohorts();
        }
    };

    const selectedCohort = cohorts.find((c) => c.id === selectedCohortId) ?? null;

    return (
        <>
            <section className="pw-panel">
                <div className="pw-status-row">
                    <h2 style={{ margin: 0 }}>{institution.name}</h2>
                    {institution.is_verified
                        ? <span className="pw-badge ok"><ShieldCheck size={13} style={{ verticalAlign: '-2px' }} /> {t('pathway.inst.verified')}</span>
                        : <span className="pw-badge warn">{t('pathway.inst.pending')}</span>}
                </div>
                {institution.region && <p className="pw-muted" style={{ marginTop: 0 }}>{institution.region}</p>}
                <div className="pw-field" style={{ marginBottom: 0 }}>
                    <span className="pw-label">{t('pathway.inst.advisorCodeLabel')}</span>
                    <CopyCode code={institution.advisor_invite_code} />
                    <small>{t('pathway.inst.advisorCodeHint')}</small>
                </div>
            </section>

            <section className="pw-panel">
                <h2><Users size={20} /> {t('pathway.inst.cohortsTitle')}</h2>
                <form className="pw-inline" onSubmit={addCohort} style={{ margin: 'var(--space-md) 0 var(--space-lg)' }}>
                    <input className="input" value={cohortName} maxLength={120} onChange={(e) => setCohortName(e.target.value)} placeholder={t('pathway.inst.cohortName')} aria-label={t('pathway.inst.cohortName')} />
                    <input className="input" value={intake} maxLength={40} onChange={(e) => setIntake(e.target.value)} placeholder={t('pathway.inst.intake')} aria-label={t('pathway.inst.intake')} />
                    <button className="btn btn-primary" disabled={cohortName.trim().length < 2}>{t('pathway.inst.addCohort')}</button>
                </form>
                {cohorts.length === 0 ? (
                    <p className="pw-muted">{t('pathway.inst.noCohorts')}</p>
                ) : (
                    <div className="pw-table-wrap">
                        <table className="pw-table">
                            <thead>
                                <tr>
                                    <th>{t('pathway.inst.cohortsTitle')}</th>
                                    <th>{t('pathway.inst.studentCode')}</th>
                                    <th>{t('pathway.inst.members')}</th>
                                    <th />
                                </tr>
                            </thead>
                            <tbody>
                                {cohorts.map((c) => (
                                    <tr key={c.id} className={c.id === selectedCohortId ? 'selected' : ''}>
                                        <td>
                                            <strong>{c.name}</strong>
                                            {c.intake_term && <div className="pw-muted">{c.intake_term}</div>}
                                        </td>
                                        <td><CopyCode code={c.invite_code} /></td>
                                        <td>{sizes[c.id] ?? 0}</td>
                                        <td>
                                            <button className="btn btn-secondary btn-sm" onClick={() => setSelectedCohortId(c.id)} disabled={c.id === selectedCohortId}>
                                                {t('pathway.inst.select')}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {selectedCohort && (
                <CohortDetail key={selectedCohort.id} cohort={selectedCohort} onChanged={loadCohorts} />
            )}

            <ContentManager institutionId={institution.id} cohorts={cohorts} userId={userId} />
        </>
    );
};

const Stat: React.FC<{ value: string | number; label: string }> = ({ value, label }) => (
    <div className="pw-stat">
        <div className="pw-stat-value">{value}</div>
        <div className="pw-stat-label">{label}</div>
    </div>
);

const Bar: React.FC<{ label: string; count: number; total: number }> = ({ label, count, total }) => {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return (
        <li className="pw-bar-row">
            <span className="pw-bar-label" title={label}>{label}</span>
            <div className="pw-progress"><span style={{ width: `${pct}%` }} /></div>
            <span className="pw-bar-value">{pct} %</span>
        </li>
    );
};

const CohortDetail: React.FC<{ cohort: Cohort; onChanged: () => void }> = ({ cohort, onChanged }) => {
    const { t } = useLanguage();
    const pick = usePick();
    const [progress, setProgress] = useState<CohortProgressStats | null>(null);
    const [retention, setRetention] = useState<CohortRetentionStats | null>(null);
    const [surveyOpen, setSurveyOpen] = useState(cohort.retention_survey_open);

    useEffect(() => {
        let active = true;
        Promise.all([
            getCohortProgressStats(cohort.id, pathwayTaskIds.length),
            getCohortRetentionStats(cohort.id),
        ]).then(([p, r]) => {
            if (!active) return;
            setProgress(p);
            setRetention(r);
        });
        return () => { active = false; };
    }, [cohort.id]);

    const toggleSurvey = async () => {
        if (await setRetentionSurveyOpen(cohort.id, !surveyOpen)) {
            setSurveyOpen(!surveyOpen);
            onChanged();
        }
    };

    const members = progress?.member_count ?? 0;
    const hasProgress = !!progress && progress.avg_completion_pct !== null;
    const responses = retention?.response_count ?? 0;
    const hasRetention = !!retention && retention.in_region_pct !== null;
    const kNote = fmt(t('pathway.inst.kAnon'), { k: MIN_GROUP_SIZE });
    const allTasks = pathwayPhases.flatMap((p) => p.tasks);

    const exportCsv = () => {
        const rows: (string | number)[][] = [
            ['cohort', cohort.name],
            ['intake_term', cohort.intake_term ?? ''],
            ['exported_at', new Date().toISOString()],
            ['members', members],
        ];
        if (hasProgress && progress) {
            rows.push(
                ['avg_completion_pct', progress.avg_completion_pct ?? ''],
                ['arrival_date_set', progress.with_arrival_date ?? ''],
                ['arrived', progress.arrived_count ?? ''],
            );
            for (const task of allTasks) rows.push([`task:${task.id}`, progress.task_counts?.[task.id] ?? 0]);
            for (const step of permitSteps) rows.push([`permit:${step.status}`, progress.permit_counts?.[step.status] ?? 0]);
        }
        rows.push(['retention_responses', responses]);
        if (hasRetention && retention) {
            rows.push(
                ['in_region_pct', retention.in_region_pct ?? ''],
                ['employed_in_field_pct', retention.employed_in_field_pct ?? ''],
                ['avg_recommend', retention.avg_recommend ?? ''],
            );
            for (const s of RETENTION_STATUSES) rows.push([`status:${s}`, retention.status_counts?.[s] ?? 0]);
        }
        const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
        const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
        const a = document.createElement('a');
        a.href = url;
        a.download = `${cohort.name.replace(/[^\w-]+/g, '_')}_summary.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <>
            <section className="pw-panel">
                <div className="pw-status-row">
                    <h2 style={{ margin: 0 }}><BarChart3 size={20} /> {t('pathway.inst.progressTitle')} · {cohort.name}</h2>
                    <button className="btn btn-secondary btn-sm" onClick={exportCsv}><Download size={14} /> {t('pathway.inst.exportCsv')}</button>
                </div>
                {!progress ? (
                    <p className="pw-muted">{t('pathway.loading')}</p>
                ) : !hasProgress ? (
                    <div className="pw-note" style={{ marginTop: 'var(--space-md)' }}>
                        <ShieldCheck size={16} /> <span>{kNote} ({members} {t('pathway.inst.members')})</span>
                    </div>
                ) : (
                    <>
                        <div className="pw-grid-4" style={{ margin: 'var(--space-md) 0 var(--space-xl)' }}>
                            <Stat value={members} label={t('pathway.inst.members')} />
                            <Stat value={`${progress.avg_completion_pct} %`} label={t('pathway.inst.avgCompletion')} />
                            <Stat value={progress.with_arrival_date ?? 0} label={t('pathway.inst.arrivalSet')} />
                            <Stat value={progress.arrived_count ?? 0} label={t('pathway.inst.arrivedCount')} />
                        </div>
                        <div className="pw-grid-2">
                            <div>
                                <h3>{t('pathway.inst.taskCompletion')}</h3>
                                <ul className="pw-bars">
                                    {allTasks.map((task) => (
                                        <Bar key={task.id} label={pick(task.title)} count={progress.task_counts?.[task.id] ?? 0} total={members} />
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h3>{t('pathway.inst.permitDistribution')}</h3>
                                <ul className="pw-bars">
                                    {permitSteps.map((step) => (
                                        <Bar key={step.status} label={pick(step.label)} count={progress.permit_counts?.[step.status] ?? 0} total={members} />
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </>
                )}
            </section>

            <section className="pw-panel">
                <div className="pw-status-row">
                    <h2 style={{ margin: 0 }}><MapPinned size={20} /> {t('pathway.inst.retentionTitle')}</h2>
                    <span className="pw-inline">
                        <span className={`pw-badge ${surveyOpen ? 'ok' : ''}`}>{surveyOpen ? t('pathway.inst.surveyOpen') : t('pathway.inst.surveyClosed')}</span>
                        <button className="btn btn-secondary btn-sm" onClick={toggleSurvey}>
                            {surveyOpen ? t('pathway.inst.closeSurvey') : t('pathway.inst.openSurvey')}
                        </button>
                    </span>
                </div>
                <p className="pw-panel-sub">{t('pathway.inst.retentionHint')}</p>
                {!retention ? (
                    <p className="pw-muted">{t('pathway.loading')}</p>
                ) : !hasRetention ? (
                    <div className="pw-note">
                        <ShieldCheck size={16} /> <span>{kNote} ({t('pathway.inst.responses')}: {responses})</span>
                    </div>
                ) : (
                    <>
                        <div className="pw-grid-4" style={{ marginBottom: 'var(--space-xl)' }}>
                            <Stat value={responses} label={t('pathway.inst.responses')} />
                            <Stat value={`${retention.in_region_pct} %`} label={t('pathway.inst.inRegion')} />
                            <Stat value={retention.employed_in_field_pct !== null ? `${retention.employed_in_field_pct} %` : '–'} label={t('pathway.inst.inField')} />
                            <Stat value={retention.avg_recommend ?? '–'} label={t('pathway.inst.recommend')} />
                        </div>
                        <h3>{t('pathway.inst.statusBreakdown')}</h3>
                        <ul className="pw-bars">
                            {RETENTION_STATUSES.map((s) => (
                                <Bar key={s} label={t(`pathway.survey.statusOptions.${s}`)} count={retention.status_counts?.[s] ?? 0} total={responses} />
                            ))}
                        </ul>
                    </>
                )}
            </section>
        </>
    );
};

const ContentManager: React.FC<{ institutionId: string; cohorts: Cohort[]; userId: string }> = ({ institutionId, cohorts, userId }) => {
    const { t } = useLanguage();
    const [items, setItems] = useState<InstitutionContent[]>([]);
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [link, setLink] = useState('');
    const [target, setTarget] = useState('');
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => setItems(await listInstitutionContent(institutionId)), [institutionId]);

    useEffect(() => {
        // Intentional: initial fetch of published content.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        load();
    }, [load]);

    const add = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (title.trim().length < 2) return;
        const linkUrl = link.trim() ? safeUrl(link) : null;
        if (link.trim() && !linkUrl) {
            setError(t('pathway.inst.invalidLink'));
            return;
        }
        const ok = await addInstitutionContent(userId, {
            institution_id: institutionId,
            cohort_id: target || null,
            title: title.trim(),
            body: body.trim(),
            link_url: linkUrl,
        });
        if (!ok) {
            setError(t('pathway.saveError'));
            return;
        }
        setTitle('');
        setBody('');
        setLink('');
        load();
    };

    const remove = async (id: string) => {
        if (await deleteInstitutionContent(id)) load();
    };

    const cohortName = (id: string | null) => (id ? cohorts.find((c) => c.id === id)?.name ?? '' : t('pathway.inst.allCohorts'));

    return (
        <section className="pw-panel">
            <h2><FileText size={20} /> {t('pathway.inst.contentTitle')}</h2>
            <p className="pw-panel-sub">{t('pathway.inst.contentHint')}</p>
            <form onSubmit={add}>
                <div className="pw-grid-2">
                    <div className="pw-field">
                        <label htmlFor="pc-title">{t('pathway.inst.contentTitleField')}</label>
                        <input id="pc-title" className="input" maxLength={160} value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>
                    <div className="pw-field">
                        <label htmlFor="pc-target">{t('pathway.inst.cohortsTitle')}</label>
                        <select id="pc-target" className="select" value={target} onChange={(e) => setTarget(e.target.value)}>
                            <option value="">{t('pathway.inst.allCohorts')}</option>
                            {cohorts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                </div>
                <div className="pw-field">
                    <label htmlFor="pc-body">{t('pathway.inst.contentBody')}</label>
                    <textarea id="pc-body" className="textarea" rows={4} maxLength={4000} value={body} onChange={(e) => setBody(e.target.value)} />
                </div>
                <div className="pw-field">
                    <label htmlFor="pc-link">{t('pathway.inst.contentLink')}</label>
                    <input id="pc-link" type="url" className="input" placeholder="https://" value={link} onChange={(e) => setLink(e.target.value)} />
                </div>
                <button className="btn btn-primary" disabled={title.trim().length < 2}>{t('pathway.inst.addContent')}</button>
                {error && <p className="pw-error">{error}</p>}
            </form>

            <div style={{ marginTop: 'var(--space-lg)' }}>
                {items.length === 0 ? (
                    <p className="pw-muted">{t('pathway.inst.noContentYet')}</p>
                ) : items.map((item) => {
                    const href = safeUrl(item.link_url);
                    return (
                        <article key={item.id} className="pw-content-item">
                            <div>
                                <h4>{item.title} <span className="pw-badge">{cohortName(item.cohort_id)}</span></h4>
                                {item.body && <p>{item.body}</p>}
                                {href && (
                                    <a href={href} target="_blank" rel="noopener noreferrer" className="pw-link">
                                        {new URL(href).hostname} <ExternalLink size={13} />
                                    </a>
                                )}
                            </div>
                            <button className="btn btn-secondary btn-sm" onClick={() => remove(item.id)} aria-label={t('pathway.inst.deleteContent')}>
                                <Trash2 size={14} />
                            </button>
                        </article>
                    );
                })}
            </div>
        </section>
    );
};
