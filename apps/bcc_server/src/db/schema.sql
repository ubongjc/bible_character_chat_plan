-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  locale VARCHAR(10) DEFAULT 'en',
  plan VARCHAR(50) DEFAULT 'free',
  settings JSONB DEFAULT '{}',
  favorites UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE
);

-- WebAuthn credentials for passkeys
CREATE TABLE IF NOT EXISTS webauthn_credentials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  credential_id TEXT NOT NULL UNIQUE,
  public_key TEXT NOT NULL,
  counter BIGINT NOT NULL DEFAULT 0,
  device_type VARCHAR(50),
  backed_up BOOLEAN DEFAULT false,
  transports TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE
);

-- Character types enum
CREATE TYPE character_type AS ENUM (
  'person',
  'divine',
  'angel',
  'demon',
  'group',
  'collective'
);

-- Character alignment enum
CREATE TYPE character_alignment AS ENUM (
  'benevolent',
  'antagonist',
  'complex'
);

-- Characters table
CREATE TABLE IF NOT EXISTS characters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  type character_type NOT NULL,
  alignment character_alignment NOT NULL DEFAULT 'benevolent',
  roles TEXT[] DEFAULT '{}',
  books TEXT[] DEFAULT '{}',
  era VARCHAR(100),
  geography TEXT[] DEFAULT '{}',
  policy_id UUID,
  portrait_url TEXT,
  description TEXT,
  is_featured BOOLEAN DEFAULT false,
  featured_order INTEGER,
  controversy_level INTEGER DEFAULT 0,
  influence_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Character relationships
CREATE TABLE IF NOT EXISTS relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  src_character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  dst_character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL,
  scripture_refs TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(src_character_id, dst_character_id, type)
);

-- Policies for character behavior
CREATE TABLE IF NOT EXISTS policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  character_id UUID UNIQUE REFERENCES characters(id) ON DELETE CASCADE,
  can_say TEXT[] DEFAULT '{}',
  must_cite TEXT[] DEFAULT '{}',
  cannot_say TEXT[] DEFAULT '{}',
  style JSONB DEFAULT '{}',
  disclaimer TEXT,
  enable_deception_flags BOOLEAN DEFAULT false,
  enable_counter_voice BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key for policy_id in characters
ALTER TABLE characters ADD CONSTRAINT fk_characters_policy
  FOREIGN KEY (policy_id) REFERENCES policies(id) ON DELETE SET NULL;

-- Source types enum
CREATE TYPE source_type AS ENUM (
  'verse',
  'commentary',
  'map',
  'timeline',
  'cross_reference'
);

-- Sources table (verses, commentaries, etc.)
CREATE TABLE IF NOT EXISTS sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type source_type NOT NULL,
  ref VARCHAR(255) NOT NULL,
  text TEXT NOT NULL,
  translation VARCHAR(50) DEFAULT 'KJV',
  book VARCHAR(100),
  chapter INTEGER,
  verse_start INTEGER,
  verse_end INTEGER,
  license VARCHAR(100),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(ref, translation)
);

-- Embeddings for semantic search
CREATE TABLE IF NOT EXISTS embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  vector vector(1536) NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create HNSW index for fast vector similarity search
CREATE INDEX IF NOT EXISTS embeddings_vector_idx ON embeddings
  USING hnsw (vector vector_cosine_ops);

-- Threads table
CREATE TABLE IF NOT EXISTS threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  character_ids UUID[] NOT NULL,
  title VARCHAR(500),
  starred BOOLEAN DEFAULT false,
  store_transcript BOOLEAN DEFAULT true,
  archived BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Message role enum
CREATE TYPE message_role AS ENUM (
  'user',
  'character',
  'system'
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  character_id UUID REFERENCES characters(id) ON DELETE SET NULL,
  role message_role NOT NULL,
  text TEXT NOT NULL,
  audio_url TEXT,
  language VARCHAR(10) DEFAULT 'en',
  citations TEXT[] DEFAULT '{}',
  flags JSONB DEFAULT '{}',
  reactions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Call sessions for voice interactions
CREATE TABLE IF NOT EXISTS call_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  character_id UUID REFERENCES characters(id) ON DELETE SET NULL,
  panel_id UUID,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  transcript_ref UUID REFERENCES threads(id) ON DELETE SET NULL,
  quality_score DECIMAL(3, 2),
  metadata JSONB DEFAULT '{}'
);

-- Panels for group conversations
CREATE TABLE IF NOT EXISTS panels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(500) NOT NULL,
  character_ids UUID[] NOT NULL,
  topic TEXT,
  policy_id UUID REFERENCES policies(id),
  template_name VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookmarks
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, message_id)
);

-- Reading plans
CREATE TABLE IF NOT EXISTS reading_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  entries JSONB NOT NULL DEFAULT '[]',
  progress JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity VARCHAR(100),
  entity_id UUID,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_webauthn_credentials_user_id ON webauthn_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_characters_type ON characters(type);
CREATE INDEX IF NOT EXISTS idx_characters_featured ON characters(is_featured, featured_order);
CREATE INDEX IF NOT EXISTS idx_relationships_src ON relationships(src_character_id);
CREATE INDEX IF NOT EXISTS idx_relationships_dst ON relationships(dst_character_id);
CREATE INDEX IF NOT EXISTS idx_sources_ref ON sources(ref);
CREATE INDEX IF NOT EXISTS idx_sources_book ON sources(book);
CREATE INDEX IF NOT EXISTS idx_embeddings_source_id ON embeddings(source_id);
CREATE INDEX IF NOT EXISTS idx_threads_user_id ON threads(user_id);
CREATE INDEX IF NOT EXISTS idx_threads_created_at ON threads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_call_sessions_user_id ON call_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_plans_user_id ON reading_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_characters_updated_at BEFORE UPDATE ON characters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_policies_updated_at BEFORE UPDATE ON policies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_threads_updated_at BEFORE UPDATE ON threads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reading_plans_updated_at BEFORE UPDATE ON reading_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
