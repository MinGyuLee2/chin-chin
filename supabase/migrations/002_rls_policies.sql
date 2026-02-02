-- ================================================
-- Row Level Security (RLS) Policies
-- ================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- ================================================
-- Users Policies
-- ================================================

-- Users can read their own record
CREATE POLICY "Users can read own record"
ON users FOR SELECT
USING (id = auth.uid());

-- Users can update their own record
CREATE POLICY "Users can update own record"
ON users FOR UPDATE
USING (id = auth.uid());

-- ================================================
-- Profiles Policies
-- ================================================

-- Anyone can read active profiles (for public viewing)
CREATE POLICY "Anyone can read active profiles"
ON profiles FOR SELECT
USING (is_active = TRUE AND expires_at > NOW());

-- Creators can read all their profiles (including inactive)
CREATE POLICY "Creators can read all own profiles"
ON profiles FOR SELECT
USING (creator_id = auth.uid());

-- Only authenticated users can create profiles
CREATE POLICY "Authenticated users can create profiles"
ON profiles FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND creator_id = auth.uid());

-- Creators can update their own profiles
CREATE POLICY "Creators can update own profiles"
ON profiles FOR UPDATE
USING (creator_id = auth.uid());

-- Creators can delete their own profiles
CREATE POLICY "Creators can delete own profiles"
ON profiles FOR DELETE
USING (creator_id = auth.uid());

-- ================================================
-- Chat Rooms Policies
-- ================================================

-- Participants can read their chat rooms
CREATE POLICY "Participants can read chat rooms"
ON chat_rooms FOR SELECT
USING (requester_id = auth.uid() OR target_id = auth.uid());

-- Authenticated users can create chat requests
CREATE POLICY "Authenticated users can create chat requests"
ON chat_rooms FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND requester_id = auth.uid());

-- Participants can update chat rooms (accept/reject/reveal)
CREATE POLICY "Participants can update chat rooms"
ON chat_rooms FOR UPDATE
USING (requester_id = auth.uid() OR target_id = auth.uid());

-- ================================================
-- Messages Policies
-- ================================================

-- Room participants can read messages
CREATE POLICY "Room participants can read messages"
ON messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM chat_rooms
    WHERE chat_rooms.id = messages.room_id
    AND (chat_rooms.requester_id = auth.uid() OR chat_rooms.target_id = auth.uid())
    AND chat_rooms.status = 'active'
  )
);

-- Room participants can send messages
CREATE POLICY "Room participants can send messages"
ON messages FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM chat_rooms
    WHERE chat_rooms.id = room_id
    AND (chat_rooms.requester_id = auth.uid() OR chat_rooms.target_id = auth.uid())
    AND chat_rooms.status = 'active'
  )
  AND sender_id = auth.uid()
);

-- Participants can update message read status
CREATE POLICY "Participants can update message read status"
ON messages FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM chat_rooms
    WHERE chat_rooms.id = messages.room_id
    AND (chat_rooms.requester_id = auth.uid() OR chat_rooms.target_id = auth.uid())
  )
);

-- ================================================
-- Notifications Policies
-- ================================================

-- Users can read their own notifications
CREATE POLICY "Users can read own notifications"
ON notifications FOR SELECT
USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
ON notifications FOR UPDATE
USING (user_id = auth.uid());

-- ================================================
-- Reports Policies
-- ================================================

-- Users can create reports
CREATE POLICY "Users can create reports"
ON reports FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND reporter_id = auth.uid());

-- Users can read their own reports
CREATE POLICY "Users can read own reports"
ON reports FOR SELECT
USING (reporter_id = auth.uid());
