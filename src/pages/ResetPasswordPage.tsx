import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, Mail, Lock, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { supabase } from '../lib/supabase';
import './AuthPages.css';

const MIN_LENGTH = 8;

/**
 * Two modes on one page: signed in (e.g. after clicking a recovery email link)
 * → choose a new password; signed out → request a reset link by email.
 */
export const ResetPasswordPage: React.FC = () => {
    const { t } = useLanguage();
    const { user, loading } = useAuth();

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card">
                    {loading ? (
                        <p className="auth-muted">{t('common.loading')}</p>
                    ) : user ? (
                        <NewPasswordForm email={user.email ?? ''} />
                    ) : (
                        <RequestLinkForm />
                    )}
                    <div className="auth-footer">
                        <p>
                            <Link to="/login" className="auth-link">{t('auth.reset.backToLogin')}</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const NewPasswordForm: React.FC<{ email: string }> = ({ email }) => {
    const { t } = useLanguage();
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [done, setDone] = useState(false);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password.length < MIN_LENGTH) {
            setError(t('auth.reset.tooShort'));
            return;
        }
        if (password !== confirm) {
            setError(t('auth.reset.mismatch'));
            return;
        }
        setSaving(true);
        const { error: err } = await supabase.auth.updateUser({ password });
        setSaving(false);
        if (err) {
            setError(err.message);
            return;
        }
        setDone(true);
    };

    if (done) {
        return (
            <div className="auth-header">
                <div className="auth-icon"><CheckCircle size={32} /></div>
                <h1>{t('auth.reset.success')}</h1>
                <Link to="/dashboard" className="btn btn-primary btn-lg" style={{ marginTop: 'var(--space-lg)' }}>
                    {t('auth.reset.toDashboard')}
                </Link>
            </div>
        );
    }

    return (
        <>
            <div className="auth-header">
                <div className="auth-icon"><KeyRound size={32} /></div>
                <h1>{t('auth.reset.newTitle')}</h1>
                <p>{t('auth.reset.newSubtitle').replace('{email}', email)}</p>
            </div>
            {error && <div className="auth-error"><p>{error}</p></div>}
            <form onSubmit={submit} className="auth-form">
                <div className="form-group">
                    <label htmlFor="new-password" className="label"><Lock size={18} /> {t('auth.reset.newPassword')}</label>
                    <input
                        id="new-password"
                        type="password"
                        className="input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        minLength={MIN_LENGTH}
                        required
                        autoComplete="new-password"
                        aria-describedby="new-password-hint"
                    />
                    <small id="new-password-hint" className="auth-muted">{t('auth.reset.hint')}</small>
                </div>
                <div className="form-group">
                    <label htmlFor="confirm-password" className="label"><Lock size={18} /> {t('auth.reset.confirmPassword')}</label>
                    <input
                        id="confirm-password"
                        type="password"
                        className="input"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        required
                        autoComplete="new-password"
                    />
                </div>
                <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
                    {saving ? t('auth.reset.saving') : t('auth.reset.save')}
                </button>
            </form>
        </>
    );
};

const RequestLinkForm: React.FC = () => {
    const { t } = useLanguage();
    const [email, setEmail] = useState('');
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSending(true);
        const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
            redirectTo: `${window.location.origin}/reset-password`,
        });
        setSending(false);
        // Rate limits and delivery failures are real errors; an unknown address is not
        // reported by Supabase, so the success text never reveals whether an account exists.
        if (err) {
            setError(err.message);
            return;
        }
        setSent(true);
    };

    return (
        <>
            <div className="auth-header">
                <div className="auth-icon"><KeyRound size={32} /></div>
                <h1>{t('auth.reset.requestTitle')}</h1>
                <p>{t('auth.reset.requestSubtitle')}</p>
            </div>
            {error && <div className="auth-error"><p>{error}</p></div>}
            {sent ? (
                <div className="auth-success"><p>{t('auth.reset.linkSent')}</p></div>
            ) : (
                <form onSubmit={submit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="reset-email" className="label"><Mail size={18} /> {t('auth.reset.email')}</label>
                        <input
                            id="reset-email"
                            type="email"
                            className="input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />
                    </div>
                    <button type="submit" className="btn btn-primary btn-lg" disabled={sending}>
                        {sending ? t('auth.reset.sending') : t('auth.reset.sendLink')}
                    </button>
                </form>
            )}
        </>
    );
};
