import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, FileText, MessageCircle, LayoutDashboard, ArrowRight, CheckCircle } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import './HomePage.css';

export const HomePage: React.FC = () => {
    const { t } = useLanguage();
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.playbackRate = 0.5; // Slow motion
        }
    }, []);

    const features = [
        {
            icon: <BookOpen size={32} />,
            title: t('features.guide.title'),
            description: t('features.guide.description'),
            link: '/guide',
            color: 'primary',
        },
        {
            icon: <FileText size={32} />,
            title: t('features.cvBuilder.title'),
            description: t('features.cvBuilder.description'),
            link: '/cv-builder',
            color: 'secondary',
        },
        {
            icon: <MessageCircle size={32} />,
            title: t('features.assistant.title'),
            description: t('features.assistant.description'),
            link: '/assistant',
            color: 'accent',
        },
        {
            icon: <LayoutDashboard size={32} />,
            title: t('features.dashboard.title'),
            description: t('features.dashboard.description'),
            link: '/dashboard',
            color: 'primary',
        },
    ];

    const benefits = [
        'Understand Finnish work culture and expectations',
        'Create professional, Finland-appropriate CVs',
        'Access expert guidance 24/7',
        'Track your career development progress',
        'Save and organize important resources',
        'Get personalized career recommendations',
    ];

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-background">
                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="hero-video"
                    >
                        <source src="/Immigrant_Finland.mp4" type="video/mp4" />
                    </video>
                    <div className="hero-overlay"></div>
                </div>
                <div className="container">
                    <div className="hero-content">
                        <div className="hero-badge">{t('hero.byVoonIQ')}</div>
                        <h1 className="hero-title animate-fade-in">
                            {t('hero.title')}
                        </h1>
                        <p className="hero-subtitle animate-fade-in">
                            {t('hero.subtitle')}
                        </p>
                        <div className="hero-actions animate-fade-in">
                            <Link to="/cv-builder" className="btn btn-accent btn-lg">
                                {t('hero.cta.buildCV')}
                                <ArrowRight size={20} />
                            </Link>
                            <Link to="/guide" className="btn btn-secondary btn-lg">
                                {t('hero.cta.exploreGuide')}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="section features-section">
                <div className="container">
                    <div className="section-header">
                        <h2>{t('features.title')}</h2>
                    </div>
                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <Link
                                key={index}
                                to={feature.link}
                                className={`feature-card feature-card-${feature.color}`}
                            >
                                <div className="feature-icon">{feature.icon}</div>
                                <h3 className="feature-title">{feature.title}</h3>
                                <p className="feature-description">{feature.description}</p>
                                <div className="feature-arrow">
                                    <ArrowRight size={20} />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="section benefits-section">
                <div className="container">
                    <div className="benefits-content">
                        <div className="benefits-text">
                            <h2>Your Trusted Companion for Professional Life in Finland</h2>
                            <p>
                                Talent Factory is designed to support immigrants at every stage of their
                                career journey in Finland. Whether you're planning to move, just arrived, or
                                looking to advance your career, we provide the tools and knowledge you need.
                            </p>
                            <ul className="benefits-list">
                                {benefits.map((benefit, index) => (
                                    <li key={index} className="benefit-item">
                                        <CheckCircle size={20} className="benefit-icon" />
                                        <span>{benefit}</span>
                                    </li>
                                ))}
                            </ul>
                            <Link to="/signup" className="btn btn-primary btn-lg">
                                Get Started Free
                                <ArrowRight size={20} />
                            </Link>
                        </div>
                        <div className="benefits-visual">
                            <div className="visual-card card-1">
                                <div className="visual-icon">
                                    <BookOpen size={40} />
                                </div>
                                <div className="visual-text">
                                    <h4>Comprehensive Guides</h4>
                                    <p>Expert knowledge at your fingertips</p>
                                </div>
                            </div>
                            <div className="visual-card card-2">
                                <div className="visual-icon">
                                    <FileText size={40} />
                                </div>
                                <div className="visual-text">
                                    <h4>Professional CVs</h4>
                                    <p>Stand out to Finnish employers</p>
                                </div>
                            </div>
                            <div className="visual-card card-3">
                                <div className="visual-icon">
                                    <MessageCircle size={40} />
                                </div>
                                <div className="visual-text">
                                    <h4>24/7 Assistant</h4>
                                    <p>Get answers when you need them</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="section cta-section">
                <div className="container">
                    <div className="cta-card">
                        <h2>Ready to Navigate Your Career in Finland?</h2>
                        <p>
                            Join thousands of immigrants who have successfully integrated into Finnish
                            working life with Talent Factory.
                        </p>
                        <div className="cta-actions">
                            <Link to="/signup" className="btn btn-accent btn-lg">
                                Create Free Account
                                <ArrowRight size={20} />
                            </Link>
                            <Link to="/assistant" className="btn btn-secondary btn-lg">
                                {t('hero.cta.askAssistant')}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};
