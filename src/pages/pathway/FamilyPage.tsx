import React from 'react';
import { Link } from 'react-router-dom';
import {
    HeartHandshake, FileText, Briefcase, Baby, School, Stethoscope, Languages, Users,
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { familySections } from '../../data/pathwayData';
import type { FamilySection } from '../../data/pathwayData';
import { BackToPathway, PwLink } from './components';
import { usePick } from './utils';
import './Pathway.css';

const ICONS: Record<FamilySection['icon'], React.ReactNode> = {
    permit: <FileText size={20} />,
    work: <Briefcase size={20} />,
    daycare: <Baby size={20} />,
    school: <School size={20} />,
    health: <Stethoscope size={20} />,
    language: <Languages size={20} />,
    social: <Users size={20} />,
};

export const FamilyPage: React.FC = () => {
    const { t } = useLanguage();
    const pick = usePick();

    return (
        <div className="pw-page">
            <div className="pw-container">
                <BackToPathway />
                <header className="pw-hero">
                    <div className="pw-hero-icon"><HeartHandshake size={32} /></div>
                    <div>
                        <span className="pw-eyebrow">{t('pathway.name')}</span>
                        <h1>{t('pathway.family.title')}</h1>
                        <p>{t('pathway.family.subtitle')}</p>
                    </div>
                </header>

                <div className="pw-cta-band">
                    <div>
                        <h2>{t('pathway.family.communityTitle')}</h2>
                        <p>{t('pathway.family.communityText')}</p>
                    </div>
                    <div className="pw-inline">
                        <Link to="/mentorship" className="btn btn-primary">{t('pathway.family.mentorCta')}</Link>
                        <Link to="/community" className="btn btn-secondary">{t('pathway.family.communityCta')}</Link>
                    </div>
                </div>

                {familySections.map((section) => (
                    <section key={section.id} id={section.id} className="pw-panel pw-family-section">
                        <h2>{ICONS[section.icon]} {pick(section.title)}</h2>
                        <p className="pw-panel-sub">{pick(section.intro)}</p>
                        <ul>
                            {section.points.map((point) => <li key={point.en}>{pick(point)}</li>)}
                        </ul>
                        {section.links.length > 0 && (
                            <div className="pw-links" aria-label={t('pathway.family.links')}>
                                {section.links.map((link) => <PwLink key={link.url} link={link} />)}
                            </div>
                        )}
                    </section>
                ))}

                <p className="pw-muted">{t('pathway.officialSources')}</p>
            </div>
        </div>
    );
};
