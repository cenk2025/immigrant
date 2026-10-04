import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { MentorshipProfile, MentorshipMatch, MentorshipMessage } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import {
    Users, Star, Shield, MessageCircle, ChevronRight,
    X, Send, Check, AlertTriangle, ArrowLeft, Loader, HandshakeIcon, LogOut
} from 'lucide-react';
import './MentorshipPage.css';

// ─── Types ─────────────────────────────────────────────────────────────────────
type Step =
    | 'landing'
    | 'register-mentor'
    | 'register-mentee'
    | 'directory'
    | 'pending-request'
    | 'incoming-requests'
    | 'agreement'
    | 'chat';

const AREAS = [
    'Tech / IT', 'Healthcare', 'Engineering', 'Finance', 'Marketing',
    'Education', 'Law', 'Construction', 'Hospitality', 'Language Learning',
    'Networking', 'Finnish Culture', 'Work Permits & Visas', 'University Life',
    'Spouses & Family',
];

const PROFILE_COLUMNS = 'id, user_id, display_name, role, background, areas, is_available, agreed_to_terms, created_at';

type Role = 'mentor' | 'mentee';

const ROLE_KEY = 'mentorship-active-role';
const readStoredRole = (): string | null => {
    try { return localStorage.getItem(ROLE_KEY); } catch { return null; }
};
const storeRole = (role: Role) => {
    try { localStorage.setItem(ROLE_KEY, role); } catch { /* storage unavailable: role just won't be remembered */ }
};

interface MatchWithPartner {
    match: MentorshipMatch;
    partner: MentorshipProfile | null;
}

// ─── Finnish Mentorship Agreement ─────────────────────────────────────────────
const AGREEMENT_TEXT = `FINNISH MENTORSHIP AGREEMENT — CODE OF CONDUCT

This agreement governs the use of the Mentorship feature on Talent Factory Finland. By accepting, you commit to the following principles:

1. RESPECT & DIGNITY
   Both parties agree to treat one another with respect, regardless of nationality, background, gender, age, or religion.

2. CONFIDENTIALITY
   Personal information shared within the chat (including stories, struggles, and advice) must remain private and must not be shared with third parties.

3. ANONYMITY PROTECTION
   Both parties acknowledge that personal data (email address, full legal name, phone number) is never displayed or shared through this platform. Any voluntary disclosure of such information is done at the user's own risk.

4. PURPOSE OF MENTORSHIP
   The relationship is strictly professional and educational. Its goal is to support career integration, workplace culture adaptation, and personal development in Finland.

5. NO HARASSMENT OR DISCRIMINATION
   Any form of harassment, hate speech, or discriminatory language will result in immediate termination of the mentorship and account review.

6. VOLUNTARY PARTICIPATION
   Either party may end the mentorship at any time without requiring explanation. This can be done by contacting platform support.

7. LEGAL COMPLIANCE
   All communications must comply with Finnish law, GDPR, and the platform's Terms of Service.

8. GOOD FAITH
   Both parties enter this relationship in good faith, with the shared goal of supporting successful integration into Finnish working life.

By clicking "I Agree", you confirm that you have read, understood, and accept all terms of this agreement. Access to the private communication channel will not be granted until both parties have accepted.`;

// ─── Component ────────────────────────────────────────────────────────────────
export const MentorshipPage: React.FC = () => {
    const { user } = useAuth();
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const prevMessageCount = useRef(0);
    const stickToBottom = useRef(true);

    // Page step state machine
    const [step, setStep] = useState<Step>('landing');
    const [loading, setLoading] = useState(false);
    const [myProfile, setMyProfile] = useState<MentorshipProfile | null>(null);
    // The user's profile for the other role, if they take part as both mentor and mentee.
    const [otherProfile, setOtherProfile] = useState<MentorshipProfile | null>(null);
    const [menteeCurrent, setMenteeCurrent] = useState<MatchWithPartner | null>(null);
    const [mentors, setMentors] = useState<MentorshipProfile[]>([]);
    const [activeMatch, setActiveMatch] = useState<MentorshipMatch | null>(null);
    const [matchPartnerProfile, setMatchPartnerProfile] = useState<MentorshipProfile | null>(null);
    const [messages, setMessages] = useState<MentorshipMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [sendingMessage, setSendingMessage] = useState(false);
    const [agreementScrolled, setAgreementScrolled] = useState(false);
    const [incomingRequests, setIncomingRequests] = useState<MentorshipMatch[]>([]);
    const [incomingProfiles, setIncomingProfiles] = useState<Record<string, MentorshipProfile>>({});
    const [pastMatches, setPastMatches] = useState<MatchWithPartner[]>([]);
    const [activeMentees, setActiveMentees] = useState<MatchWithPartner[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Registration form state
    const [form, setForm] = useState({
        display_name: '',
        background: '',
        areas: [] as string[],
    });

    const loadMyProfile = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('mentorship_profiles')
            .select('*')
            .eq('user_id', user!.id)
            .order('created_at', { ascending: true });
        const profiles = (data as MentorshipProfile[] | null) ?? [];
        if (profiles.length > 0) {
            const active = profiles.find(p => p.role === readStoredRole()) ?? profiles[0];
            setMyProfile(active);
            setOtherProfile(profiles.find(p => p.role !== active.role) ?? null);
            await checkForMatch(active);
        }
        setLoading(false);
    };

    // Both roles land on a dashboard; conversations are opened from there.
    const checkForMatch = async (profile: MentorshipProfile) => {
        if (profile.role === 'mentor') {
            await loadMentorDashboard(profile);
            setStep('incoming-requests');
        } else {
            await loadMenteeHome();
            setStep('directory');
        }
    };

    const loadMenteeCurrent = async () => {
        if (!user) return;
        const { data } = await supabase
            .from('mentorship_matches')
            .select('*')
            .eq('mentee_id', user.id)
            .in('status', ['pending', 'active'])
            .order('created_at', { ascending: false })
            .limit(1);
        const match = ((data as MentorshipMatch[] | null) ?? [])[0];
        if (!match) {
            setMenteeCurrent(null);
            return;
        }
        const { data: partner } = await supabase
            .from('mentorship_profiles')
            .select(PROFILE_COLUMNS)
            .eq('user_id', match.mentor_id)
            .eq('role', 'mentor')
            .maybeSingle();
        // Keep the same object when nothing changed so the home poll doesn't restart itself.
        setMenteeCurrent(prev =>
            prev && prev.match.id === match.id && prev.match.status === match.status
                && prev.match.mentee_agreed === match.mentee_agreed && prev.match.mentor_agreed === match.mentor_agreed
                ? prev
                : { match, partner: (partner as MentorshipProfile | null) ?? null }
        );
    };

    const loadMenteeHome = async () => {
        await Promise.all([loadMenteeCurrent(), loadMentors(), loadPastMatches('mentee')]);
    };

    const loadMentors = async () => {
        const { data, error: err } = await supabase
            .from('mentorship_profiles')
            .select('id, user_id, display_name, role, background, areas, is_available, agreed_to_terms, created_at')
            .eq('role', 'mentor')
            .neq('is_available', false)   // allows true AND null (in case default wasn't set)
            .neq('user_id', user?.id ?? '');
        if (err) {
            console.error('loadMentors error:', err);
            setError('Could not load mentors: ' + err.message);
        }
        if (data) setMentors(data as MentorshipProfile[]);
    };

    const loadPastMatches = async (role: Role) => {
        if (!user) return;
        const myColumn = role === 'mentee' ? 'mentee_id' : 'mentor_id';
        const { data } = await supabase
            .from('mentorship_matches')
            .select('*')
            .eq(myColumn, user.id)
            .eq('status', 'ended')
            .order('ended_at', { ascending: false });
        const matches = (data as MentorshipMatch[] | null) ?? [];
        if (matches.length === 0) {
            setPastMatches([]);
            return;
        }
        const partnerOf = (m: MentorshipMatch) => (role === 'mentee' ? m.mentor_id : m.mentee_id);
        const { data: profiles } = await supabase
            .from('mentorship_profiles')
            .select(PROFILE_COLUMNS)
            .in('user_id', matches.map(partnerOf))
            .eq('role', role === 'mentee' ? 'mentor' : 'mentee');
        const byUser = new Map(((profiles as MentorshipProfile[] | null) ?? []).map(p => [p.user_id, p]));
        setPastMatches(matches.map(m => ({ match: m, partner: byUser.get(partnerOf(m)) ?? null })));
    };

    const loadActiveMentees = async () => {
        if (!user) return;
        const { data } = await supabase
            .from('mentorship_matches')
            .select('*')
            .eq('mentor_id', user.id)
            .eq('status', 'active')
            .order('created_at', { ascending: false });
        const matches = (data as MentorshipMatch[] | null) ?? [];
        if (matches.length === 0) {
            setActiveMentees([]);
            return;
        }
        const { data: profiles } = await supabase
            .from('mentorship_profiles')
            .select(PROFILE_COLUMNS)
            .in('user_id', matches.map(m => m.mentee_id))
            .eq('role', 'mentee');
        const byUser = new Map(((profiles as MentorshipProfile[] | null) ?? []).map(p => [p.user_id, p]));
        setActiveMentees(matches.map(m => ({ match: m, partner: byUser.get(m.mentee_id) ?? null })));
    };

    const loadMentorDashboard = async (profile: MentorshipProfile) => {
        await Promise.all([loadIncomingRequests(profile), loadActiveMentees(), loadPastMatches('mentor')]);
    };

    const loadIncomingRequests = async (profile: MentorshipProfile) => {
        if (profile.role !== 'mentor') return;
        const { data: reqs } = await supabase
            .from('mentorship_matches')
            .select('*')
            .eq('mentor_id', user!.id)
            .eq('status', 'pending');

        if (reqs && reqs.length > 0) {
            setIncomingRequests(reqs as MentorshipMatch[]);
            // Load mentee profiles
            const ids = reqs.map((r: MentorshipMatch) => r.mentee_id);
            const { data: profiles } = await supabase
                .from('mentorship_profiles')
                .select(PROFILE_COLUMNS)
                .in('user_id', ids)
                .eq('role', 'mentee');
            if (profiles) {
                const map: Record<string, MentorshipProfile> = {};
                (profiles as MentorshipProfile[]).forEach(p => { map[p.user_id] = p; });
                setIncomingProfiles(map);
            }
        } else {
            setIncomingRequests([]);
        }
    };

    const loadMessages = async () => {
        if (!activeMatch) return;
        const { data } = await supabase
            .from('mentorship_messages')
            .select('*')
            .eq('match_id', activeMatch.id)
            .order('created_at', { ascending: true });
        if (data) {
            const next = data as MentorshipMessage[];
            // Keep the same array when nothing changed so polling doesn't re-render the chat.
            setMessages(prev =>
                prev.length === next.length && prev[prev.length - 1]?.id === next[next.length - 1]?.id
                    ? prev
                    : next
            );
        }
    };

    // ── Initial Load ─────────────────────────────────────────────────────────
    useEffect(() => {
        if (user) loadMyProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    // ── Realtime chat subscription ────────────────────────────────────────────
    useEffect(() => {
        if (step !== 'chat' || !activeMatch) return;
        loadMessages();
        const channel = supabase
            .channel(`match-${activeMatch.id}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'mentorship_messages', filter: `match_id=eq.${activeMatch.id}` },
                (payload) => {
                    const incoming = payload.new as MentorshipMessage;
                    setMessages(prev => prev.some(m => m.id === incoming.id) ? prev : [...prev, incoming]);
                }
            )
            .subscribe();
        return () => { supabase.removeChannel(channel); };
        // loadMessages is intentionally omitted to avoid re-subscribing every render.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [step, activeMatch]);

    // ── Poll for mentee: detect when mentor accepts the request ───────────────
    useEffect(() => {
        if (step !== 'pending-request' || !activeMatch) return;
        const interval = setInterval(async () => {
            const { data } = await supabase
                .from('mentorship_matches')
                .select('*')
                .eq('id', activeMatch.id)
                .single();
            if (data) {
                const updated = data as MentorshipMatch;
                setActiveMatch(updated);
                if (updated.status === 'active') {
                    clearInterval(interval);
                    // Reload partner profile before going to agreement
                    const { data: partnerData } = await supabase
                        .from('mentorship_profiles')
                        .select(PROFILE_COLUMNS)
                        .eq('user_id', updated.mentor_id)
                        .eq('role', 'mentor')
                        .maybeSingle();
                    if (partnerData) setMatchPartnerProfile(partnerData as MentorshipProfile);
                    setStep('agreement');
                } else if (updated.status === 'rejected') {
                    clearInterval(interval);
                    setActiveMatch(null);
                    await loadMenteeHome();
                    setStep('directory');
                }
            }
        }, 4000);
        return () => clearInterval(interval);
        // loadMenteeHome is intentionally omitted to keep the poll interval stable.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [step, activeMatch]);

    // ── Poll for mentor: detect new incoming match requests ───────────────────
    useEffect(() => {
        if (step !== 'incoming-requests' || !myProfile) return;
        const interval = setInterval(async () => {
            await Promise.all([loadIncomingRequests(myProfile), loadActiveMentees()]);
        }, 5000);
        return () => clearInterval(interval);
        // loadIncomingRequests is intentionally omitted to keep the poll interval stable.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [step, myProfile]);

    // ── Poll for mentee: keep the "Your mentor" card current on the dashboard ─
    const menteeWaiting = !!menteeCurrent && !(menteeCurrent.match.mentee_agreed && menteeCurrent.match.mentor_agreed);
    useEffect(() => {
        if (step !== 'directory' || myProfile?.role !== 'mentee' || !menteeWaiting) return;
        const interval = setInterval(() => { loadMenteeCurrent(); }, 5000);
        return () => clearInterval(interval);
        // loadMenteeCurrent is intentionally omitted to keep the poll interval stable.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [step, myProfile, menteeWaiting]);

    // ── Poll for messages in chat (backup if realtime not configured) ─────────
    useEffect(() => {
        if (step !== 'chat' || !activeMatch || activeMatch.status === 'ended') return;
        const interval = setInterval(async () => {
            loadMessages();
            const { data } = await supabase
                .from('mentorship_matches')
                .select('*')
                .eq('id', activeMatch.id)
                .maybeSingle();
            if (data && (data as MentorshipMatch).status === 'ended') setActiveMatch(data as MentorshipMatch);
        }, 3000);
        return () => clearInterval(interval);
        // loadMessages is intentionally omitted to keep the poll interval stable.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [step, activeMatch]);

    // ── Poll while waiting for the other party to accept the agreement ───────
    useEffect(() => {
        if (step !== 'agreement' || !activeMatch || !myProfile) return;
        const myAgreed = myProfile.role === 'mentee' ? activeMatch.mentee_agreed : activeMatch.mentor_agreed;
        if (!myAgreed) return;
        const interval = setInterval(async () => {
            const { data } = await supabase
                .from('mentorship_matches')
                .select('*')
                .eq('id', activeMatch.id)
                .maybeSingle();
            if (!data) return;
            const updated = data as MentorshipMatch;
            if ((updated.mentee_agreed && updated.mentor_agreed) || updated.status === 'ended') {
                setActiveMatch(updated);
                setStep('chat');
            }
        }, 3000);
        return () => clearInterval(interval);
    }, [step, activeMatch, myProfile]);

    // Scroll only the chat box (never the window), and only when a new message arrives
    // while the user is already at the bottom or sent it themselves.
    useEffect(() => {
        const el = messagesContainerRef.current;
        const hasNew = messages.length > prevMessageCount.current;
        prevMessageCount.current = messages.length;
        if (!el || !hasNew) return;
        const last = messages[messages.length - 1];
        if (stickToBottom.current || last?.sender_id === user?.id) {
            el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
        }
    }, [messages, user]);

    // ── Actions ───────────────────────────────────────────────────────────────
    const handleRegister = async (role: 'mentor' | 'mentee') => {
        if (!user || !form.display_name.trim()) return;
        setError(null);
        setLoading(true);
        const { data, error: err } = await supabase
            .from('mentorship_profiles')
            .insert([{
                user_id: user.id,
                display_name: form.display_name.trim(),
                role,
                background: form.background.trim(),
                areas: form.areas,
                is_available: true,
                agreed_to_terms: false,
            }])
            .select()
            .single();

        if (err) {
            setError(err.message);
        } else {
            const profile = data as MentorshipProfile;
            if (myProfile && myProfile.role !== profile.role) setOtherProfile(myProfile);
            setMyProfile(profile);
            storeRole(profile.role);
            setForm({ display_name: '', background: '', areas: [] });
            await checkForMatch(profile);
        }
        setLoading(false);
    };

    const handleRequestMatch = async (mentor: MentorshipProfile) => {
        if (!user || !myProfile) return;
        setLoading(true);
        setError(null);
        const { data, error: err } = await supabase
            .from('mentorship_matches')
            .insert([{
                mentee_id: user.id,
                mentor_id: mentor.user_id,
                status: 'pending',
                mentee_agreed: false,
                mentor_agreed: false,
            }])
            .select()
            .single();

        if (err) {
            setError('Could not send request: ' + err.message);
        } else {
            setActiveMatch(data as MentorshipMatch);
            setMatchPartnerProfile(mentor);
            setMenteeCurrent({ match: data as MentorshipMatch, partner: mentor });
            setStep('pending-request');
        }
        setLoading(false);
    };

    const handleAcceptMatch = async (match: MentorshipMatch) => {
        setLoading(true);
        const { data, error: err } = await supabase
            .from('mentorship_matches')
            .update({ status: 'active' })
            .eq('id', match.id)
            .select()
            .single();

        if (!err && data) {
            setActiveMatch(data as MentorshipMatch);
            const menteeProfile = incomingProfiles[match.mentee_id];
            setMatchPartnerProfile(menteeProfile || null);
            setStep('agreement');
        }
        setLoading(false);
    };

    const handleRejectMatch = async (match: MentorshipMatch) => {
        await supabase
            .from('mentorship_matches')
            .update({ status: 'rejected' })
            .eq('id', match.id);
        await loadIncomingRequests(myProfile!);
    };

    const handleAgree = async () => {
        if (!user || !activeMatch || !myProfile) return;
        setLoading(true);
        const isMe = myProfile.role === 'mentee';
        const updateField = isMe ? 'mentee_agreed' : 'mentor_agreed';
        const { data, error: err } = await supabase
            .from('mentorship_matches')
            .update({ [updateField]: true })
            .eq('id', activeMatch.id)
            .select()
            .single();

        if (err) {
            setError(err.message);
        } else {
            const updated = data as MentorshipMatch;
            setActiveMatch(updated);
            if (updated.mentee_agreed && updated.mentor_agreed) {
                setStep('chat');
            } else {
                setError(null);
            }
        }
        setLoading(false);
    };

    const [chatError, setChatError] = useState<string | null>(null);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !activeMatch || !newMessage.trim()) return;
        setChatError(null);
        setSendingMessage(true);
        const text = newMessage.trim();
        setNewMessage(''); // optimistic clear
        const { error: sendErr } = await supabase.from('mentorship_messages').insert([{
            match_id: activeMatch.id,
            sender_id: user.id,
            content: text,
        }]);
        if (sendErr) {
            setChatError('Message failed: ' + sendErr.message);
            setNewMessage(text); // restore on failure
        } else {
            // Reload as backup in case realtime doesn't fire
            await loadMessages();
        }
        setSendingMessage(false);
    };

    const resetConversation = () => {
        setActiveMatch(null);
        setMatchPartnerProfile(null);
        setMessages([]);
        setNewMessage('');
        setChatError(null);
        setError(null);
        stickToBottom.current = true;
    };

    const returnToList = async () => {
        if (!myProfile) return;
        resetConversation();
        await checkForMatch(myProfile);
    };

    const switchRole = async () => {
        if (!myProfile || !otherProfile) return;
        const next = otherProfile;
        resetConversation();
        setOtherProfile(myProfile);
        setMyProfile(next);
        storeRole(next.role);
        setLoading(true);
        await checkForMatch(next);
        setLoading(false);
    };

    const addOtherRole = () => {
        if (!myProfile) return;
        setError(null);
        setForm({ display_name: '', background: '', areas: [] });
        setStep(myProfile.role === 'mentor' ? 'register-mentee' : 'register-mentor');
    };

    const handleEndMatch = async () => {
        if (!user || !activeMatch) return;
        const ok = window.confirm(
            'End this mentorship?\n\nThe chat will close for both of you. You can still read the conversation under "Past mentorships", and both of you can start a new match.'
        );
        if (!ok) return;
        const { error: err } = await supabase
            .from('mentorship_matches')
            .update({ status: 'ended', ended_at: new Date().toISOString(), ended_by: user.id })
            .eq('id', activeMatch.id);
        if (err) {
            setChatError('Could not end the mentorship: ' + err.message);
            return;
        }
        await returnToList();
    };

    const openMatch = ({ match, partner }: MatchWithPartner) => {
        stickToBottom.current = true;
        setMessages([]);
        setChatError(null);
        setAgreementScrolled(false);
        setActiveMatch(match);
        setMatchPartnerProfile(partner);
        if (match.status === 'pending') setStep('pending-request');
        else if (match.status === 'active' && !(match.mentee_agreed && match.mentor_agreed)) setStep('agreement');
        else setStep('chat');
    };

    const toggleArea = (area: string) => {
        setForm(f => ({
            ...f,
            areas: f.areas.includes(area)
                ? f.areas.filter(a => a !== area)
                : [...f.areas, area],
        }));
    };

    // ── Render helpers ────────────────────────────────────────────────────────
    const renderProfileForm = (role: 'mentor' | 'mentee') => (
        <div className="mp-form-container animate-fade-in">
            <button className="mp-back-btn" onClick={() => (myProfile ? returnToList() : setStep('landing'))}>
                <ArrowLeft size={18} /> Back
            </button>
            <div className="mp-form-card">
                <div className={`mp-form-icon ${role}`}>
                    {role === 'mentor' ? <Star size={32} /> : <Users size={32} />}
                </div>
                <h2>{role === 'mentor' ? 'Create Your Mentor Profile' : 'Find Your Mentor'}</h2>
                <p className="mp-form-subtitle">
                    {role === 'mentor'
                        ? 'Share your expertise to help immigrants start their Finnish journey'
                        : 'Tell us about yourself so we can find the right mentor for you'}
                </p>

                {error && <div className="mp-error"><AlertTriangle size={16} /> {error}</div>}

                <form onSubmit={(e) => { e.preventDefault(); handleRegister(role); }}>
                    <div className="mp-field">
                        <label>Display Name <span className="mp-required">*</span></label>
                        <p className="mp-field-hint">This is the only name others will see — keep it private if you wish</p>
                        <input
                            className="mp-input"
                            type="text"
                            required
                            value={form.display_name}
                            onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))}
                            placeholder={role === 'mentor' ? 'e.g. Alex M. or TechMentor42' : 'e.g. NewToHelsinki'}
                        />
                    </div>

                    <div className="mp-field">
                        <label>Background</label>
                        <p className="mp-field-hint">A brief, anonymous description of your situation or expertise</p>
                        <textarea
                            className="mp-input"
                            rows={3}
                            value={form.background}
                            onChange={e => setForm(f => ({ ...f, background: e.target.value }))}
                            placeholder={role === 'mentor'
                                ? 'e.g. Software engineer from India, 5 years in Helsinki. Happy to share my experience.'
                                : 'e.g. Recently arrived in Tampere, looking for career advice in tech.'}
                        />
                    </div>

                    <div className="mp-field">
                        <label>Areas of {role === 'mentor' ? 'Expertise' : 'Interest'}</label>
                        <div className="mp-areas">
                            {AREAS.map(area => (
                                <button
                                    key={area}
                                    type="button"
                                    className={`mp-area-tag ${form.areas.includes(area) ? 'selected' : ''}`}
                                    onClick={() => toggleArea(area)}
                                >
                                    {form.areas.includes(area) && <Check size={12} />}
                                    {area}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mp-privacy-notice">
                        <Shield size={16} />
                        <span>Your email, real name, and personal data are <strong>never shared</strong> with other users.</span>
                    </div>

                    <button type="submit" className="btn btn-primary btn-lg mp-submit-btn" disabled={loading}>
                        {loading ? <Loader size={18} className="spin" /> : <ChevronRight size={18} />}
                        {loading ? 'Saving...' : role === 'mentor' ? 'Publish My Profile' : 'Browse Mentors'}
                    </button>
                </form>
            </div>
        </div>
    );

    const renderRoleBar = () => {
        if (!myProfile) return null;
        return (
            <div className="mp-role-bar">
                <span className="mp-role-name">
                    {myProfile.role === 'mentor' ? '⭐' : '🎓'} <strong>{myProfile.display_name}</strong>
                </span>
                {otherProfile ? (
                    <div className="mp-role-switch" role="group" aria-label="Choose your role">
                        {(['mentee', 'mentor'] as Role[]).map(r => (
                            <button
                                key={r}
                                type="button"
                                className={myProfile.role === r ? 'active' : ''}
                                aria-pressed={myProfile.role === r}
                                onClick={myProfile.role === r ? undefined : switchRole}
                                disabled={loading}
                            >
                                {r === 'mentee' ? '🎓 As mentee' : '⭐ As mentor'}
                            </button>
                        ))}
                    </div>
                ) : (
                    <button type="button" className="btn btn-secondary btn-sm" onClick={addOtherRole}>
                        {myProfile.role === 'mentee' ? '⭐ Also become a mentor' : '🎓 Also find a mentor for yourself'}
                    </button>
                )}
            </div>
        );
    };

    const renderCurrentMentor = () => {
        if (!menteeCurrent) return null;
        const { match, partner } = menteeCurrent;
        const name = partner?.display_name ?? 'Your mentor';
        const chatOpen = match.status === 'active' && match.mentee_agreed && match.mentor_agreed;
        const status = match.status === 'pending'
            ? 'Request sent — waiting for the mentor to accept'
            : chatOpen
                ? 'Chat open'
                : match.mentee_agreed
                    ? 'Waiting for the mentor to accept the agreement'
                    : 'Accept the agreement to start chatting';
        const action = match.status === 'pending' ? 'View request' : chatOpen ? 'Open chat' : 'Review agreement';
        return (
            <div className="mp-mentees">
                <h3 className="mp-subheading">Your mentor</h3>
                <div className="mp-request-card">
                    <div className="mp-mentor-avatar small">{name.charAt(0).toUpperCase()}</div>
                    <div className="mp-request-info">
                        <h3>{name}</h3>
                        <p>{status}</p>
                    </div>
                    <div className="mp-request-actions">
                        <button className="btn btn-primary btn-sm" onClick={() => openMatch(menteeCurrent)}>
                            {chatOpen ? <MessageCircle size={16} /> : <Shield size={16} />} {action}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderDirectory = () => (
        <div className="mp-directory animate-fade-in">
            {renderRoleBar()}
            {renderCurrentMentor()}
            <div className="mp-section-header">
                <h2>Available Mentors</h2>
                <p>
                    {menteeCurrent
                        ? 'You can work with one mentor at a time. End your current mentorship to request a new one.'
                        : 'Click "Request Match" to connect. Your email and real name will never be shared.'}
                </p>
                <button
                    className="btn btn-secondary btn-sm mp-refresh-btn"
                    onClick={loadMentors}
                    disabled={loading}
                >
                    {loading ? <Loader size={14} className="spin" /> : '↻'} Refresh
                </button>
            </div>
            {error && <div className="mp-error"><AlertTriangle size={16} /> {error}</div>}
            {mentors.length === 0 ? (
                <div className="mp-empty">
                    <Users size={48} />
                    <h3>No mentors available yet</h3>
                    <p>Check back soon — mentors are joining every day!</p>
                </div>
            ) : (
                <div className="mp-mentor-grid">
                    {mentors.map(mentor => (
                        <div key={mentor.id} className="mp-mentor-card">
                            <div className="mp-mentor-avatar">
                                {mentor.display_name.charAt(0).toUpperCase()}
                            </div>
                            <div className="mp-mentor-info">
                                <h3 className="mp-mentor-name">{mentor.display_name}</h3>
                                {mentor.background && (
                                    <p className="mp-mentor-bio">{mentor.background}</p>
                                )}
                                {mentor.areas && mentor.areas.length > 0 && (
                                    <div className="mp-mentor-areas">
                                        {mentor.areas.slice(0, 3).map(a => (
                                            <span key={a} className="mp-area-pill">{a}</span>
                                        ))}
                                        {mentor.areas.length > 3 && (
                                            <span className="mp-area-pill muted">+{mentor.areas.length - 3}</span>
                                        )}
                                    </div>
                                )}
                            </div>
                            <button
                                className="btn btn-primary mp-request-btn"
                                onClick={() => handleRequestMatch(mentor)}
                                disabled={loading || !!menteeCurrent}
                            >
                                {loading ? <Loader size={16} className="spin" /> : <HandshakeIcon size={16} />}
                                Request Match
                            </button>
                        </div>
                    ))}
                </div>
            )}
            {renderPastMatches()}
        </div>
    );

    const renderActiveMentees = () => {
        if (activeMentees.length === 0) return null;
        return (
            <div className="mp-mentees">
                <h3 className="mp-subheading">Your mentees ({activeMentees.length})</h3>
                <div className="mp-request-list">
                    {activeMentees.map(item => {
                        const name = item.partner?.display_name ?? 'Mentee';
                        const { mentee_agreed, mentor_agreed } = item.match;
                        const chatOpen = mentee_agreed && mentor_agreed;
                        const status = chatOpen
                            ? 'Chat open'
                            : mentor_agreed
                                ? 'Waiting for mentee to accept agreement'
                                : 'Accept the agreement to start';
                        return (
                            <div key={item.match.id} className="mp-request-card">
                                <div className="mp-mentor-avatar small">{name.charAt(0).toUpperCase()}</div>
                                <div className="mp-request-info">
                                    <h3>{name}</h3>
                                    <p>{status}</p>
                                </div>
                                <div className="mp-request-actions">
                                    <button className="btn btn-primary btn-sm" onClick={() => openMatch(item)}>
                                        {chatOpen ? <><MessageCircle size={16} /> Open chat</> : <><Shield size={16} /> {mentor_agreed ? 'View status' : 'Review agreement'}</>}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderPastMatches = () => {
        if (pastMatches.length === 0) return null;
        return (
            <div className="mp-past">
                <h3 className="mp-subheading">Past mentorships</h3>
                <div className="mp-request-list">
                    {pastMatches.map(past => {
                        const name = past.partner?.display_name ?? 'Former partner';
                        return (
                            <div key={past.match.id} className="mp-request-card">
                                <div className="mp-mentor-avatar small">{name.charAt(0).toUpperCase()}</div>
                                <div className="mp-request-info">
                                    <h3>{name}</h3>
                                    {past.match.ended_at && (
                                        <p>Ended {new Date(past.match.ended_at).toLocaleDateString()}</p>
                                    )}
                                </div>
                                <div className="mp-request-actions">
                                    <button className="btn btn-secondary btn-sm" onClick={() => openMatch(past)}>
                                        <MessageCircle size={16} /> View conversation
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderPendingRequest = () => (
        <div className="mp-status-card animate-fade-in">
            <div className="mp-status-icon pending">
                <Loader size={40} className="spin" />
            </div>
            <h2>Match Request Sent!</h2>
            <p>
                Your request has been sent to <strong>{matchPartnerProfile?.display_name ?? 'the mentor'}</strong>.
                <br />Waiting for them to accept... This page will update automatically.
            </p>
            <div className="mp-status-note">
                <Shield size={16} />
                <span>No personal information has been shared.</span>
            </div>
            <p className="mp-polling-hint">🔴 Checking for updates every 4 seconds...</p>
            <button type="button" className="btn btn-secondary" onClick={returnToList}>
                <ArrowLeft size={16} /> Back to dashboard
            </button>
        </div>
    );

    const renderIncomingRequests = () => (
        <div className="mp-incoming animate-fade-in">
            {renderRoleBar()}
            <div className="mp-section-header">
                <h2>Your Mentor Dashboard</h2>
                <p>Mentees who want to connect with you. Accept to open the agreement process.</p>
                <div className="mp-incoming-meta">
                    <span className="mp-polling-badge">🔴 Live — checking every 5s</span>
                    <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => myProfile && loadIncomingRequests(myProfile)}
                    >
                        ↻ Refresh
                    </button>
                </div>
            </div>
            {renderActiveMentees()}
            <h3 className="mp-subheading">Incoming requests</h3>
            {incomingRequests.length === 0 ? (
                <div className="mp-empty">
                    <Star size={48} />
                    <h3>No requests yet</h3>
                    <p>Your profile is live! Mentees are browsing and will reach out soon.</p>
                </div>
            ) : (
                <div className="mp-request-list">
                    {incomingRequests.map(req => {
                        const mentee = incomingProfiles[req.mentee_id];
                        return (
                            <div key={req.id} className="mp-request-card">
                                <div className="mp-mentor-avatar small">
                                    {mentee ? mentee.display_name.charAt(0).toUpperCase() : '?'}
                                </div>
                                <div className="mp-request-info">
                                    <h3>{mentee?.display_name ?? 'Anonymous Mentee'}</h3>
                                    {mentee?.background && <p>{mentee.background}</p>}
                                    {mentee?.areas && mentee.areas.length > 0 && (
                                        <div className="mp-mentor-areas">
                                            {mentee.areas.slice(0, 3).map(a => (
                                                <span key={a} className="mp-area-pill">{a}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="mp-request-actions">
                                    <button
                                        className="btn btn-primary btn-sm"
                                        onClick={() => handleAcceptMatch(req)}
                                        disabled={loading}
                                    >
                                        <Check size={16} /> Accept
                                    </button>
                                    <button
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => handleRejectMatch(req)}
                                    >
                                        <X size={16} /> Decline
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            {renderPastMatches()}
        </div>
    );

    const renderAgreement = () => {
        const myAgreed = myProfile?.role === 'mentee'
            ? activeMatch?.mentee_agreed
            : activeMatch?.mentor_agreed;
        const partnerAgreed = myProfile?.role === 'mentee'
            ? activeMatch?.mentor_agreed
            : activeMatch?.mentee_agreed;

        return (
            <div className="mp-agreement-overlay animate-fade-in">
                <div className="mp-agreement-modal">
                    <div className="mp-agreement-header">
                        <Shield size={28} />
                        <h2>Finnish Mentorship Agreement</h2>
                        <p>Both parties must read and accept before the chat is unlocked.</p>
                    </div>

                    <div
                        className="mp-agreement-body"
                        onScroll={(e) => {
                            const el = e.currentTarget;
                            if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20) {
                                setAgreementScrolled(true);
                            }
                        }}
                    >
                        <pre className="mp-agreement-text">{AGREEMENT_TEXT}</pre>
                    </div>

                    {!agreementScrolled && (
                        <p className="mp-scroll-hint">↓ Scroll down to read the full agreement before accepting</p>
                    )}

                    <div className="mp-agreement-status">
                        <div className={`mp-party-status ${myAgreed ? 'agreed' : ''}`}>
                            {myAgreed ? <Check size={16} /> : <AlertTriangle size={16} />}
                            You: {myAgreed ? 'Agreed ✓' : 'Pending'}
                        </div>
                        <div className={`mp-party-status ${partnerAgreed ? 'agreed' : ''}`}>
                            {partnerAgreed ? <Check size={16} /> : <Loader size={16} className="spin" />}
                            {matchPartnerProfile?.display_name ?? 'Partner'}: {partnerAgreed ? 'Agreed ✓' : 'Waiting...'}
                        </div>
                    </div>

                    {!myAgreed && (
                        <button
                            className="btn btn-primary btn-lg mp-agree-btn"
                            onClick={handleAgree}
                            disabled={!agreementScrolled || loading}
                        >
                            {loading ? <Loader size={18} className="spin" /> : <Shield size={18} />}
                            I Have Read and Agree to the Terms
                        </button>
                    )}

                    {myAgreed && !partnerAgreed && (
                        <div className="mp-waiting-partner">
                            <Loader size={20} className="spin" />
                            <span>Waiting for <strong>{matchPartnerProfile?.display_name ?? 'your partner'}</strong> to accept...</span>
                        </div>
                    )}

                    <button type="button" className="btn btn-secondary mp-agreement-back" onClick={returnToList}>
                        <ArrowLeft size={16} /> Back to dashboard
                    </button>
                </div>
            </div>
        );
    };

    const renderChat = () => {
        const partnerName = matchPartnerProfile?.display_name ?? 'Partner';
        const isEnded = activeMatch?.status === 'ended';
        const endedByMe = isEnded && activeMatch?.ended_by === user?.id;
        const endedOn = activeMatch?.ended_at ? new Date(activeMatch.ended_at).toLocaleDateString() : null;
        return (
            <div className="mp-chat-container animate-fade-in">
                <div className="mp-chat-header">
                    <div className="mp-chat-avatar">{partnerName.charAt(0).toUpperCase()}</div>
                    <div>
                        <h3>{partnerName}</h3>
                        <span className="mp-chat-role">{matchPartnerProfile?.role === 'mentor' ? '⭐ Mentor' : '🎓 Mentee'}</span>
                    </div>
                    <div className="mp-chat-header-actions">
                        {isEnded ? (
                            <span className="mp-chat-ended-badge">Ended</span>
                        ) : (
                            <div className="mp-chat-shield">
                                <Shield size={16} />
                                <span>Anonymous & Encrypted</span>
                            </div>
                        )}
                        {isEnded ? (
                            <button type="button" className="mp-chat-header-btn" onClick={returnToList}>
                                <ArrowLeft size={14} /> Back
                            </button>
                        ) : (
                            <>
                                <button type="button" className="mp-chat-header-btn" onClick={returnToList}>
                                    <ArrowLeft size={14} /> Dashboard
                                </button>
                                <button type="button" className="mp-chat-header-btn" onClick={handleEndMatch}>
                                    <LogOut size={14} /> End mentorship
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div
                    className="mp-chat-messages"
                    ref={messagesContainerRef}
                    onScroll={(e) => {
                        const el = e.currentTarget;
                        stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
                    }}
                >
                    {messages.length === 0 && (
                        <div className="mp-chat-empty">
                            <MessageCircle size={48} />
                            <p>
                                {isEnded
                                    ? 'No messages were exchanged in this mentorship.'
                                    : <>Your private mentorship chat is ready.<br />Say hello! 👋</>}
                            </p>
                        </div>
                    )}
                    {messages.map(msg => {
                        const isMe = msg.sender_id === user?.id;
                        const senderName = isMe ? (myProfile?.display_name ?? 'You') : partnerName;
                        return (
                            <div key={msg.id} className={`mp-bubble-row ${isMe ? 'me' : 'them'}`}>
                                {!isMe && (
                                    <div className="mp-bubble-avatar">{senderName.charAt(0).toUpperCase()}</div>
                                )}
                                <div className={`mp-bubble ${isMe ? 'me' : 'them'}`}>
                                    <span className="mp-bubble-sender">{senderName}</span>
                                    <p>{msg.content}</p>
                                    <span className="mp-bubble-time">
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {isEnded ? (
                    <div className="mp-chat-input-area mp-chat-ended">
                        <p>
                            {endedByMe ? 'You ended this mentorship' : `${partnerName} ended this mentorship`}
                            {endedOn ? ` on ${endedOn}` : ''}. The conversation is kept read-only.
                        </p>
                        <button type="button" className="btn btn-primary btn-sm" onClick={returnToList}>
                            Back to dashboard
                        </button>
                    </div>
                ) : (
                <form className="mp-chat-input-area" onSubmit={handleSendMessage}>
                    {chatError && (
                        <div className="mp-chat-error">
                            <AlertTriangle size={14} /> {chatError}
                        </div>
                    )}
                    <div className="mp-chat-input-row">
                        <input
                            className="mp-chat-input"
                            type="text"
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            placeholder="Type a message... (only display names are shared)"
                            disabled={sendingMessage}
                        />
                        <button
                            type="submit"
                            className="btn btn-primary mp-send-btn"
                            disabled={!newMessage.trim() || sendingMessage}
                        >
                            {sendingMessage ? <Loader size={18} className="spin" /> : <Send size={18} />}
                        </button>
                    </div>
                </form>
                )}
            </div>
        );
    };

    // ── Main render ───────────────────────────────────────────────────────────
    return (
        <div className="mp-page">
            {/* Hero */}
            <div className="mp-hero">
                <div className="mp-hero-bg" />
                <div className="container mp-hero-content">
                    <div className="mp-hero-badge">
                        <Shield size={14} /> Privacy-First Mentorship
                    </div>
                    <h1>Mentorship for Immigrants & International Students in Finland</h1>
                    <p>
                        Connect with experienced peers who have walked the same path.
                        Every conversation is anonymous, private, and protected by the Finnish Mentorship Agreement.
                    </p>
                </div>
            </div>

            <div className="container mp-main">
                {/* Not logged in */}
                {!user && (
                    <div className="mp-auth-wall animate-fade-in">
                        <Shield size={56} />
                        <h2>Sign in to Access Mentorship</h2>
                        <p>To protect everyone's privacy and safety, you need a free account to use this feature.</p>
                        <div className="mp-auth-btns">
                            <Link to="/login" className="btn btn-primary btn-lg">Log In</Link>
                            <Link to="/signup" className="btn btn-secondary btn-lg">Create Account</Link>
                        </div>
                    </div>
                )}

                {/* Loading */}
                {user && loading && step === 'landing' && (
                    <div className="mp-loading">
                        <div className="spinner" />
                        <p>Loading your profile...</p>
                    </div>
                )}

                {/* Landing — no profile yet */}
                {user && !loading && step === 'landing' && !myProfile && (
                    <div className="mp-landing animate-fade-in">
                        <h2>How would you like to participate?</h2>
                        <p>Choose a role to get started. You can take part as a mentor, a mentee, or both.</p>
                        <div className="mp-role-cards">
                            <div className="mp-role-card mentor" onClick={() => setStep('register-mentor')}>
                                <div className="mp-role-icon">⭐</div>
                                <h3>Become a Mentor</h3>
                                <p>Share your experience with someone who is just starting out in Finland. Give back and build your leadership skills.</p>
                                <span className="mp-role-cta">Get Started <ChevronRight size={16} /></span>
                            </div>
                            <div className="mp-role-card mentee" onClick={() => setStep('register-mentee')}>
                                <div className="mp-role-icon">🎓</div>
                                <h3>Find a Mentor</h3>
                                <p>Get guidance from someone who has already navigated Finnish work culture, permits, and integration.</p>
                                <span className="mp-role-cta">Browse Mentors <ChevronRight size={16} /></span>
                            </div>
                        </div>

                        <div className="mp-features">
                            <div className="mp-feature">
                                <Shield size={24} />
                                <h4>100% Anonymous</h4>
                                <p>Only display names are visible. Emails and real names stay hidden.</p>
                            </div>
                            <div className="mp-feature">
                                <MessageCircle size={24} />
                                <h4>Private Chat</h4>
                                <p>Every conversation happens in a sealed, private room.</p>
                            </div>
                            <div className="mp-feature">
                                <CheckIcon />
                                <h4>Legal Agreement</h4>
                                <p>Both parties sign the Finnish Mentorship Code of Conduct before chatting.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Profile Registration Forms */}
                {user && step === 'register-mentor' && renderProfileForm('mentor')}
                {user && step === 'register-mentee' && renderProfileForm('mentee')}

                {/* Directory */}
                {user && step === 'directory' && renderDirectory()}

                {/* Pending */}
                {user && step === 'pending-request' && renderPendingRequest()}

                {/* Incoming (mentor) */}
                {user && step === 'incoming-requests' && renderIncomingRequests()}

                {/* Agreement */}
                {user && step === 'agreement' && renderAgreement()}

                {/* Chat */}
                {user && step === 'chat' && renderChat()}
            </div>
        </div>
    );
};

// Small inline icon helper
const CheckIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);
