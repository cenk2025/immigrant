import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    PlaneLanding, Check, ChevronDown, ChevronUp, FileCheck2, ClipboardList, Info, LifeBuoy, ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { pathwayPhases, pathwayTaskIds, permitSteps, firstWeekTips } from '../../data/pathwayData';
import type { PermitStatus } from '../../data/pathwayData';
import { getPathwayProfile, savePathwayProfile } from '../../lib/pathway';
import type { PathwayProfile, PathwayProfileUpdate } from '../../lib/pathway';
import { BackToPathway, LoginPrompt, PwLink } from './components';
import { daysFromToday, fmt, usePick } from './utils';
import './Pathway.css';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

const EMPTY_PROFILE: Omit<PathwayProfile, 'user_id' | 'updated_at'> = {
    arrival_date: null,
    permit_status: 'not_started',
    permit_submitted_on: null,
    completed_tasks: [],
    cohort_id: null,
};

/** Index of the phase the student is in, given days until arrival. */
function currentPhaseIndex(daysUntil: number | null): number {
    if (daysUntil === null) return -1;
    return pathwayPhases.findIndex((p, i) => daysUntil > p.toWeeks * 7 && (i === 0 || daysUntil <= p.fromWeeks * 7));
}

export const PreArrivalPage: React.FC = () => {
    const { t } = useLanguage();
    const pick = usePick();
    const { user } = useAuth();

    const [profile, setProfile] = useState(EMPTY_PROFILE);
    const [saveState, setSaveState] = useState<SaveState>('idle');
    const [openPhases, setOpenPhases] = useState<Set<string> | null>(null);
    const saveSeq = useRef(0);

    useEffect(() => {
        if (!user) return;
        let active = true;
        getPathwayProfile(user.id).then((p) => {
            if (active && p) setProfile(p);
        });
        return () => { active = false; };
    }, [user]);

    const save = async (patch: PathwayProfileUpdate) => {
        setProfile((p) => ({ ...p, ...patch }));
        if (!user) return;
        const seq = ++saveSeq.current;
        setSaveState('saving');
        const saved = await savePathwayProfile(user.id, patch);
        if (seq !== saveSeq.current) return;
        setSaveState(saved ? 'saved' : 'error');
    };

    const done = useMemo(() => new Set(profile.completed_tasks), [profile.completed_tasks]);
    const doneCount = pathwayTaskIds.filter((id) => done.has(id)).length;
    const totalCount = pathwayTaskIds.length;

    const daysUntil = profile.arrival_date ? daysFromToday(profile.arrival_date) : null;
    const phaseIdx = currentPhaseIndex(daysUntil);
    const defaultOpen = pathwayPhases[phaseIdx >= 0 ? phaseIdx : 0].id;
    const isOpen = (id: string) => (openPhases ? openPhases.has(id) : id === defaultOpen);

    const togglePhase = (id: string) => {
        setOpenPhases((prev) => {
            const next = new Set(prev ?? [defaultOpen]);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleTask = (id: string) => {
        if (!user) return;
        const next = done.has(id) ? profile.completed_tasks.filter((x) => x !== id) : [...profile.completed_tasks, id];
        save({ completed_tasks: next });
    };

    const countdown = (() => {
        if (daysUntil === null) return t('pathway.preArrival.setArrival');
        if (daysUntil <= 0) return fmt(t('pathway.preArrival.arrived'), { n: -daysUntil });
        if (daysUntil < 14) return fmt(t('pathway.preArrival.daysUntil'), { n: daysUntil });
        return fmt(t('pathway.preArrival.weeksUntil'), { n: Math.floor(daysUntil / 7) });
    })();

    const permitIdx = permitSteps.findIndex((s) => s.status === profile.permit_status);
    const permitDays = profile.permit_submitted_on ? -daysFromToday(profile.permit_submitted_on) : null;
    const registrationTasks = pathwayPhases.flatMap((p) => p.tasks).filter((task) => task.registration);

    return (
        <div className="pw-page">
            <div className="pw-container">
                <BackToPathway />
                <header className="pw-hero">
                    <div className="pw-hero-icon"><PlaneLanding size={32} /></div>
                    <div>
                        <span className="pw-eyebrow">{t('pathway.name')}</span>
                        <h1>{t('pathway.preArrival.title')}</h1>
                        <p>{t('pathway.preArrival.subtitle')}</p>
                    </div>
                </header>

                {!user && <div style={{ marginBottom: 'var(--space-xl)' }}><LoginPrompt message={t('pathway.loginToSave')} /></div>}

                {/* Arrival + progress */}
                <section className="pw-panel">
                    <div className="pw-grid-2">
                        <div className="pw-field" style={{ marginBottom: 0 }}>
                            <label htmlFor="pw-arrival">{t('pathway.preArrival.arrivalLabel')}</label>
                            <input
                                id="pw-arrival"
                                type="date"
                                className="input"
                                value={profile.arrival_date ?? ''}
                                onChange={(e) => save({ arrival_date: e.target.value || null })}
                            />
                            <small>{countdown}</small>
                        </div>
                        <div>
                            <div className="pw-status-row">
                                <strong>{fmt(t('pathway.preArrival.progress'), { done: doneCount, total: totalCount })}</strong>
                                <span className="pw-save-state" aria-live="polite">
                                    {saveState === 'saving' && t('pathway.saving')}
                                    {saveState === 'saved' && t('pathway.saved')}
                                    {saveState === 'error' && <span className="pw-error">{t('pathway.saveError')}</span>}
                                </span>
                            </div>
                            <div className="pw-progress" role="progressbar" aria-valuemin={0} aria-valuemax={totalCount} aria-valuenow={doneCount}>
                                <span style={{ width: `${(doneCount / totalCount) * 100}%` }} />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Permit tracker */}
                <section className="pw-panel">
                    <h2><FileCheck2 size={20} /> {t('pathway.preArrival.permitTitle')}</h2>
                    <p className="pw-panel-sub">{t('pathway.preArrival.permitSubtitle')}</p>
                    <ol className="pw-stepper" aria-label={t('pathway.preArrival.permitStatus')}>
                        {permitSteps.map((step, i) => (
                            <li key={step.status} className={`pw-step ${i < permitIdx ? 'past' : ''} ${i === permitIdx ? 'current' : ''}`}>
                                <button
                                    type="button"
                                    onClick={() => save({ permit_status: step.status as PermitStatus })}
                                    aria-pressed={i === permitIdx}
                                >
                                    <span className="pw-step-dot">{i < permitIdx ? <Check size={13} /> : i + 1}</span>
                                    {pick(step.label)}
                                </button>
                            </li>
                        ))}
                    </ol>
                    <div className="pw-note" style={{ marginBottom: 'var(--space-md)' }}>
                        <Info size={16} /> <span>{pick(permitSteps[Math.max(permitIdx, 0)].hint)}</span>
                    </div>
                    {profile.permit_status !== 'not_started' && (
                        <div className="pw-grid-2">
                            <div className="pw-field" style={{ marginBottom: 0 }}>
                                <label htmlFor="pw-submitted">{t('pathway.preArrival.submittedOn')}</label>
                                <input
                                    id="pw-submitted"
                                    type="date"
                                    className="input"
                                    value={profile.permit_submitted_on ?? ''}
                                    max={new Date().toISOString().slice(0, 10)}
                                    onChange={(e) => save({ permit_submitted_on: e.target.value || null })}
                                />
                                {permitDays !== null && permitDays >= 0 && (
                                    <small>{fmt(t('pathway.preArrival.daysSince'), { n: permitDays })}</small>
                                )}
                            </div>
                            <div style={{ alignSelf: 'end' }}>
                                <a href="https://migri.fi/en/processing-times" target="_blank" rel="noopener noreferrer" className="pw-link">
                                    {t('pathway.preArrival.processingTimes')} <ExternalLink size={13} />
                                </a>
                            </div>
                        </div>
                    )}
                </section>

                {/* Roadmap */}
                <section style={{ marginBottom: 'var(--space-xl)' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: 'var(--space-md)' }}>{t('pathway.preArrival.roadmapTitle')}</h2>
                    {pathwayPhases.map((phase, i) => {
                        const phaseDone = phase.tasks.filter((task) => done.has(task.id)).length;
                        const open = isOpen(phase.id);
                        return (
                            <div key={phase.id} className={`pw-phase ${i === phaseIdx ? 'current' : ''}`}>
                                <button
                                    type="button"
                                    className="pw-phase-head"
                                    onClick={() => togglePhase(phase.id)}
                                    aria-expanded={open}
                                >
                                    <div className="pw-phase-meta">
                                        <h3>
                                            {pick(phase.title)}
                                            {i === phaseIdx && <span className="pw-here">{t('pathway.preArrival.youAreHere')}</span>}
                                        </h3>
                                        <span className="pw-phase-when">{pick(phase.when)}</span>
                                    </div>
                                    <span className="pw-phase-count">{phaseDone}/{phase.tasks.length}</span>
                                    {open ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </button>
                                {open && (
                                    <ul className="pw-tasks">
                                        {phase.tasks.map((task) => {
                                            const isDone = done.has(task.id);
                                            return (
                                                <li key={task.id} className={`pw-task ${isDone ? 'is-done' : ''}`}>
                                                    <button
                                                        type="button"
                                                        className={`pw-check ${isDone ? 'done' : ''}`}
                                                        onClick={() => toggleTask(task.id)}
                                                        disabled={!user}
                                                        aria-pressed={isDone}
                                                        aria-label={isDone ? t('pathway.preArrival.done') : t('pathway.preArrival.markDone')}
                                                        title={isDone ? t('pathway.preArrival.done') : t('pathway.preArrival.markDone')}
                                                    >
                                                        {isDone && <Check size={15} />}
                                                    </button>
                                                    <div className="pw-task-body">
                                                        <h4>{pick(task.title)}</h4>
                                                        <p>{pick(task.detail)}</p>
                                                        {task.link && <PwLink link={task.link} />}
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </div>
                        );
                    })}
                </section>

                {/* Registration checklist */}
                <section className="pw-panel">
                    <h2><ClipboardList size={20} /> {t('pathway.preArrival.registrationTitle')}</h2>
                    <p className="pw-panel-sub">{t('pathway.preArrival.registrationSubtitle')}</p>
                    <ul className="pw-checklist">
                        {registrationTasks.map((task) => {
                            const isDone = done.has(task.id);
                            return (
                                <li key={task.id} className={isDone ? 'done' : ''}>
                                    <button
                                        type="button"
                                        className={`pw-check ${isDone ? 'done' : ''}`}
                                        onClick={() => toggleTask(task.id)}
                                        disabled={!user}
                                        aria-pressed={isDone}
                                        aria-label={pick(task.title)}
                                        style={{ marginTop: 0 }}
                                    >
                                        {isDone && <Check size={15} />}
                                    </button>
                                    {pick(task.title)}
                                </li>
                            );
                        })}
                    </ul>
                </section>

                {/* First-week guide */}
                <section className="pw-panel">
                    <h2><LifeBuoy size={20} /> {t('pathway.preArrival.firstWeekTitle')}</h2>
                    <div className="pw-grid-2" style={{ marginTop: 'var(--space-md)' }}>
                        {firstWeekTips.map((tip) => (
                            <div key={tip.title.en} className="pw-tip">
                                <h4>{pick(tip.title)}</h4>
                                <p>{pick(tip.body)}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <p className="pw-muted">{t('pathway.officialSources')}</p>
            </div>
        </div>
    );
};
