import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, authRedirect } from '../lib/supabase';

/** Sends users arriving from an email link to the right page. Renders nothing. */
export const AuthRedirectHandler: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        if (authRedirect.isRecovery) navigate('/reset-password', { replace: true });
        else if (authRedirect.hasError) navigate('/login?link=invalid', { replace: true });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY') navigate('/reset-password', { replace: true });
        });
        return () => subscription.unsubscribe();
    }, [navigate]);

    return null;
};
