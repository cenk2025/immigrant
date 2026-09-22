-- ============================================================
-- WorkLife IQ Finland — RLS Security Fix (idempotent)
-- Run this in: Supabase Dashboard → SQL Editor
-- Safe to run multiple times — drops existing policies first
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. COMMUNITY POSTS
-- ─────────────────────────────────────────────────────────────
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view community posts" ON community_posts;
DROP POLICY IF EXISTS "Authenticated users can create posts" ON community_posts;
DROP POLICY IF EXISTS "Authors can update own posts" ON community_posts;
DROP POLICY IF EXISTS "Authors can delete own posts" ON community_posts;

CREATE POLICY "Anyone can view community posts"
    ON community_posts FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create posts"
    ON community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authors can update own posts"
    ON community_posts FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Authors can delete own posts"
    ON community_posts FOR DELETE USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- 2. COMMUNITY COMMENTS
-- ─────────────────────────────────────────────────────────────
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view community comments" ON community_comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON community_comments;
DROP POLICY IF EXISTS "Authors can delete own comments" ON community_comments;

CREATE POLICY "Anyone can view community comments"
    ON community_comments FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments"
    ON community_comments FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authors can delete own comments"
    ON community_comments FOR DELETE USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- 3. MENTORSHIP PROFILES
-- ─────────────────────────────────────────────────────────────
ALTER TABLE mentorship_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view mentorship profiles" ON mentorship_profiles;
DROP POLICY IF EXISTS "Users can create own mentorship profile" ON mentorship_profiles;
DROP POLICY IF EXISTS "Users can update own mentorship profile" ON mentorship_profiles;
DROP POLICY IF EXISTS "Users can delete own mentorship profile" ON mentorship_profiles;

CREATE POLICY "Authenticated users can view mentorship profiles"
    ON mentorship_profiles FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create own mentorship profile"
    ON mentorship_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mentorship profile"
    ON mentorship_profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own mentorship profile"
    ON mentorship_profiles FOR DELETE USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- 4. MENTORSHIP MATCHES
-- ─────────────────────────────────────────────────────────────
ALTER TABLE mentorship_matches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Match participants can view their matches" ON mentorship_matches;
DROP POLICY IF EXISTS "Mentees can create match requests" ON mentorship_matches;
DROP POLICY IF EXISTS "Match participants can update their matches" ON mentorship_matches;

CREATE POLICY "Match participants can view their matches"
    ON mentorship_matches FOR SELECT
    USING (auth.uid() = mentor_id OR auth.uid() = mentee_id);

CREATE POLICY "Mentees can create match requests"
    ON mentorship_matches FOR INSERT
    WITH CHECK (auth.uid() = mentee_id);

CREATE POLICY "Match participants can update their matches"
    ON mentorship_matches FOR UPDATE
    USING (auth.uid() = mentor_id OR auth.uid() = mentee_id);

-- ─────────────────────────────────────────────────────────────
-- 5. MENTORSHIP MESSAGES
-- ─────────────────────────────────────────────────────────────
ALTER TABLE mentorship_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Match participants can view messages" ON mentorship_messages;
DROP POLICY IF EXISTS "Match participants can send messages" ON mentorship_messages;

CREATE POLICY "Match participants can view messages"
    ON mentorship_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM mentorship_matches
            WHERE mentorship_matches.id = mentorship_messages.match_id
            AND (mentorship_matches.mentor_id = auth.uid() OR mentorship_matches.mentee_id = auth.uid())
        )
    );

CREATE POLICY "Match participants can send messages"
    ON mentorship_messages FOR INSERT
    WITH CHECK (
        auth.uid() = sender_id
        AND EXISTS (
            SELECT 1 FROM mentorship_matches
            WHERE mentorship_matches.id = mentorship_messages.match_id
            AND (mentorship_matches.mentor_id = auth.uid() OR mentorship_matches.mentee_id = auth.uid())
            AND mentorship_matches.mentee_agreed = true
            AND mentorship_matches.mentor_agreed = true
        )
    );

-- ============================================================
-- Done! All 5 tables are now protected with RLS.
-- ============================================================
