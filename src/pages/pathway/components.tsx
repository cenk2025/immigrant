import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, LogIn } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import type { PathwayLink } from '../../data/pathwayData';
import { usePick } from './utils';

export const BackToPathway: React.FC = () => {
    const { t } = useLanguage();
    return (
        <Link to="/pathway" className="pw-back">
            <ArrowLeft size={16} /> {t('pathway.back')}
        </Link>
    );
};

export const PwLink: React.FC<{ link: PathwayLink }> = ({ link }) => {
    const pick = usePick();
    if (link.internal) {
        return <Link to={link.url} className="pw-link">{pick(link.label)} →</Link>;
    }
    return (
        <a href={link.url} target="_blank" rel="noopener noreferrer" className="pw-link">
            {pick(link.label)} <ExternalLink size={13} />
        </a>
    );
};

export const LoginPrompt: React.FC<{ message: string }> = ({ message }) => {
    const { t } = useLanguage();
    return (
        <div className="pw-note">
            <LogIn size={18} />
            <span>
                {message}{' '}
                <Link to="/login" className="pw-link">{t('pathway.login')}</Link>
            </span>
        </div>
    );
};
