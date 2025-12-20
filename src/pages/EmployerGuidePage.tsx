import React, { useState } from 'react';
import { Users, Globe, FileCheck, Plane, ChevronDown, ChevronUp, ExternalLink, Search, BookOpen } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { employerGuideData } from '../data/employerGuideData';
import './EmployerGuidePage.css';

const iconMap = {
    Users,
    Globe,
    FileCheck,
    Plane,
};

export const EmployerGuidePage: React.FC = () => {
    const { language } = useLanguage();
    const [expandedSections, setExpandedSections] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<'all' | 'eu' | 'non-eu' | 'general'>('all');

    const toggleSection = (sectionId: string) => {
        setExpandedSections((prev) =>
            prev.includes(sectionId)
                ? prev.filter((id) => id !== sectionId)
                : [...prev, sectionId]
        );
    };

    const filteredSections = employerGuideData.filter((section) => {
        const matchesCategory = selectedCategory === 'all' || section.category === selectedCategory;
        const matchesSearch =
            searchQuery === '' ||
            section.title[language].toLowerCase().includes(searchQuery.toLowerCase()) ||
            section.content[language].introduction.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="employer-guide-page">
            <div className="container">
                {/* Hero Section */}
                <div className="employer-guide-hero">
                    <div className="employer-guide-hero-icon">
                        <BookOpen size={48} />
                    </div>
                    <h1>{language === 'en' ? 'Employer Guide' : 'Työnantajan Opas'}</h1>
                    <p className="employer-guide-subtitle">
                        {language === 'en'
                            ? 'Comprehensive guide for companies hiring immigrant workers in Finland'
                            : 'Kattava opas yrityksille, jotka palkkaavat maahanmuuttajatyöntekijöitä Suomessa'}
                    </p>
                </div>

                {/* Category Filter */}
                <div className="employer-guide-filters">
                    <div className="category-tabs">
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={`category-tab ${selectedCategory === 'all' ? 'active' : ''}`}
                        >
                            {language === 'en' ? 'All Topics' : 'Kaikki Aiheet'}
                        </button>
                        <button
                            onClick={() => setSelectedCategory('eu')}
                            className={`category-tab ${selectedCategory === 'eu' ? 'active' : ''}`}
                        >
                            {language === 'en' ? 'EU/EEA Workers' : 'EU/ETA-työntekijät'}
                        </button>
                        <button
                            onClick={() => setSelectedCategory('non-eu')}
                            className={`category-tab ${selectedCategory === 'non-eu' ? 'active' : ''}`}
                        >
                            {language === 'en' ? 'Non-EU Workers' : 'EU:n ulkopuoliset'}
                        </button>
                        <button
                            onClick={() => setSelectedCategory('general')}
                            className={`category-tab ${selectedCategory === 'general' ? 'active' : ''}`}
                        >
                            {language === 'en' ? 'General Obligations' : 'Yleiset velvollisuudet'}
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="employer-search-bar">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder={language === 'en' ? 'Search topics...' : 'Hae aiheita...'}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="employer-search-input"
                        />
                    </div>
                </div>

                {/* Guide Sections */}
                <div className="employer-guide-sections">
                    {filteredSections.length === 0 ? (
                        <div className="no-results">
                            <p>{language === 'en' ? 'No topics found' : 'Aiheita ei löytynyt'}</p>
                        </div>
                    ) : (
                        filteredSections.map((section) => {
                            const Icon = iconMap[section.icon as keyof typeof iconMap];
                            const isExpanded = expandedSections.includes(section.id);
                            const content = section.content[language];

                            return (
                                <div key={section.id} className="employer-guide-card">
                                    <div
                                        className="employer-guide-card-header"
                                        onClick={() => toggleSection(section.id)}
                                    >
                                        <div className="employer-guide-card-title">
                                            <div className="employer-guide-icon">
                                                <Icon size={24} />
                                            </div>
                                            <h2>{section.title[language]}</h2>
                                        </div>
                                        <button className="expand-btn" aria-label="Toggle section">
                                            {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                                        </button>
                                    </div>

                                    {isExpanded && (
                                        <div className="employer-guide-card-content">
                                            {/* Introduction */}
                                            <div className="guide-introduction">
                                                <p>{content.introduction}</p>
                                            </div>

                                            {/* Steps */}
                                            <div className="guide-section">
                                                <h3>{language === 'en' ? 'Step-by-Step Process' : 'Vaiheittainen Prosessi'}</h3>
                                                <div className="guide-steps">
                                                    {content.steps.map((step, index) => (
                                                        <div key={index} className="guide-step">
                                                            <div className="step-number">{index + 1}</div>
                                                            <div className="step-content">
                                                                <h4>{step.title}</h4>
                                                                <p>{step.description}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Requirements */}
                                            <div className="guide-section">
                                                <h3>{language === 'en' ? 'Requirements Checklist' : 'Vaatimuslista'}</h3>
                                                <ul className="guide-checklist">
                                                    {content.requirements.map((req, index) => (
                                                        <li key={index}>{req}</li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {/* Official Links */}
                                            <div className="guide-section">
                                                <h3>{language === 'en' ? 'Official Resources' : 'Viralliset Resurssit'}</h3>
                                                <div className="official-links">
                                                    {content.officialLinks.map((link, index) => (
                                                        <a
                                                            key={index}
                                                            href={link.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="official-link-card"
                                                        >
                                                            <div className="official-link-content">
                                                                <h4>{link.title}</h4>
                                                                <p>{link.description}</p>
                                                            </div>
                                                            <ExternalLink size={20} />
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Key Points */}
                                            <div className="guide-section">
                                                <h3>{language === 'en' ? 'Key Points to Remember' : 'Tärkeimmät Muistettavat Asiat'}</h3>
                                                <div className="key-points">
                                                    {content.keyPoints.map((point, index) => (
                                                        <div key={index} className="key-point">
                                                            <div className="key-point-bullet">•</div>
                                                            <p>{point}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Additional Resources */}
                <div className="employer-additional-resources">
                    <h2>{language === 'en' ? 'Need More Help?' : 'Tarvitsetko Lisää Apua?'}</h2>
                    <div className="resource-cards">
                        <div className="resource-card">
                            <h3>{language === 'en' ? 'Contact TE Services' : 'Ota Yhteyttä TE-palveluihin'}</h3>
                            <p>
                                {language === 'en'
                                    ? 'Get personalized guidance for recruiting from abroad'
                                    : 'Saa henkilökohtaista ohjausta ulkomailta rekrytointiin'}
                            </p>
                            <a
                                href="https://www.te-palvelut.fi/en/employers"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-secondary"
                            >
                                {language === 'en' ? 'Visit TE Services' : 'Siirry TE-palveluihin'}
                            </a>
                        </div>

                        <div className="resource-card">
                            <h3>{language === 'en' ? 'Work in Finland Portal' : 'Work in Finland -portaali'}</h3>
                            <p>
                                {language === 'en'
                                    ? 'Official portal for employers and international talent'
                                    : 'Virallinen portaali työnantajille ja kansainvälisille osaajille'}
                            </p>
                            <a
                                href="https://www.workinfinland.com/employers/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-secondary"
                            >
                                {language === 'en' ? 'Visit Portal' : 'Siirry Portaaliin'}
                            </a>
                        </div>

                        <div className="resource-card">
                            <h3>{language === 'en' ? 'Legal Consultation' : 'Lakineuvonta'}</h3>
                            <p>
                                {language === 'en'
                                    ? 'For complex cases, consult with immigration lawyers'
                                    : 'Monimutkaisissa tapauksissa konsultoi maahanmuuttoasianajajia'}
                            </p>
                            <a
                                href="https://asianajajaliitto.fi/en/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-secondary"
                            >
                                {language === 'en' ? 'Find a Lawyer' : 'Löydä Asianajaja'}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
