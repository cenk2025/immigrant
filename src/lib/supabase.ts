import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface UserProfile {
    id: string;
    email: string;
    full_name?: string;
    created_at: string;
    updated_at: string;
    language_preference: 'en' | 'fi';
    industry_focus?: string;
}

export interface CVVersion {
    id: string;
    user_id: string;
    title: string;
    template: string;
    data: CVData;
    created_at: string;
    updated_at: string;
}

export interface CVData {
    profile: {
        full_name: string;
        email: string;
        phone?: string;
        location?: string;
        photo_url?: string;
        summary?: string;
    };
    experience: WorkExperience[];
    education: Education[];
    skills: string[];
    languages: LanguageSkill[];
    certifications: Certification[];
}

export interface WorkExperience {
    id: string;
    title: string;
    company: string;
    location?: string;
    start_date: string;
    end_date?: string;
    current: boolean;
    description: string;
}

export interface Education {
    id: string;
    degree: string;
    institution: string;
    location?: string;
    start_date: string;
    end_date?: string;
    current: boolean;
    description?: string;
}

export interface LanguageSkill {
    id: string;
    language: string;
    proficiency: 'Native' | 'Fluent' | 'Advanced' | 'Intermediate' | 'Basic';
}

export interface Certification {
    id: string;
    name: string;
    issuer: string;
    date: string;
    expiry_date?: string;
    credential_id?: string;
}

export interface ChatMessage {
    id: string;
    user_id: string;
    role: 'user' | 'assistant';
    content: string;
    created_at: string;
}

export interface SavedGuideSection {
    id: string;
    user_id: string;
    section_id: string;
    created_at: string;
}

export interface CommunityPost {
    id: string;
    user_id: string;
    title: string;
    content: string;
    category: 'Work Culture' | 'Visa Process' | 'Daily Life' | 'Education' | 'Other';
    likes: number;
    created_at: string;
    user_metadata?: {
        full_name: string;
    };
    author_name: string;
}
