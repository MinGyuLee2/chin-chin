-- ================================================
-- 007: Invitations & Profile Flow Changes
-- 초대 기반 소개 + 셀프 프로필 지원
-- ================================================

-- ================================================
-- 1. Invitations Table (초대)
-- ================================================
CREATE TABLE IF NOT EXISTS invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invite_code VARCHAR(20) UNIQUE NOT NULL,
  matchmaker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_id UUID REFERENCES users(id) ON DELETE SET NULL,
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending', 'completed', 'shared', 'expired')),
  matchmaker_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_invitations_code ON invitations(invite_code);
CREATE INDEX IF NOT EXISTS idx_invitations_matchmaker ON invitations(matchmaker_id);
CREATE INDEX IF NOT EXISTS idx_invitations_target ON invitations(target_id);

-- ================================================
-- 2. Profiles Table Changes
-- ================================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS matchmaker_id UUID REFERENCES users(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS invitation_id UUID REFERENCES invitations(id);

CREATE INDEX IF NOT EXISTS idx_profiles_matchmaker ON profiles(matchmaker_id);

-- ================================================
-- 3. Invitations RLS
-- ================================================
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Matchmaker can read their invitations
CREATE POLICY "Matchmakers can read own invitations"
ON invitations FOR SELECT
USING (matchmaker_id = auth.uid());

-- Target can read invitations sent to them
CREATE POLICY "Targets can read their invitations"
ON invitations FOR SELECT
USING (target_id = auth.uid());

-- Authenticated users can create invitations
CREATE POLICY "Authenticated users can create invitations"
ON invitations FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND matchmaker_id = auth.uid());

-- Matchmaker or target can update invitations
CREATE POLICY "Matchmaker or target can update invitations"
ON invitations FOR UPDATE
USING (matchmaker_id = auth.uid() OR target_id = auth.uid());

-- Matchmaker can delete their invitations
CREATE POLICY "Matchmakers can delete own invitations"
ON invitations FOR DELETE
USING (matchmaker_id = auth.uid());

-- ================================================
-- 4. Public read for invitations by invite_code
-- (needed for /invite/[inviteCode] page before login)
-- ================================================
CREATE POLICY "Anyone can read invitation by code"
ON invitations FOR SELECT
USING (TRUE);

-- ================================================
-- 5. Update profiles RLS for matchmaker access
-- ================================================

-- Matchmakers can read profiles they introduced
CREATE POLICY "Matchmakers can read introduced profiles"
ON profiles FOR SELECT
USING (matchmaker_id = auth.uid());
