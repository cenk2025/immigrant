import React, { useState } from 'react';
import { X, Cookie } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import './CookieConsent.css';

interface CookiePreferences {
    necessary: boolean;
    analytics: boolean;
    marketing: boolean;
}

export const CookieConsent: React.FC = () => {
    const { t } = useLanguage();
    // Show the banner only when the user has not yet stored a consent choice.
    const [showBanner, setShowBanner] = useState(
        () => !localStorage.getItem('worklife-cookie-consent')
    );
    const [showPreferences, setShowPreferences] = useState(false);
    const [preferences, setPreferences] = useState<CookiePreferences>({
        necessary: true,
        analytics: false,
        marketing: false,
    });

    const handleAcceptAll = () => {
        const allAccepted = {
            necessary: true,
            analytics: true,
            marketing: true,
        };
        savePreferences(allAccepted);
    };

    const handleRejectAll = () => {
        const onlyNecessary = {
            necessary: true,
            analytics: false,
            marketing: false,
        };
        savePreferences(onlyNecessary);
    };

    const handleSavePreferences = () => {
        savePreferences(preferences);
    };

    const savePreferences = (prefs: CookiePreferences) => {
        localStorage.setItem('worklife-cookie-consent', JSON.stringify(prefs));
        setShowBanner(false);
        setShowPreferences(false);
    };

    if (!showBanner) return null;

    return (
        <div className="cookie-consent-overlay">
            <div className="cookie-consent">
                <div className="cookie-header">
                    <div className="cookie-icon">
                        <Cookie size={24} />
                    </div>
                    <h3>{t('cookies.title')}</h3>
                    <button
                        onClick={() => setShowBanner(false)}
                        className="cookie-close"
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>
                </div>

                <p className="cookie-message">{t('cookies.message')}</p>

                {showPreferences && (
                    <div className="cookie-preferences">
                        <div className="cookie-option">
                            <div className="cookie-option-header">
                                <input
                                    type="checkbox"
                                    id="necessary"
                                    checked={preferences.necessary}
                                    disabled
                                    className="cookie-checkbox"
                                />
                                <label htmlFor="necessary" className="cookie-label">
                                    {t('cookies.necessary')}
                                </label>
                            </div>
                            <p className="cookie-option-description">
                                Essential cookies for the website to function properly.
                            </p>
                        </div>

                        <div className="cookie-option">
                            <div className="cookie-option-header">
                                <input
                                    type="checkbox"
                                    id="analytics"
                                    checked={preferences.analytics}
                                    onChange={(e) =>
                                        setPreferences({ ...preferences, analytics: e.target.checked })
                                    }
                                    className="cookie-checkbox"
                                />
                                <label htmlFor="analytics" className="cookie-label">
                                    {t('cookies.analytics')}
                                </label>
                            </div>
                            <p className="cookie-option-description">
                                Help us understand how visitors use our website.
                            </p>
                        </div>

                        <div className="cookie-option">
                            <div className="cookie-option-header">
                                <input
                                    type="checkbox"
                                    id="marketing"
                                    checked={preferences.marketing}
                                    onChange={(e) =>
                                        setPreferences({ ...preferences, marketing: e.target.checked })
                                    }
                                    className="cookie-checkbox"
                                />
                                <label htmlFor="marketing" className="cookie-label">
                                    {t('cookies.marketing')}
                                </label>
                            </div>
                            <p className="cookie-option-description">
                                Used to deliver personalized content and advertisements.
                            </p>
                        </div>
                    </div>
                )}

                <div className="cookie-actions">
                    {showPreferences ? (
                        <>
                            <button onClick={handleSavePreferences} className="btn btn-primary">
                                {t('common.save')}
                            </button>
                            <button
                                onClick={() => setShowPreferences(false)}
                                className="btn btn-secondary"
                            >
                                {t('common.back')}
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={handleAcceptAll} className="btn btn-primary">
                                {t('cookies.accept')}
                            </button>
                            <button onClick={handleRejectAll} className="btn btn-secondary">
                                {t('cookies.reject')}
                            </button>
                            <button
                                onClick={() => setShowPreferences(true)}
                                className="btn btn-secondary"
                            >
                                {t('cookies.manage')}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
