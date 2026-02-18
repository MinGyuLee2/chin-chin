# 친친 (ChinChin)

친친은 인스타그램 스토리 링크로 친구를 소개하는 모바일 우선 웹 서비스입니다.  
앱 설치 없이 블라인드 프로필을 공유하고, 익명 채팅으로 먼저 대화한 뒤 서로 동의하면 프로필을 공개하는 흐름을 제공합니다.

## 주요 기능

- 카카오 OAuth 로그인
- 친구 초대 기반 프로필 작성 (`/invite/[inviteCode]`)
- 셀프 프로필 생성 (`/create/self`)
- 블라인드 프로필 공개 링크 (`/m/[shortId]`)
- 실시간 익명 채팅 및 프로필 공개 요청/수락
- 주선자 대시보드(초대 관리, 링크 공유, 상태 확인)
- 알림 센터 + 차단/신고 기능
- 베타 피드백용 관리자 채팅

## 기술 스택

- Frontend: Next.js 16 (App Router), React 19, TypeScript
- UI: Tailwind CSS, Radix UI, Framer Motion
- State/Data: React Query, Zustand, React Hook Form, Zod
- Backend/BaaS: Supabase (PostgreSQL, Auth, Realtime, Storage)
- Image: Sharp

## 빠른 시작

### 1) 설치

```bash
npm install
```

### 2) 환경 변수 설정

```bash
cp .env.example .env.local
```

`.env.local`에 아래 값을 채워주세요.

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_PROJECT_ID=

# Kakao OAuth
KAKAO_CLIENT_ID=
KAKAO_CLIENT_SECRET=
NEXT_PUBLIC_KAKAO_CLIENT_ID=
NEXT_PUBLIC_KAKAO_REDIRECT_URI=http://localhost:3000/api/auth/callback/kakao

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=친친
JWT_SECRET=

# Optional (베타 피드백 관리자 계정)
NEXT_PUBLIC_ADMIN_USER_ID=
```

카카오 개발자 콘솔 Redirect URI도 반드시 `http://localhost:3000/api/auth/callback/kakao`로 맞춰야 합니다.

### 3) 데이터베이스 마이그레이션

Supabase CLI 기준:

```bash
supabase db push
```

타입 재생성이 필요하면:

```bash
npm run db:generate
```

### 4) 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 접속.

## npm 스크립트

- `npm run dev`: 개발 서버 실행 (Turbopack)
- `npm run build`: 프로덕션 빌드
- `npm run start`: 프로덕션 서버 실행
- `npm run lint`: ESLint 검사
- `npm run db:generate`: Supabase 타입 생성 (`src/types/database.ts`)

## 디렉터리 구조

```text
src/
  app/
    (auth)/login
    (main)/create
    (main)/chat
    (main)/dashboard
    (main)/notifications
    invite/[inviteCode]
    m/[shortId]
    api/auth/*
  components/
  hooks/
  lib/
  types/
supabase/
  migrations/
```

## 데이터베이스 요약

주요 테이블:

- `users`
- `profiles`
- `invitations`
- `chat_rooms`
- `messages`
- `notifications`
- `reports`
- `blocks`

모든 핵심 테이블에 RLS 정책이 적용되어 있습니다.

## 참고 문서

- 요구사항 문서: `chinchin-prd.md`
- 구현 계획서: `implementation-plan.md`
