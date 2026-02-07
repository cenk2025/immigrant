import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Github, Linkedin } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import './Footer.css';

export const Footer: React.FC = () => {
    const { t } = useLanguage();
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    {/* About Section */}
                    <div className="footer-section">
                        <div className="footer-logo">
                            <div className="footer-logo-icon">V</div>
                            <div>
                                <h3 className="footer-brand">Talent Factory</h3>
                                <p className="footer-tagline">{t('hero.byVoonIQ')}</p>
                            </div>
                        </div>
                        <p className="footer-description">
                            {t('footer.description')}
                        </p>
                    </div>

                    {/* Product Links */}
                    <div className="footer-section">
                        <h4 className="footer-heading">{t('footer.product')}</h4>
                        <ul className="footer-links">
                            <li><Link to="/guide">{t('nav.guide')}</Link></li>
                            <li><Link to="/cv-builder">{t('nav.cvBuilder')}</Link></li>
                            <li><Link to="/assistant">{t('nav.assistant')}</Link></li>
                            <li><Link to="/dashboard">{t('nav.dashboard')}</Link></li>
                        </ul>
                    </div>

                    {/* Legal Links */}
                    <div className="footer-section">
                        <h4 className="footer-heading">{t('footer.legal')}</h4>
                        <ul className="footer-links">
                            <li><Link to="/privacy">{t('footer.privacy')}</Link></li>
                            <li><Link to="/terms">{t('footer.terms')}</Link></li>
                            <li><button className="footer-link-btn">{t('footer.cookies')}</button></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div className="footer-section">
                        <h4 className="footer-heading">{t('footer.support')}</h4>
                        <ul className="footer-links">
                            <li><Link to="/contact">{t('footer.contact')}</Link></li>
                            <li><a href="mailto:support@vooniq.com">support@vooniq.com</a></li>
                        </ul>
                        <div className="footer-social">
                            <a href="https://github.com/vooniq" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                                <Github size={20} />
                            </a>
                            <a href="https://linkedin.com/company/vooniq" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                                <Linkedin size={20} />
                            </a>
                            <a href="mailto:support@vooniq.com" aria-label="Email">
                                <Mail size={20} />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="footer-bottom">
                    <p className="footer-copyright">
                        © {currentYear} Voon IQ. {t('footer.copyright').split('©')[1]?.split('.')[1] || 'All rights reserved.'}
                    </p>
                    <div className="footer-badges">
                        <span className="badge">GDPR Compliant</span>
                        <span className="badge">Made in Finland</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};
