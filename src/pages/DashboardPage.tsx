import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FileText, BookOpen, MessageCircle, User, LogOut, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { supabase } from '../lib/supabase';
import type { CVVersion } from '../lib/supabase';
import './DashboardPage.css';

export const DashboardPage: React.FC = () => {
    const { t } = useLanguage();
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [cvCount, setCvCount] = useState(0);
    const [recentCVs, setRecentCVs] = useState<CVVersion[]>([]);
    const [loading, setLoading] = useState(true);

    const loadDashboardData = useCallback(async () => {
        if (!user) return;

        setLoading(true);

        // Load CV count and recent CVs
        const { data: cvs, error } = await supabase
            .from('cv_versions')
            .select('*')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false })
            .limit(3);

        if (!error && cvs) {
            setCvCount(cvs.length);
            setRecentCVs(cvs);
        }

        setLoading(false);
    }, [user]);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        // Intentional: kick off the initial data load (which toggles `loading`) on mount.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadDashboardData();
    }, [user, navigate, loadDashboardData]);

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    if (!user) return null;

    return (
        <div className="dashboard-page">
            <div className="dashboard-container">
                {/* Header */}
                <div className="dashboard-header">
                    <div>
                        <h1>{t('dashboard.welcome')}, {user.user_metadata?.full_name || user.email}!</h1>
                        <p>Track your career development progress and manage your resources</p>
                    </div>
                    <button onClick={handleSignOut} className="btn btn-logout">
                        <LogOut size={18} />
                        {t('nav.logout')}
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="dashboard-stats">
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #3B82F6, #10B981)' }}>
                            <FileText size={24} />
                        </div>
                        <div className="stat-info">
                            <h3>{cvCount}</h3>
                            <p>CV Versions</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>
                            <BookOpen size={24} />
                        </div>
                        <div className="stat-info">
                            <h3>0</h3>
                            <p>Saved Guides</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>
                            <MessageCircle size={24} />
                        </div>
                        <div className="stat-info">
                            <h3>0</h3>
                            <p>Chat Sessions</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)' }}>
                            <TrendingUp size={24} />
                        </div>
                        <div className="stat-info">
                            <h3>Active</h3>
                            <p>Account Status</p>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="dashboard-section">
                    <h2>Quick Actions</h2>
                    <div className="quick-actions">
                        <Link to="/cv-builder" className="action-card">
                            <FileText size={32} />
                            <h3>Build CV</h3>
                            <p>Create or edit your professional CV</p>
                        </Link>

                        <Link to="/guide" className="action-card">
                            <BookOpen size={32} />
                            <h3>Browse Guides</h3>
                            <p>Learn about Finnish working life</p>
                        </Link>

                        <Link to="/assistant" className="action-card">
                            <MessageCircle size={32} />
                            <h3>Ask Assistant</h3>
                            <p>Get personalized career guidance</p>
                        </Link>
                    </div>
                </div>

                {/* Recent CVs */}
                <div className="dashboard-section">
                    <div className="section-header">
                        <h2>{t('dashboard.myCVs')}</h2>
                        <Link to="/cv-builder" className="btn btn-primary btn-sm">
                            View All
                        </Link>
                    </div>

                    {loading ? (
                        <p>Loading...</p>
                    ) : recentCVs.length === 0 ? (
                        <div className="empty-state-card">
                            <FileText size={48} />
                            <h3>No CVs yet</h3>
                            <p>Create your first professional CV to get started</p>
                            <Link to="/cv-builder" className="btn btn-primary">
                                Create CV
                            </Link>
                        </div>
                    ) : (
                        <div className="cv-grid">
                            {recentCVs.map((cv) => (
                                <Link to="/cv-builder" key={cv.id} className="cv-card">
                                    <div className="cv-card-icon">
                                        <FileText size={24} />
                                    </div>
                                    <div className="cv-card-info">
                                        <h4>{cv.title}</h4>
                                        <p>Updated {new Date(cv.updated_at).toLocaleDateString()}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Profile Section */}
                <div className="dashboard-section">
                    <h2>Profile Settings</h2>
                    <div className="profile-card">
                        <div className="profile-icon">
                            <User size={32} />
                        </div>
                        <div className="profile-info">
                            <h3>{user.user_metadata?.full_name || 'User'}</h3>
                            <p>{user.email}</p>
                            <p className="profile-meta">
                                Member since {new Date(user.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
