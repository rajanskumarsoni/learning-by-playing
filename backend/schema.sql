-- ============================================================================
-- System Saviour - Cloudflare D1 Relational Schema
-- ============================================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    handle TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    specialization TEXT NOT NULL DEFAULT 'HIGH_AVAILABILITY',
    salary TEXT NOT NULL DEFAULT '$95,000 / yr',
    rank TEXT NOT NULL DEFAULT 'Junior Architect',
    password_hash TEXT,
    salt TEXT,
    auth_provider TEXT NOT NULL DEFAULT 'email', -- 'email' | 'guest' | 'github' | 'google'
    provider_id TEXT,
    avatar_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Sessions Table
CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at INTEGER NOT NULL,
    user_agent TEXT,
    ip_country TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Player Career Progression
CREATE TABLE IF NOT EXISTS player_progress (
    user_id TEXT PRIMARY KEY,
    unlocked_level_idx INTEGER NOT NULL DEFAULT 0,
    max_survival_wave INTEGER NOT NULL DEFAULT 0,
    daily_streak INTEGER NOT NULL DEFAULT 0,
    last_daily_completed_date TEXT,
    tutorial_completed BOOLEAN NOT NULL DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Player Badges (Normalized)
CREATE TABLE IF NOT EXISTS player_badges (
    user_id TEXT NOT NULL,
    badge_id TEXT NOT NULL,
    unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(user_id, badge_id),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Saved Architecture Topologies (Slot Saves)
CREATE TABLE IF NOT EXISTS saved_topologies (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    game_mode TEXT NOT NULL, -- 'CAMPAIGN', 'SURVIVAL', 'SANDBOX', 'DAILY'
    level_idx INTEGER NOT NULL DEFAULT 0,
    nodes_json TEXT NOT NULL,
    edges_json TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, game_mode, level_idx)
);

-- 6. Community Blueprints
CREATE TABLE IF NOT EXISTS blueprints (
    id TEXT PRIMARY KEY,
    author_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    nodes_json TEXT NOT NULL,
    edges_json TEXT NOT NULL,
    traffic_profile_json TEXT,
    likes_count INTEGER DEFAULT 0,
    forks_count INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(author_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 7. Authoritative Leaderboard Submissions
CREATE TABLE IF NOT EXISTS leaderboard_entries (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    leaderboard_type TEXT NOT NULL, -- 'daily' | 'survival'
    day_number INTEGER,             -- populated for daily challenges
    level_idx INTEGER,
    score INTEGER NOT NULL,
    p99_latency_ms REAL NOT NULL,
    uptime_pct REAL NOT NULL,
    wave_survived INTEGER,          -- populated for survival
    nodes_count INTEGER NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 8. Viral Challenges & Short Links
CREATE TABLE IF NOT EXISTS challenges (
    id TEXT PRIMARY KEY,
    author_id TEXT,
    author_name TEXT NOT NULL DEFAULT 'Anonymous Architect',
    game_mode TEXT NOT NULL DEFAULT 'CAMPAIGN',
    level_idx INTEGER NOT NULL DEFAULT 0,
    nodes_json TEXT NOT NULL,
    edges_json TEXT NOT NULL,
    clicks_count INTEGER NOT NULL DEFAULT 0,
    completions_count INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Performance & Lookup Indexes
CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON leaderboard_entries(leaderboard_type, score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_daily ON leaderboard_entries(leaderboard_type, day_number, score DESC);
CREATE INDEX IF NOT EXISTS idx_blueprints_created ON blueprints(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_challenges_created ON challenges(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_handle ON users(handle);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_topologies_user ON saved_topologies(user_id);

