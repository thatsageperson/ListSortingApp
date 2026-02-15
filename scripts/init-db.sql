-- SmartLists database schema
-- Run this once against your PostgreSQL database (Railway Postgres or Neon).
-- Core tables (app data) + Auth tables (Auth.js adapter with auth_ prefix).

-- ---------------------------------------------------------------------------
-- Auth tables (required by apps/web/__create/adapter.ts and apps/web/src/auth.js)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS auth_verification_token (
  identifier TEXT NOT NULL,
  expires TIMESTAMPTZ NOT NULL,
  token TEXT NOT NULL,
  PRIMARY KEY (identifier, token)
);

CREATE TABLE IF NOT EXISTS auth_users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name VARCHAR(255),
  email VARCHAR(255),
  "emailVerified" TIMESTAMPTZ,
  image TEXT
);

CREATE TABLE IF NOT EXISTS auth_accounts (
  id SERIAL PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  provider VARCHAR(255) NOT NULL,
  type VARCHAR(255) NOT NULL,
  "providerAccountId" VARCHAR(255) NOT NULL,
  access_token TEXT,
  expires_at BIGINT,
  refresh_token TEXT,
  id_token TEXT,
  scope TEXT,
  session_state TEXT,
  token_type TEXT,
  password TEXT
);

CREATE TABLE IF NOT EXISTS auth_sessions (
  id SERIAL PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  expires TIMESTAMPTZ NOT NULL,
  "sessionToken" VARCHAR(255) NOT NULL UNIQUE
);

-- ---------------------------------------------------------------------------
-- Core application tables (from README Database Schema)
-- user_id / shared_with_user_id match auth_users.id (TEXT)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS lists (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  rules TEXT,
  user_id TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS list_items (
  id SERIAL PRIMARY KEY,
  list_id INTEGER NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  notes TEXT,
  priority TEXT,
  completed BOOLEAN DEFAULT false,
  type TEXT DEFAULT 'task',
  display_mode TEXT DEFAULT 'todo-strike',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS list_shares (
  id SERIAL PRIMARY KEY,
  list_id INTEGER NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  shared_with_user_id TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  permission TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_settings (
  user_id TEXT PRIMARY KEY REFERENCES auth_users(id) ON DELETE CASCADE,
  settings JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Optional: indexes for common queries
CREATE INDEX IF NOT EXISTS idx_lists_user_id ON lists(user_id);
CREATE INDEX IF NOT EXISTS idx_list_items_list_id ON list_items(list_id);
CREATE INDEX IF NOT EXISTS idx_list_shares_list_id ON list_shares(list_id);
CREATE INDEX IF NOT EXISTS idx_list_shares_shared_with ON list_shares(shared_with_user_id);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_session_token ON auth_sessions("sessionToken");
CREATE INDEX IF NOT EXISTS idx_auth_accounts_user_id ON auth_accounts("userId");
