import React, { useState } from 'react';
import { Users, FileText, Clock, DollarSign, Shield, MessageSquare, Search, Briefcase, Award, Globe, ChevronDown, ChevronUp, Bookmark } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { guideData } from '../data/guideData';
import './GuidePage.css';

const iconMap: Record<string, React.ReactNode> = {
    Users: <Users size={24} />,
    FileText: <FileText size={24} />,
    Clock: <Clock size={24} />,
    DollarSign: <DollarSign size={24} />,
    Shield: <Shield size={24} />,
    MessageSquare: <MessageSquare size={24} />,
    Search: <Search size={24} />,
    Briefcase: <Briefcase size={24} />,
    Award: <Award size={24} />,
    Globe: <Globe size={24} />,
};

export const GuidePage: React.FC = () => {
    const { t, language } = useLanguage();
    const [expandedSection, setExpandedSection] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const toggleSection = (sectionId: string) => {
        setExpandedSection(expandedSection === sectionId ? null : sectionId);
    };

    const filteredGuides = guideData.filter(guide => {
        const content = guide.content[language];
        const searchLower = searchQuery.toLowerCase();
        return (
            guide.title.toLowerCase().includes(searchLower) ||
            content.introduction.toLowerCase().includes(searchLower) ||
            content.sections.some(section =>
                section.title.toLowerCase().includes(searchLower) ||
                section.content.toLowerCase().includes(searchLower)
            )
        );
    });

    return (
        <div className="guide-page">
            {/* Hero Section */}
            <section className="guide-hero">
                <div className="container">
                    <h1>{t('guide.title')}</h1>
                    <p className="guide-subtitle">{t('guide.subtitle')}</p>

                    {/* Search Bar */}
                    <div className="guide-search">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder={t('common.search') + '...'}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="guide-search-input"
                        />
                    </div>
                </div>
            </section>

            {/* Guide Content */}
            <section className="section">
                <div className="container">
                    <div className="guide-grid">
                        {filteredGuides.map((guide) => {
                            const content = guide.content[language];
                            const isExpanded = expandedSection === guide.id;

                            return (
                                <div key={guide.id} className="guide-card">
                                    <div
                                        className="guide-card-header"
                                        onClick={() => toggleSection(guide.id)}
                                    >
                                        <div className="guide-card-icon">
                                            {iconMap[guide.icon] || <FileText size={24} />}
                                        </div>
                                        <h3 className="guide-card-title">{guide.title}</h3>
                                        <button className="guide-expand-btn" aria-label="Expand section">
                                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </button>
                                    </div>

                                    {isExpanded && (
                                        <div className="guide-card-content">
                                            <p className="guide-introduction">{content.introduction}</p>

                                            <div className="guide-sections">
                                                {content.sections.map((section, index) => (
                                                    <div key={index} className="guide-subsection">
                                                        <h4>{section.title}</h4>
                                                        <p>{section.content}</p>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="guide-key-points">
                                                <h4>Key Points</h4>
                                                <ul>
                                                    {content.keyPoints.map((point, index) => (
                                                        <li key={index}>{point}</li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div className="guide-actions">
                                                <button className="btn btn-secondary btn-sm">
                                                    <Bookmark size={16} />
                                                    Save Section
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {filteredGuides.length === 0 && (
                        <div className="guide-no-results">
                            <Search size={48} />
                            <h3>No results found</h3>
                            <p>Try adjusting your search terms</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Additional Resources */}
            <section className="section guide-resources">
                <div className="container">
                    <h2>Additional Resources</h2>
                    <div className="resources-grid">
                        <div className="resource-card">
                            <h4>Need More Help?</h4>
                            <p>Chat with our intelligent assistant for personalized guidance.</p>
                            <a href="/assistant" className="btn btn-primary btn-sm">
                                Ask Assistant
                            </a>
                        </div>
                        <div className="resource-card">
                            <h4>Build Your CV</h4>
                            <p>Create a professional CV that meets Finnish employer expectations.</p>
                            <a href="/cv-builder" className="btn btn-primary btn-sm">
                                Start Building
                            </a>
                        </div>
                        <div className="resource-card">
                            <h4>External Resources</h4>
                            <p>Official Finnish government resources for immigrants.</p>
                            <a
                                href="https://www.infofinland.fi"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-secondary btn-sm"
                            >
                                Visit InfoFinland
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};
