import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Sun, Moon, Globe, User } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

export const Header: React.FC = () => {
    const { t, language, setLanguage } = useLanguage();
    const { theme, toggleTheme } = useTheme();
    const { user } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'fi' : 'en');
    };

    return (
        <header className="header">
            <div className="container">
                <div className="header-content">
                    <Link to="/" className="logo">
                        <div className="logo-icon">V</div>
                        <div className="logo-text">
                            <span className="logo-title">Talent Factory</span>
                            <span className="logo-subtitle">Finland</span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="nav-desktop">
                        <Link to="/guide" className="nav-link">{t('nav.guide')}</Link>
                        <Link to="/employer-guide" className="nav-link">{t('nav.employerGuide')}</Link>
                        <Link to="/cv-builder" className="nav-link">{t('nav.cvBuilder')}</Link>
                        <Link to="/community" className="nav-link">Community</Link>
                        <Link to="/mentorship" className="nav-link">Mentorship</Link>
                        <Link to="/assistant" className="nav-link">{t('nav.assistant')}</Link>
                        {user && <Link to="/dashboard" className="nav-link">{t('nav.dashboard')}</Link>}
                    </nav>

                    {/* Actions */}
                    <div className="header-actions">
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="icon-btn"
                            aria-label="Toggle theme"
                            title={theme === 'light' ? t('common.dark') : t('common.light')}
                        >
                            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                        </button>

                        {/* Language Toggle */}
                        <button
                            onClick={toggleLanguage}
                            className="icon-btn language-btn"
                            aria-label="Toggle language"
                            title={t('common.language')}
                        >
                            <Globe size={20} />
                            <span className="language-code">{language.toUpperCase()}</span>
                        </button>

                        {/* Auth Buttons */}
                        {user ? (
                            <Link to="/dashboard" className="btn btn-primary btn-sm">
                                <User size={16} />
                                {user.user_metadata?.full_name?.split(' ')[0] || 'Profile'}
                            </Link>
                        ) : (
                            <>
                                <Link to="/login" className="btn btn-secondary btn-sm">
                                    {t('nav.login')}
                                </Link>
                                <Link to="/signup" className="btn btn-primary btn-sm">
                                    {t('nav.signup')}
                                </Link>
                            </>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="mobile-menu-btn"
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <nav className="nav-mobile">
                        <Link
                            to="/guide"
                            className="nav-link-mobile"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            {t('nav.guide')}
                        </Link>
                        <Link
                            to="/employer-guide"
                            className="nav-link-mobile"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            {t('nav.employerGuide')}
                        </Link>
                        <Link
                            to="/cv-builder"
                            className="nav-link-mobile"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            {t('nav.cvBuilder')}
                        </Link>
                        <Link
                            to="/community"
                            className="nav-link-mobile"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Community
                        </Link>
                        <Link
                            to="/mentorship"
                            className="nav-link-mobile"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Mentorship
                        </Link>
                        <Link
                            to="/assistant"
                            className="nav-link-mobile"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            {t('nav.assistant')}
                        </Link>
                        {user && (
                            <Link
                                to="/dashboard"
                                className="nav-link-mobile"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {t('nav.dashboard')}
                            </Link>
                        )}
                    </nav>
                )}
            </div>
        </header>
    );
};
