-- WorkLife IQ Finland - Supabase Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    language_preference TEXT DEFAULT 'en',
    industry_focus TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" 
    ON profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
    ON profiles FOR UPDATE 
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
    ON profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- CV Versions table
CREATE TABLE IF NOT EXISTS cv_versions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    template TEXT DEFAULT 'modern',
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE cv_versions ENABLE ROW LEVEL SECURITY;

-- CV Versions policies
CREATE POLICY "Users can view own CVs" 
    ON cv_versions FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own CVs" 
    ON cv_versions FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own CVs" 
    ON cv_versions FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own CVs" 
    ON cv_versions FOR DELETE 
    USING (auth.uid() = user_id);

-- Chat Messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Chat Messages policies
CREATE POLICY "Users can view own messages" 
    ON chat_messages FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own messages" 
    ON chat_messages FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Saved Guide Sections table
CREATE TABLE IF NOT EXISTS saved_guide_sections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    section_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, section_id)
);

-- Enable RLS
ALTER TABLE saved_guide_sections ENABLE ROW LEVEL SECURITY;

-- Saved Guide Sections policies
CREATE POLICY "Users can view own saved sections" 
    ON saved_guide_sections FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can save sections" 
    ON saved_guide_sections FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete saved sections" 
    ON saved_guide_sections FOR DELETE 
    USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cv_versions_updated_at 
    BEFORE UPDATE ON cv_versions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Indexes for better performance
CREATE INDEX idx_cv_versions_user_id ON cv_versions(user_id);
CREATE INDEX idx_cv_versions_updated_at ON cv_versions(updated_at DESC);
CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX idx_saved_guide_sections_user_id ON saved_guide_sections(user_id);
