-- ================================================
-- 친친 (ChinChin) Database Schema
-- Version: 1.0.0
-- ================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- 1. Users Table (카카오 사용자)
-- ================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kakao_id BIGINT UNIQUE NOT NULL,
  nickname VARCHAR(50),
  profile_image_url TEXT,
  kakao_access_token TEXT,
  kakao_refresh_token TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_kakao_id ON users(kakao_id);

-- ================================================
-- 2. Profiles Table (프로필 링크)
-- ================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  short_id VARCHAR(20) UNIQUE NOT NULL,
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Profile Information
  photo_url TEXT NOT NULL,
  original_photo_url TEXT,
  name VARCHAR(50),
  age SMALLINT NOT NULL CHECK (age >= 18 AND age <= 99),
  gender VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female')),
  occupation_category VARCHAR(50),
  bio VARCHAR(100) NOT NULL,
  interest_tags TEXT[] NOT NULL,
  mbti VARCHAR(4),
  music_genre VARCHAR(50),
  instagram_id VARCHAR(100),
  kakao_open_chat_id VARCHAR(100),

  -- Link Settings
  expires_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  view_count INTEGER DEFAULT 0,
  chat_request_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_short_id ON profiles(short_id);
CREATE INDEX IF NOT EXISTS idx_profiles_creator ON profiles(creator_id);
CREATE INDEX IF NOT EXISTS idx_profiles_active ON profiles(is_active, expires_at);

-- ================================================
-- 3. Chat Rooms Table (채팅방)
-- ================================================
CREATE TABLE IF NOT EXISTS chat_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  status VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending', 'active', 'rejected', 'expired', 'completed')),
  profile_revealed BOOLEAN DEFAULT FALSE,
  profile_revealed_at TIMESTAMPTZ,

  last_message_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT chat_rooms_different_users CHECK (requester_id != target_id)
);

CREATE INDEX IF NOT EXISTS idx_chat_rooms_requester ON chat_rooms(requester_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_target ON chat_rooms(target_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_chat_rooms_unique ON chat_rooms(profile_id, requester_id);

-- ================================================
-- 4. Messages Table (메시지)
-- ================================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) <= 500),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_room ON messages(room_id, created_at DESC);

-- ================================================
-- 5. Notifications Table (알림)
-- ================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(100),
  message TEXT,
  link_url TEXT,
  sent_via VARCHAR(20) DEFAULT 'kakao_memo',
  sent_at TIMESTAMPTZ,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at DESC);

-- ================================================
-- 6. Reports Table (신고)
-- ================================================
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reported_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  room_id UUID REFERENCES chat_rooms(id) ON DELETE SET NULL,
  reason VARCHAR(100) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- Functions
-- ================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for profiles updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_view_count(profile_short_id VARCHAR)
RETURNS void AS $$
BEGIN
    UPDATE profiles
    SET view_count = view_count + 1
    WHERE short_id = profile_short_id AND is_active = TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to increment chat request count
CREATE OR REPLACE FUNCTION increment_chat_request_count(profile_uuid UUID)
RETURNS void AS $$
BEGIN
    UPDATE profiles
    SET chat_request_count = chat_request_count + 1
    WHERE id = profile_uuid;
END;
$$ LANGUAGE plpgsql;
