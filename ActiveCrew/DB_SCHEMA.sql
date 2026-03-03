-- ============================================================
-- RiverCrew — Production PostgreSQL Schema
-- ============================================================
-- Designed for: Postgres 15+ with pgcrypto extension
-- Run: CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name      VARCHAR(50) NOT NULL,
    age             INTEGER CHECK (age >= 18 AND age <= 99),
    email           VARCHAR(255) UNIQUE,
    phone           VARCHAR(20) UNIQUE,
    neighborhood    VARCHAR(100),
    bio             TEXT,
    photos          TEXT[] DEFAULT '{}',
    show_up_rate    DECIMAL(3,2) DEFAULT 1.00 CHECK (show_up_rate >= 0 AND show_up_rate <= 1),
    total_plans     INTEGER DEFAULT 0,
    verified        BOOLEAN DEFAULT FALSE,
    is_admin        BOOLEAN DEFAULT FALSE,
    daily_preview_count INTEGER DEFAULT 0,
    daily_preview_reset TIMESTAMP WITH TIME ZONE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_neighborhood ON users(neighborhood);

-- ============================================================
-- PREFERENCES
-- ============================================================
CREATE TABLE preferences (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mode            VARCHAR(10) NOT NULL CHECK (mode IN ('friends', 'dating', 'both')),
    interests       TEXT[] DEFAULT '{}',
    skill_level     VARCHAR(20) CHECK (skill_level IN ('Beginner', 'Intermediate', 'Advanced')),
    radius_miles    INTEGER DEFAULT 5 CHECK (radius_miles >= 1 AND radius_miles <= 50),
    gender_preference VARCHAR(20),
    same_gender_only BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Availability stored as JSONB for flexibility:
-- [{"day": "Monday", "windows": [{"start": "07:00", "end": "09:00"}]}]
ALTER TABLE preferences ADD COLUMN availability JSONB DEFAULT '[]';

CREATE INDEX idx_preferences_user ON preferences(user_id);
CREATE INDEX idx_preferences_mode ON preferences(mode);
CREATE INDEX idx_preferences_interests ON preferences USING GIN(interests);

-- ============================================================
-- PLAN CARDS (Activity templates that users swipe on)
-- ============================================================
CREATE TABLE plan_cards (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity        VARCHAR(50) NOT NULL,
    title           VARCHAR(200) NOT NULL,
    skill_level     VARCHAR(20) CHECK (skill_level IN ('Beginner', 'Intermediate', 'Advanced')),
    duration        VARCHAR(50),
    neighborhood    VARCHAR(100),
    vibe_tags       TEXT[] DEFAULT '{}',
    description     TEXT,
    emoji           VARCHAR(10),
    is_crew_event   BOOLEAN DEFAULT FALSE,
    max_participants INTEGER,
    created_by      UUID REFERENCES users(id),
    active          BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_plan_cards_activity ON plan_cards(activity);
CREATE INDEX idx_plan_cards_neighborhood ON plan_cards(neighborhood);
CREATE INDEX idx_plan_cards_active ON plan_cards(active);
CREATE INDEX idx_plan_cards_vibe ON plan_cards USING GIN(vibe_tags);

-- ============================================================
-- SWIPES
-- ============================================================
CREATE TABLE swipes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_card_id    UUID NOT NULL REFERENCES plan_cards(id) ON DELETE CASCADE,
    direction       VARCHAR(3) NOT NULL CHECK (direction IN ('yes', 'no')),
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, plan_card_id)
);

CREATE INDEX idx_swipes_user ON swipes(user_id);
CREATE INDEX idx_swipes_plan_card ON swipes(plan_card_id);
CREATE INDEX idx_swipes_direction ON swipes(direction);
CREATE INDEX idx_swipes_yes ON swipes(plan_card_id, direction) WHERE direction = 'yes';

-- ============================================================
-- MATCH CANDIDATES
-- When two users both swipe YES on same plan AND overlap availability
-- ============================================================
CREATE TABLE match_candidates (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_card_id    UUID NOT NULL REFERENCES plan_cards(id),
    user1_id        UUID NOT NULL REFERENCES users(id),
    user2_id        UUID NOT NULL REFERENCES users(id),
    overlap_times   JSONB DEFAULT '[]',
    status          VARCHAR(20) NOT NULL DEFAULT 'pending_preview'
                    CHECK (status IN ('pending_preview', 'matched', 'passed', 'expired')),
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at      TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
    UNIQUE(plan_card_id, user1_id, user2_id)
);

CREATE INDEX idx_match_candidates_users ON match_candidates(user1_id, user2_id);
CREATE INDEX idx_match_candidates_status ON match_candidates(status);

-- ============================================================
-- MATCH CONFIRMATIONS (profile reveal stage decisions)
-- ============================================================
CREATE TABLE match_confirmations (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_candidate_id  UUID NOT NULL REFERENCES match_candidates(id) ON DELETE CASCADE,
    user_id             UUID NOT NULL REFERENCES users(id),
    confirmed           BOOLEAN NOT NULL,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(match_candidate_id, user_id)
);

CREATE INDEX idx_match_confirmations_candidate ON match_confirmations(match_candidate_id);

-- ============================================================
-- MATCHES (active — both users confirmed at preview stage)
-- ============================================================
CREATE TABLE matches (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_candidate_id  UUID NOT NULL REFERENCES match_candidates(id),
    plan_card_id        UUID NOT NULL REFERENCES plan_cards(id),
    user1_id            UUID NOT NULL REFERENCES users(id),
    user2_id            UUID NOT NULL REFERENCES users(id),
    overlap_times       JSONB DEFAULT '[]',
    status              VARCHAR(20) NOT NULL DEFAULT 'pending_plan'
                        CHECK (status IN ('pending_plan', 'plan_confirmed', 'completed', 'cancelled', 'expired')),
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_matches_users ON matches(user1_id, user2_id);
CREATE INDEX idx_matches_status ON matches(status);

-- ============================================================
-- PLANS (scheduled meetups — the #1 metric)
-- ============================================================
CREATE TABLE plans (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id        UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    proposed_by     UUID NOT NULL REFERENCES users(id),
    time_slot       JSONB NOT NULL,  -- {"day": "Monday", "date": "2025-03-10", "start": "18:00", "end": "19:30"}
    place           VARCHAR(200) NOT NULL,
    note            VARCHAR(140),
    user1_confirmed BOOLEAN DEFAULT FALSE,
    user2_confirmed BOOLEAN DEFAULT FALSE,
    status          VARCHAR(20) NOT NULL DEFAULT 'proposed'
                    CHECK (status IN ('proposed', 'confirmed', 'completed', 'cancelled', 'expired')),
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at      TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
    UNIQUE(match_id)
);

CREATE INDEX idx_plans_match ON plans(match_id);
CREATE INDEX idx_plans_status ON plans(status);

-- ============================================================
-- MESSAGES (only after plan confirmed)
-- ============================================================
CREATE TABLE messages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id        UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id),
    text            VARCHAR(500) NOT NULL,
    is_quick_reply  BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_messages_match ON messages(match_id);
CREATE INDEX idx_messages_created ON messages(created_at);

-- ============================================================
-- RATINGS (post-plan feedback)
-- ============================================================
CREATE TABLE ratings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id         UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    rater_id        UUID NOT NULL REFERENCES users(id),
    ratee_id        UUID NOT NULL REFERENCES users(id),
    showed_up       BOOLEAN NOT NULL,
    respectful      INTEGER CHECK (respectful >= 1 AND respectful <= 5),
    on_time         INTEGER CHECK (on_time >= 1 AND on_time <= 5),
    vibe            INTEGER CHECK (vibe >= 1 AND vibe <= 5),
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(plan_id, rater_id)
);

CREATE INDEX idx_ratings_ratee ON ratings(ratee_id);
CREATE INDEX idx_ratings_plan ON ratings(plan_id);

-- ============================================================
-- REPORTS
-- ============================================================
CREATE TABLE reports (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id     UUID NOT NULL REFERENCES users(id),
    reported_user_id UUID NOT NULL REFERENCES users(id),
    match_id        UUID REFERENCES matches(id),
    reason          VARCHAR(200) NOT NULL,
    details         TEXT,
    status          VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'actioned', 'dismissed')),
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_reports_reported ON reports(reported_user_id);
CREATE INDEX idx_reports_status ON reports(status);

-- ============================================================
-- BOOKMARKS
-- ============================================================
CREATE TABLE bookmarks (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_card_id    UUID NOT NULL REFERENCES plan_cards(id) ON DELETE CASCADE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, plan_card_id)
);

-- ============================================================
-- NOTIFICATIONS (push notification queue)
-- ============================================================
CREATE TABLE notifications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type            VARCHAR(50) NOT NULL,
    title           VARCHAR(200) NOT NULL,
    body            TEXT,
    data            JSONB DEFAULT '{}',
    read            BOOLEAN DEFAULT FALSE,
    pushed          BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, read) WHERE read = FALSE;

-- ============================================================
-- KEY VIEWS
-- ============================================================

-- Active user reliability
CREATE VIEW user_reliability AS
SELECT
    u.id,
    u.first_name,
    COUNT(r.id) AS total_ratings,
    COUNT(r.id) FILTER (WHERE r.showed_up = TRUE) AS show_ups,
    CASE WHEN COUNT(r.id) > 0
        THEN ROUND(COUNT(r.id) FILTER (WHERE r.showed_up = TRUE)::DECIMAL / COUNT(r.id), 2)
        ELSE 1.00
    END AS show_up_rate,
    ROUND(AVG(r.respectful) FILTER (WHERE r.showed_up = TRUE), 1) AS avg_respectful,
    ROUND(AVG(r.on_time) FILTER (WHERE r.showed_up = TRUE), 1) AS avg_on_time,
    ROUND(AVG(r.vibe) FILTER (WHERE r.showed_up = TRUE), 1) AS avg_vibe
FROM users u
LEFT JOIN ratings r ON r.ratee_id = u.id
GROUP BY u.id, u.first_name;

-- Confirmed plans per user per week (the #1 metric)
CREATE VIEW confirmed_plans_per_week AS
SELECT
    u.id AS user_id,
    u.first_name,
    DATE_TRUNC('week', p.created_at) AS week,
    COUNT(p.id) AS confirmed_plans
FROM users u
JOIN matches m ON (m.user1_id = u.id OR m.user2_id = u.id)
JOIN plans p ON p.match_id = m.id AND p.status IN ('confirmed', 'completed')
GROUP BY u.id, u.first_name, DATE_TRUNC('week', p.created_at);

-- ============================================================
-- CRON JOBS (implement via pg_cron or application scheduler)
-- ============================================================
-- 1. Expire match candidates after 24h:
--    UPDATE match_candidates SET status = 'expired' WHERE status = 'pending_preview' AND expires_at < NOW();
--
-- 2. Expire plans after 24h if not both confirmed:
--    UPDATE plans SET status = 'expired' WHERE status = 'proposed' AND expires_at < NOW();
--
-- 3. Reset daily preview count at midnight:
--    UPDATE users SET daily_preview_count = 0, daily_preview_reset = NOW();
--
-- 4. Push reminders 2h before plan:
--    SELECT * FROM plans WHERE status = 'confirmed' AND (time_slot->>'date')::DATE = CURRENT_DATE
--    AND (time_slot->>'start')::TIME - INTERVAL '2 hours' <= CURRENT_TIME;
