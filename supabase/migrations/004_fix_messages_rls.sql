-- ================================================
-- Phase 3: Chat System - RLS Fix + Schema Update
-- ================================================

-- Fix messages SELECT policy: allow reading in 'completed' rooms too
-- (otherwise messages disappear after profile reveal)
DROP POLICY IF EXISTS "Room participants can read messages" ON messages;

CREATE POLICY "Room participants can read messages"
ON messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM chat_rooms
    WHERE chat_rooms.id = messages.room_id
    AND (chat_rooms.requester_id = auth.uid() OR chat_rooms.target_id = auth.uid())
    AND chat_rooms.status IN ('active', 'completed')
  )
);

-- Add reveal_requested_by column to track who initiated profile reveal
ALTER TABLE chat_rooms ADD COLUMN IF NOT EXISTS reveal_requested_by UUID REFERENCES users(id);
