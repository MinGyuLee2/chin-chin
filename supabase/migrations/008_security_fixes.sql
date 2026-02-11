-- ================================================
-- 008_security_fixes.sql
-- 보안 감사 결과 수정 사항
-- ================================================

-- ================================================
-- 1. 초대 테이블: 전체 공개 읽기 정책 제거
--    기존: USING(TRUE)로 모든 사용자가 모든 초대를 조회 가능
--    수정: 정책 제거 (invite 페이지에서 admin client로 조회하므로 불필요)
-- ================================================
DROP POLICY IF EXISTS "Anyone can read invitation by code" ON invitations;

-- ================================================
-- 2. 알림 INSERT 정책 강화
--    기존: auth.uid() IS NOT NULL (아무 유저에게나 알림 생성 가능)
--    수정: 본인에게 알림을 보내는 것만 제한 (서버 액션에서 타 유저에게 전송하는 패턴 유지)
-- ================================================
DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON notifications;

CREATE POLICY "Authenticated users can insert notifications for others"
ON notifications FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
  AND user_id != auth.uid()
);

-- ================================================
-- 3. increment_chat_request_count 함수에 권한 검증 추가
--    기존: 누구나 아무 프로필의 chat_request_count 증가 가능
--    수정: 호출자가 해당 프로필에 대한 chat_rooms에 requester로 존재하는지 확인
-- ================================================
CREATE OR REPLACE FUNCTION increment_chat_request_count(profile_id_param UUID)
RETURNS void AS $$
BEGIN
  -- 호출자가 해당 프로필에 대해 실제 채팅 신청을 했는지 검증
  IF NOT EXISTS (
    SELECT 1 FROM chat_rooms
    WHERE profile_id = profile_id_param
      AND requester_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Unauthorized: no chat request for this profile';
  END IF;

  UPDATE profiles
  SET chat_request_count = chat_request_count + 1
  WHERE id = profile_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
