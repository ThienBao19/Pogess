-- ================================================================
-- NYT-Style News Website — Supabase Schema
-- Run this in the Supabase SQL Editor
-- ================================================================

-- ── USERS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       VARCHAR(255) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,
  name        VARCHAR(100) NOT NULL,
  avatar_url  TEXT,
  role        VARCHAR(20) NOT NULL DEFAULT 'user'
                CHECK (role IN ('user', 'admin')),
  is_locked   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── CATEGORIES ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) UNIQUE NOT NULL,
  slug        VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO categories (name, slug, description) VALUES
  ('Current Affairs', 'current-affairs', 'Latest news and current events from around the world'),
  ('Technology',      'technology',      'Tech news, AI, science, and innovation'),
  ('Sports',          'sports',          'Sports news, scores, and analysis'),
  ('Entertainment',   'entertainment',   'Movies, TV, music, arts and culture')
ON CONFLICT (slug) DO NOTHING;

-- ── ARTICLES ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS articles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  slug          VARCHAR(255) UNIQUE NOT NULL,
  description   TEXT,
  content       TEXT,
  cover_image   TEXT,
  author        VARCHAR(150),
  category_id   INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  source        VARCHAR(50) NOT NULL DEFAULT 'admin'
                  CHECK (source IN ('admin', 'nyt')),
  nyt_url       TEXT,
  is_featured   BOOLEAN NOT NULL DEFAULT FALSE,
  published_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_articles_category    ON articles(category_id);
CREATE INDEX IF NOT EXISTS idx_articles_published   ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_is_featured ON articles(is_featured)
  WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_articles_slug        ON articles(slug);

-- ── NYT_CACHE ────────────────────────────────────────────────
-- Stores raw NYT API responses to reduce API quota usage.
-- Cache entries expire after their TTL (checked at read time).
CREATE TABLE IF NOT EXISTS nyt_cache (
  id          SERIAL PRIMARY KEY,
  cache_key   VARCHAR(255) UNIQUE NOT NULL,  -- e.g. 'topstories:home', 'search:covid', 'popular:viewed:1'
  data        JSONB NOT NULL,                -- raw API response
  ttl_seconds INTEGER NOT NULL DEFAULT 900,  -- 15 minutes default
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '15 minutes')
);

CREATE INDEX IF NOT EXISTS idx_nyt_cache_key     ON nyt_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_nyt_cache_expires ON nyt_cache(expires_at);

-- ── COMMENTS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS comments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content     TEXT NOT NULL,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  article_id  UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_article ON comments(article_id);
CREATE INDEX IF NOT EXISTS idx_comments_user    ON comments(user_id);

-- ── LIKES ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS likes (
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  article_id  UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, article_id)
);

-- ── BOOKMARKS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookmarks (
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  article_id  UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, article_id)
);

-- ================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ================================================================

-- Enable RLS on all tables
ALTER TABLE users      ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments   ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes      ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks  ENABLE ROW LEVEL SECURITY;

-- ── Public read access (articles, categories) ─────────────────
-- Note: Using service role key from backend bypasses RLS.
-- These policies are for direct client-side access if needed.

CREATE POLICY "Public can read articles" ON articles
  FOR SELECT USING (true);

CREATE POLICY "Public can read categories" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Public can read comments" ON comments
  FOR SELECT USING (true);

-- ================================================================
-- HELPER FUNCTION: update updated_at on row change
-- ================================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
