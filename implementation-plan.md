# 친친 (ChinChin) - 구현 계획서

> **Version**: 1.0.0
> **Created**: 2026-02-03
> **Based on**: chinchin-prd.md

---

## 목차

1. [프로젝트 초기 설정](#1-프로젝트-초기-설정)
2. [Phase 1: Foundation (Week 1-2)](#2-phase-1-foundation-week-1-2)
3. [Phase 2: Core Features (Week 3-4)](#3-phase-2-core-features-week-3-4)
4. [Phase 3: Chat System (Week 5-6)](#4-phase-3-chat-system-week-5-6)
5. [Phase 4: Dashboard & Polish (Week 7-8)](#5-phase-4-dashboard--polish-week-7-8)
6. [기술적 고려사항](#6-기술적-고려사항)
7. [테스트 전략](#7-테스트-전략)

---

## 1. 프로젝트 초기 설정

### 1.1 개발 환경 구성

```bash
# 필수 도구
- Node.js 20.x LTS
- pnpm (패키지 매니저)
- Git
- VS Code + Extensions (ESLint, Prettier, Tailwind IntelliSense)
```

### 1.2 프로젝트 생성

| Task | 설명 | 산출물 |
|------|------|--------|
| Next.js 프로젝트 초기화 | `pnpm create next-app@latest` (App Router, TypeScript, Tailwind) | `/src/app` |
| ESLint/Prettier 설정 | 코드 스타일 통일 | `.eslintrc.json`, `.prettierrc` |
| 환경변수 설정 | 개발/프로덕션 분리 | `.env.local`, `.env.example` |
| Git 초기화 | 브랜치 전략 설정 (main, develop, feature/*) | `.gitignore` |

### 1.3 필수 패키지 설치

```json
{
  "dependencies": {
    "next": "14.x",
    "@supabase/supabase-js": "^2.x",
    "@supabase/ssr": "^0.x",
    "zustand": "^4.x",
    "react-hook-form": "^7.x",
    "zod": "^3.x",
    "@hookform/resolvers": "^3.x",
    "framer-motion": "^10.x",
    "nanoid": "^5.x",
    "date-fns": "^3.x",
    "sharp": "^0.33.x"
  },
  "devDependencies": {
    "@types/node": "^20.x",
    "@types/react": "^18.x",
    "typescript": "^5.x",
    "tailwindcss": "^3.x",
    "autoprefixer": "^10.x",
    "postcss": "^8.x"
  }
}
```

---

## 2. Phase 1: Foundation (Week 1-2)

### Week 1: 인프라 및 인증

#### Day 1-2: Supabase 설정

| Task ID | Task | 상세 내용 | 완료 조건 |
|---------|------|----------|----------|
| 1.1.1 | Supabase 프로젝트 생성 | 한국 리전 선택, 프로젝트명 설정 | 대시보드 접근 가능 |
| 1.1.2 | 데이터베이스 스키마 작성 | PRD 9절 기반 SQL 마이그레이션 | 6개 테이블 생성 |
| 1.1.3 | RLS 정책 설정 | 사용자별 데이터 접근 제한 | 정책 테스트 통과 |
| 1.1.4 | Storage 버킷 생성 | `profiles` 버킷 (이미지 저장용) | 업로드/다운로드 테스트 |

**마이그레이션 파일 구조:**
```
supabase/
├── migrations/
│   ├── 001_create_users_table.sql
│   ├── 002_create_profiles_table.sql
│   ├── 003_create_chat_rooms_table.sql
│   ├── 004_create_messages_table.sql
│   ├── 005_create_notifications_table.sql
│   ├── 006_create_reports_table.sql
│   └── 007_setup_rls_policies.sql
└── seed.sql (테스트 데이터)
```

#### Day 3-4: 카카오 OAuth 연동

| Task ID | Task | 상세 내용 | 완료 조건 |
|---------|------|----------|----------|
| 1.2.1 | 카카오 개발자 앱 등록 | REST API 키, Redirect URI 설정 | 앱 키 발급 |
| 1.2.2 | OAuth 콜백 라우트 | `/api/auth/callback/kakao` | 토큰 발급 성공 |
| 1.2.3 | Supabase Auth 연동 | 커스텀 JWT 발급, 세션 관리 | 로그인 유지 |
| 1.2.4 | 로그아웃 구현 | 세션 삭제, 쿠키 제거 | 로그아웃 동작 |

**파일 구조:**
```
src/
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── kakao/route.ts        # 카카오 로그인 시작
│   │       ├── callback/kakao/route.ts # 콜백 처리
│   │       ├── logout/route.ts       # 로그아웃
│   │       └── me/route.ts           # 현재 사용자 정보
│   └── (auth)/
│       └── login/page.tsx            # 로그인 페이지
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # 브라우저 클라이언트
│   │   ├── server.ts                 # 서버 클라이언트
│   │   └── middleware.ts             # 세션 갱신
│   └── kakao/
│       ├── auth.ts                   # OAuth 헬퍼
│       └── types.ts                  # 카카오 API 타입
└── middleware.ts                      # 인증 미들웨어
```

#### Day 5: 인증 미들웨어 및 보호 라우트

| Task ID | Task | 상세 내용 | 완료 조건 |
|---------|------|----------|----------|
| 1.3.1 | 미들웨어 구현 | 세션 검증, 토큰 갱신 | 보호 라우트 동작 |
| 1.3.2 | AuthProvider 구현 | 전역 인증 상태 관리 | useAuth 훅 사용 가능 |
| 1.3.3 | 보호 라우트 설정 | 로그인 필요 페이지 리다이렉트 | 미인증 시 로그인 페이지 |

### Week 2: UI 기반 및 레이아웃

#### Day 1-2: 디자인 시스템 구축

| Task ID | Task | 상세 내용 | 완료 조건 |
|---------|------|----------|----------|
| 2.1.1 | Tailwind 설정 | PRD 11절 컬러/타이포 설정 | tailwind.config.ts |
| 2.1.2 | 폰트 설정 | Pretendard Variable, Righteous | next/font 적용 |
| 2.1.3 | shadcn/ui 설치 | Button, Input, Card 등 기본 컴포넌트 | 컴포넌트 동작 확인 |
| 2.1.4 | 공통 컴포넌트 | Loading, Error, Empty 상태 | 재사용 가능 |

**Tailwind 설정:**
```typescript
// tailwind.config.ts
const config = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF6B6B',
          dark: '#E55555',
          light: '#FFE5E5',
        },
        secondary: '#4ECDC4',
      },
      fontFamily: {
        sans: ['var(--font-pretendard)'],
        display: ['var(--font-righteous)'],
      },
    },
  },
}
```

#### Day 3-4: 레이아웃 및 네비게이션

| Task ID | Task | 상세 내용 | 완료 조건 |
|---------|------|----------|----------|
| 2.2.1 | 루트 레이아웃 | 메타데이터, 폰트, 프로바이더 | layout.tsx |
| 2.2.2 | 헤더 컴포넌트 | 로고, 알림 벨(배지), 로그인/프로필 버튼 | 반응형 동작 |
| 2.2.3 | 모바일 네비게이션 | 하단 탭바 (홈, 소개하기, 채팅, 내 정보) + 상단 헤더 알림 벨 아이콘 | 터치 영역 확보 |
| 2.2.4 | 페이지 전환 애니메이션 | Framer Motion 적용 | 부드러운 전환 |

**컴포넌트 구조:**
```
src/components/
├── ui/                    # shadcn/ui 컴포넌트
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   └── ...
├── layout/
│   ├── Header.tsx
│   ├── BottomNav.tsx
│   ├── PageContainer.tsx
│   └── LoadingScreen.tsx
└── common/
    ├── Logo.tsx
    ├── Avatar.tsx
    ├── CountdownTimer.tsx
    └── Tag.tsx
```

#### Day 5: 랜딩 페이지

| Task ID | Task | 상세 내용 | 완료 조건 |
|---------|------|----------|----------|
| 2.3.1 | 히어로 섹션 | 타이틀, 서브타이틀, CTA 버튼 | 디자인 매치 |
| 2.3.2 | 사용 방법 섹션 | 3단계 플로우 설명 | 애니메이션 적용 |
| 2.3.3 | 카카오 로그인 버튼 | 카카오 브랜드 가이드 준수 | OAuth 플로우 연결 |
| 2.3.4 | 반응형 최적화 | 모바일 우선, 데스크톱 대응 | 전 기기 테스트 |

---

## 3. Phase 2: Core Features (Week 3-4)

### Week 3: 프로필 생성

#### Day 1-2: 프로필 입력 폼

| Task ID | Task | 상세 내용 | 완료 조건 |
|---------|------|----------|----------|
| 3.1.1 | 폼 스키마 정의 | Zod 스키마, 유효성 검사 규칙 | 모든 필드 검증 |
| 3.1.2 | 멀티스텝 폼 구현 | 3단계 (사진 → 기본정보 → 취향) | 단계별 진행 |
| 3.1.3 | 사진 업로드 컴포넌트 | 드래그앤드롭, 미리보기, 크롭 | 10MB 제한 |
| 3.1.4 | 취향 키워드 선택기 | 20개 중 3개 선택 | 정확히 3개 선택 |

**폼 스키마:**
```typescript
// src/lib/validations/profile.ts
import { z } from 'zod';

export const profileSchema = z.object({
  photo: z.instanceof(File)
    .refine(f => f.size <= 10 * 1024 * 1024, '10MB 이하만 가능해요')
    .refine(f => ['image/jpeg', 'image/png', 'image/webp'].includes(f.type)),
  age: z.number().min(18).max(99),
  gender: z.enum(['male', 'female']),
  occupationCategory: z.string().min(1),
  bio: z.string().min(10).max(50),
  interestTags: z.array(z.string()).length(3),
  mbti: z.string().length(4).optional(),
  musicGenre: z.string().optional(),
  instagramId: z.string().optional(),
});
```

#### Day 3: 이미지 처리

| Task ID | Task | 상세 내용 | 완료 조건 |
|---------|------|----------|----------|
| 3.2.1 | 클라이언트 블러 미리보기 | Canvas API Gaussian blur | 실시간 미리보기 |
| 3.2.2 | 서버 이미지 처리 | Sharp.js 리사이즈 + 블러 | 원본/블러 저장 |
| 3.2.3 | Supabase Storage 업로드 | 서명된 URL, 경로 구조 | 업로드 성공 |
| 3.2.4 | 이미지 최적화 | WebP 변환, 품질 조정 | 용량 50% 감소 |

**이미지 처리 API:**
```typescript
// src/app/api/images/blur/route.ts
import sharp from 'sharp';

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('image') as File;

  const buffer = Buffer.from(await file.arrayBuffer());

  // 원본 리사이즈
  const original = await sharp(buffer)
    .resize(800, 800, { fit: 'cover' })
    .webp({ quality: 85 })
    .toBuffer();

  // 블러 처리
  const blurred = await sharp(buffer)
    .resize(800, 800, { fit: 'cover' })
    .blur(30)
    .webp({ quality: 80 })
    .toBuffer();

  // Supabase Storage 업로드
  // ...
}
```

#### Day 4-5: 링크 생성 및 공유

| Task ID | Task | 상세 내용 | 완료 조건 |
|---------|------|----------|----------|
| 3.3.1 | 프로필 생성 API | `POST /api/profiles` | DB 저장 성공 |
| 3.3.2 | Short ID 생성 | nanoid(8), 충돌 검사 | 고유 ID 보장 |
| 3.3.3 | 링크 생성 완료 페이지 | 링크 복사, QR 코드, 공유 버튼 | 클립보드 복사 |
| 3.3.4 | 인스타 스토리 공유 | Web Share API, 딥링크 | 인스타 앱 열림 |
| 3.3.5 | 인앱 알림 발송 | 프로필 생성 알림 (소개 대상자) | 알림 수신 |

### Week 4: 블라인드 프로필 뷰어

#### Day 1-2: 프로필 페이지

| Task ID | Task | 상세 내용 | 완료 조건 |
|---------|------|----------|----------|
| 4.1.1 | 동적 라우트 설정 | `/m/[shortId]/page.tsx` | SSR 렌더링 |
| 4.1.2 | 프로필 카드 컴포넌트 | 블러 이미지, 정보 표시 | PRD 디자인 매치 |
| 4.1.3 | 조회수 카운터 | 조회 시 증가, 중복 방지 | 정확한 카운트 |
| 4.1.4 | 카운트다운 타이머 | 실시간 남은 시간 표시 | 0초 시 만료 처리 |
| 4.1.5 | 만료 페이지 | 만료된 링크 안내 | 새 소개 유도 |

**프로필 페이지 구조:**
```typescript
// src/app/m/[shortId]/page.tsx
export default async function BlindProfilePage({
  params
}: {
  params: { shortId: string }
}) {
  const profile = await getProfile(params.shortId);

  if (!profile) {
    return <NotFoundPage />;
  }

  if (isExpired(profile.expiresAt)) {
    return <ExpiredPage />;
  }

  // 조회수 증가 (서버 액션)
  await incrementViewCount(profile.id);

  return <BlindProfileCard profile={profile} />;
}
```

#### Day 3-4: 대화 신청

| Task ID | Task | 상세 내용 | 완료 조건 |
|---------|------|----------|----------|
| 4.2.1 | 대화 신청 버튼 | 로그인 체크, 중복 신청 방지 | 상태별 UI |
| 4.2.2 | 대화 신청 API | `POST /api/chat/request` | chat_room 생성 |
| 4.2.3 | 신청 완료 모달 | 성공 메시지, 다음 단계 안내 | 애니메이션 |
| 4.2.4 | 인앱 알림 | 소개 대상자에게 신청 알림 (헤더 벨 아이콘 배지) | 알림 수신 |

**비즈니스 규칙 검증:**
```typescript
// src/lib/validations/chat-request.ts
export async function validateChatRequest(
  profileId: string,
  requesterId: string
) {
  // 1. 본인 프로필 체크
  const profile = await getProfile(profileId);
  if (profile.creatorId === requesterId) {
    throw new Error('본인 프로필에는 신청할 수 없어요');
  }

  // 2. 중복 신청 체크
  const existing = await getChatRoom(profileId, requesterId);
  if (existing) {
    throw new Error('이미 대화를 신청한 프로필이에요');
  }

  // 3. 일일 신청 한도 체크
  const todayCount = await getTodayRequestCount(requesterId);
  if (todayCount >= 10) {
    throw new Error('오늘은 더 이상 신청할 수 없어요');
  }
}
```

#### Day 5: OG 이미지 및 SEO

| Task ID | Task | 상세 내용 | 완료 조건 |
|---------|------|----------|----------|
| 4.3.1 | 동적 OG 이미지 생성 | `@vercel/og`, 블러 이미지 포함 | 인스타 미리보기 |
| 4.3.2 | 메타데이터 설정 | 제목, 설명, 이미지 | SNS 공유 최적화 |
| 4.3.3 | 구조화된 데이터 | JSON-LD | 검색 노출 |

---

## 4. Phase 3: Chat System (Week 5-6)

### Week 5: 채팅 기반

#### Day 1-2: 대화 신청 관리

| Task ID | Task | 상세 내용 | 완료 조건 |
|---------|------|----------|----------|
| 5.1.1 | 신청 목록 페이지 | 받은 신청 목록, 신청자 블라인드 프로필 | 목록 표시 |
| 5.1.2 | 수락/거절 API | 상태 변경, 타이머 시작 | 상태 업데이트 |
| 5.1.3 | 수락 시 채팅방 활성화 | 48시간 타이머, 양쪽 알림 | 채팅 가능 |
| 5.1.4 | 거절 시 처리 | 정중한 거절 메시지, 채팅방 종료 | 상태 변경 |

**채팅방 상태 머신:**
```
pending → active (수락) → completed/expired
        → rejected (거절)
```

#### Day 3-5: 실시간 채팅

| Task ID | Task | 상세 내용 | 완료 조건 |
|---------|------|----------|----------|
| 5.2.1 | Supabase Realtime 설정 | 채널 구독, 메시지 브로드캐스트 | 실시간 수신 |
| 5.2.2 | 채팅 UI 컴포넌트 | 메시지 목록, 입력창, 읽음 표시 | 반응형 UI |
| 5.2.3 | 메시지 전송 | 텍스트만, 500자 제한 | DB 저장 |
| 5.2.4 | 읽음 처리 | 상대방 확인 시 업데이트 | 실시간 반영 |
| 5.2.5 | 연락처 필터링 | 전화번호, 이메일, SNS 아이디 차단 | 필터 동작 |

**채팅 컴포넌트 구조:**
```
src/components/chat/
├── ChatRoom.tsx              # 채팅방 컨테이너
├── MessageList.tsx           # 메시지 목록 (무한 스크롤)
├── MessageBubble.tsx         # 개별 메시지
├── ChatInput.tsx             # 입력창
├── ChatHeader.tsx            # 상대방 정보, 타이머
├── ProfileRevealButton.tsx   # 공개 요청 버튼
└── ProfileRevealedView.tsx   # 공개 후 프로필 + 대화 주제 제안
```

**Realtime 구독:**
```typescript
// src/hooks/useRealtimeMessages.ts
export function useRealtimeMessages(roomId: string) {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  return messages;
}
```

### Week 6: 프로필 공개 및 알림

#### Day 1-2: 프로필 공개 플로우

| Task ID | Task | 상세 내용 | 완료 조건 |
|---------|------|----------|----------|
| 6.1.1 | 공개 요청 버튼 | 채팅 중 노출, 요청 상태 표시 | 버튼 동작 |
| 6.1.2 | 공개 요청 API | 상대방에게 요청 전송 | 알림 발송 |
| 6.1.3 | 공개 수락 UI | 수락/거절 선택, 확인 다이얼로그 | UI 표시 |
| 6.1.4 | 공개 수락 처리 | 양쪽 프로필 공개, 원본 사진 표시 | 정보 노출 |
| 6.1.5 | SNS 연결 + 대화 주제 | 인스타그램 딥링크, 취향 기반 대화 주제 3개 제안 | 앱 연결, 주제 표시 |

**프로필 공개 후 표시 정보:**
```typescript
interface RevealedProfile {
  name: string;
  originalPhotoUrl: string;  // 블러 해제
  instagramId?: string;
  interestTags?: string[];   // 취향 태그 (대화 주제 생성용)
  mbti?: string;             // MBTI (대화 주제 생성용)
  musicGenre?: string;       // 음악 장르 (대화 주제 생성용)
}
```

#### Day 3-4: 인앱 알림 시스템

| Task ID | Task | 상세 내용 | 완료 조건 |
|---------|------|----------|----------|
| 6.2.1 | Supabase Realtime 알림 | 헤더 벨 아이콘 실시간 배지 업데이트 | 실시간 반영 |
| 6.2.2 | 알림 센터 페이지 | `/notifications` 알림 목록, 읽음 처리 | 목록 표시 |
| 6.2.3 | 알림 타입별 처리 | 각 이벤트별 메시지 포맷 및 링크 | 6개 타입 |
| 6.2.4 | 알림 설정 (선택) | 사용자별 알림 on/off | 설정 저장 |

**알림 이벤트:**
```typescript
enum NotificationType {
  PROFILE_CREATED = 'profile_created',       // 내 프로필이 생성됨
  CHAT_REQUESTED = 'chat_requested',         // 대화 신청 받음
  CHAT_ACCEPTED = 'chat_accepted',           // 신청이 수락됨
  CHAT_REJECTED = 'chat_rejected',           // 신청이 거절됨
  REVEAL_REQUESTED = 'reveal_requested',     // 프로필 공개 요청
  REVEAL_ACCEPTED = 'reveal_accepted',       // 프로필 공개됨
}
```

#### Day 5: 채팅 만료 및 정리

| Task ID | Task | 상세 내용 | 완료 조건 |
|---------|------|----------|----------|
| 6.3.1 | 만료 타이머 표시 | 채팅방 헤더에 카운트다운 | 실시간 업데이트 |
| 6.3.2 | 자동 만료 처리 | pg_cron 또는 Edge Function | 48시간 후 종료 |
| 6.3.3 | 만료 안내 UI | 채팅방 비활성화, 안내 메시지 | UI 변경 |

---

## 5. Phase 4: Dashboard & Polish (Week 7-8)

### Week 7: 주선자 대시보드

#### Day 1-2: 대시보드 페이지

| Task ID | Task | 상세 내용 | 완료 조건 |
|---------|------|----------|----------|
| 7.1.1 | 대시보드 레이아웃 | 카드 그리드, 필터 탭 | 반응형 |
| 7.1.2 | 프로필 링크 카드 | 썸네일, 통계, 상태 배지 | 정보 표시 |
| 7.1.3 | 필터/정렬 | 활성/만료/성공, 최신순 | 필터 동작 |
| 7.1.4 | 상세 통계 | 활성 링크, 총 조회수, 대화 신청, 매칭률(하트 아이콘) | 통계 카드 표시 |

**대시보드 데이터 구조:**
```typescript
interface ProfileStats {
  id: string;
  shortId: string;
  thumbnailUrl: string;
  bio: string;
  viewCount: number;
  chatRequestCount: number;
  activeChatCount: number;
  revealedCount: number;
  status: 'active' | 'expired' | 'completed';
  expiresAt: string;
  createdAt: string;
}
```

#### Day 3-4: 링크 관리 기능

| Task ID | Task | 상세 내용 | 완료 조건 |
|---------|------|----------|----------|
| 7.2.1 | 링크 복사 버튼 | 클립보드 복사, 토스트 알림 | 복사 동작 |
| 7.2.2 | 조기 마감 기능 | 활성 링크 수동 만료 | 상태 변경 |
| 7.2.3 | 링크 삭제 | 확인 다이얼로그, 연관 데이터 처리 | 삭제 완료 |
| 7.2.4 | 링크 재생성 | 동일 정보로 새 링크 생성 | 새 링크 발급 |

#### Day 5: 내 프로필/채팅 목록

| Task ID | Task | 상세 내용 | 완료 조건 |
|---------|------|----------|----------|
| 7.3.1 | 내 프로필 목록 | 다른 사람이 만든 내 프로필 | 목록 표시 |
| 7.3.2 | 채팅 목록 페이지 | 진행 중인 모든 채팅방 | 최신 메시지순 |
| 7.3.3 | 안 읽은 메시지 배지 | 실시간 업데이트 | 카운트 표시 |

### Week 8: 최적화 및 마무리

#### Day 1-2: 성능 최적화

| Task ID | Task | 상세 내용 | 완료 조건 |
|---------|------|----------|----------|
| 8.1.1 | 이미지 최적화 | next/image, lazy loading | LCP < 2.5s |
| 8.1.2 | 코드 스플리팅 | 동적 import, 번들 분석 | 초기 로드 감소 |
| 8.1.3 | API 응답 캐싱 | SWR/React Query, 서버 캐시 | 응답 속도 향상 |
| 8.1.4 | 데이터베이스 인덱스 | 쿼리 분석, 인덱스 추가 | 쿼리 최적화 |

#### Day 3: PWA 설정

| Task ID | Task | 상세 내용 | 완료 조건 |
|---------|------|----------|----------|
| 8.2.1 | manifest.json | 앱 이름, 아이콘, 테마 컬러 | 설치 가능 |
| 8.2.2 | Service Worker | next-pwa, 오프라인 지원 | 캐시 동작 |
| 8.2.3 | 앱 아이콘 | 다양한 사이즈 (192, 512) | 아이콘 표시 |

#### Day 4: 에러 처리 및 모니터링

| Task ID | Task | 상세 내용 | 완료 조건 |
|---------|------|----------|----------|
| 8.3.1 | Sentry 연동 | 에러 트래킹, 소스맵 | 에러 리포트 |
| 8.3.2 | 에러 바운더리 | 전역 에러 처리, 폴백 UI | 에러 핸들링 |
| 8.3.3 | API 에러 표준화 | 에러 코드, 메시지 포맷 | 일관된 응답 |
| 8.3.4 | 로깅 | 주요 이벤트 로깅 | 디버깅 지원 |

#### Day 5: 테스트 및 배포

| Task ID | Task | 상세 내용 | 완료 조건 |
|---------|------|----------|----------|
| 8.4.1 | E2E 테스트 | Playwright, 핵심 플로우 | 테스트 통과 |
| 8.4.2 | 크로스 브라우저 테스트 | Chrome, Safari, Samsung | 호환성 확인 |
| 8.4.3 | 프로덕션 배포 | Vercel, 환경변수 설정 | 배포 완료 |
| 8.4.4 | 도메인 설정 | chinchin.app DNS 설정 | HTTPS 적용 |

---

## 6. 기술적 고려사항

### 6.1 보안

| 항목 | 구현 방법 |
|------|----------|
| XSS 방지 | React 기본 이스케이프, DOMPurify |
| CSRF 방지 | SameSite 쿠키, 토큰 검증 |
| SQL Injection | Supabase 파라미터화 쿼리 |
| Rate Limiting | Vercel Edge Middleware |
| 연락처 필터링 | 정규식 패턴 매칭 |

### 6.2 연락처 필터링 정규식

```typescript
const CONTACT_PATTERNS = [
  /\d{3}[-.\s]?\d{4}[-.\s]?\d{4}/g,  // 전화번호
  /\d{2,3}[-.\s]?\d{3,4}[-.\s]?\d{4}/g,  // 전화번호 변형
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,  // 이메일
  /@[a-zA-Z0-9_]{1,30}/g,  // 인스타 ID
  /카[카톡|톡]/gi,  // 카카오톡 언급
  /인스타/gi,  // 인스타 언급
];

export function filterContactInfo(text: string): string {
  let filtered = text;
  CONTACT_PATTERNS.forEach(pattern => {
    filtered = filtered.replace(pattern, '[연락처 정보가 삭제되었어요]');
  });
  return filtered;
}
```

### 6.3 데이터 자동 정리

```sql
-- pg_cron 작업: 매 시간 실행
SELECT cron.schedule(
  'expire-profiles',
  '0 * * * *',
  $$
    UPDATE profiles
    SET is_active = FALSE
    WHERE expires_at < NOW() AND is_active = TRUE;

    UPDATE chat_rooms
    SET status = 'expired'
    WHERE expires_at < NOW() AND status = 'active';
  $$
);

-- 30일 지난 데이터 삭제 (선택)
SELECT cron.schedule(
  'cleanup-old-data',
  '0 3 * * *',
  $$
    DELETE FROM messages
    WHERE created_at < NOW() - INTERVAL '30 days';
  $$
);
```

---

## 7. 테스트 전략

### 7.1 테스트 범위

| 유형 | 도구 | 대상 |
|------|------|------|
| Unit Test | Vitest | 유틸 함수, 훅 |
| Integration Test | Vitest + MSW | API 라우트 |
| E2E Test | Playwright | 핵심 사용자 플로우 |
| Visual Test | Chromatic | UI 컴포넌트 |

### 7.2 핵심 E2E 시나리오

```typescript
// tests/e2e/profile-flow.spec.ts
test('주선자가 프로필을 생성하고 공유한다', async ({ page }) => {
  // 1. 카카오 로그인
  await page.goto('/login');
  await page.click('[data-testid="kakao-login"]');
  // ... OAuth mock

  // 2. 프로필 생성
  await page.goto('/create');
  await page.setInputFiles('[data-testid="photo-input"]', 'test.jpg');
  await page.fill('[data-testid="age-input"]', '26');
  // ... 나머지 입력

  // 3. 링크 생성 확인
  await page.click('[data-testid="create-button"]');
  await expect(page.locator('[data-testid="share-link"]')).toBeVisible();
});
```

---

## 체크리스트 요약

### Phase 1 (Week 1-2) ✅
- [x] Supabase 프로젝트 및 DB 스키마
- [x] 카카오 OAuth 로그인
- [x] 디자인 시스템 및 UI 컴포넌트
- [x] 랜딩 페이지

### Phase 2 (Week 3-4) ✅
- [x] 프로필 생성 폼 (멀티스텝)
- [x] 이미지 블러 처리
- [x] 블라인드 프로필 페이지
- [x] 대화 신청 기능

### Phase 3 (Week 5-6) ✅
- [x] 대화 수락/거절
- [x] 실시간 채팅
- [x] 프로필 공개 플로우
- [x] 인앱 알림 (Supabase Realtime)

### Phase 4 (Week 7-8) ✅
- [x] 주선자 대시보드
- [x] PWA 설정
- [x] Vercel 프로덕션 배포
- [x] UI/UX 개선 (소셜 프루프, 에러 바운더리, 반응형 최적화)

### Phase 5 (추가 개선) ✅
- [x] 인스타 스토리 공유 UX 개선
- [x] 알림 벨 아이콘 헤더 우측 이동
- [x] 프로필 삭제 버그 수정 (하드 삭제)
- [x] 아이콘 및 로고 이미지 교체
- [x] UI/UX 폴리싱 (rounded-3xl 카드, 향상된 버튼 스타일, 소셜 프루프 배지)

### Phase 6 (보안 및 품질 개선) ✅
- [x] 글로벌 error.tsx 에러 바운더리 추가
- [x] 인증 콜백 IP 기반 Rate Limiting (분당 10회)
- [x] blind-profile-view `<img>` → `next/image` 전환 (성능 최적화)
- [x] 카카오 콜백 디버그 console.log 19개 제거
- [x] PRD/구현계획서 카카오톡 → 인앱 알림 문서 동기화

### Phase 7 (디자인 시스템 대규모 개선) ✅
- [x] Pretendard 폰트 적용 (Noto Sans KR → CDN Pretendard)
- [x] 10단계 gray 스케일 + 시맨틱 컬러 토큰 (WCAG AA 4.6:1)
- [x] 타이포그래피 개선 (자간 -0.02em~-0.03em, lineHeight 162%)
- [x] inset border 카드 시스템 (shadow-card-border, 당근 SEED 패턴)
- [x] 그림자 시스템 세분화 (soft/medium/strong/card-border/card-border-hover)
- [x] 애니메이션 확장 (slideDown, scaleIn, prefers-reduced-motion)
- [x] 코어 컴포넌트 업그레이드 (Card 16px, Button soft variant, Input glow focus, Tag 채움 선택, Avatar ring+shadow)
- [x] 레이아웃 개선 (Header/BottomNav shadow 기반, blur 16px, 활성 dot 인디케이터)
- [x] 랜딩페이지 (85vh hero, 토스식 여백/타이포, 스크롤 애니메이션)
- [x] 프로필 생성 (연픽식 리니어 프로그레스 바, 간결한 스텝 헤더)
- [x] 대시보드 (2열 통계 grid, 썸네일 확대, 필터칩 snap-x)
- [x] 채팅 (그래디언트 버블, 인풋/헤더 터치타겟 44px)
- [x] 접근성 (prefers-reduced-motion, WCAG AA 대비, 44px 터치타겟)
- [x] Vercel 프로덕션 배포 완료

### Phase 8 (홈페이지 대규모 개선) ✅
- [x] 히어로: framer-motion 순차 등장 애니메이션 (뱃지, 로고, 텍스트, CTA staggered)
- [x] 히어로: 플로팅 하트 배경 + 핑크 그라데이션 + 하단 페이드 트랜지션
- [x] 히어로: 로그인 상태별 CTA 분기 (카카오 로그인 / 친구 소개하기)
- [x] "먼저 둘러보기" 버튼 제거
- [x] 신규 섹션: 블라인드 프로필 미리보기 (가로 무한 순환 마키 캐러셀)
- [x] 신규 섹션: 매칭 성공 후기 4건 (fade-up staggered)
- [x] 신규 섹션: 숫자로 보는 친친 (카운트업 애니메이션 + useInView)
- [x] 신규 섹션: 기존 소개팅앱 vs 친친 비교표 (Check/X 아이콘)
- [x] 신규 섹션: FAQ 아코디언 5문항 (ChevronDown 회전)
- [x] 하단 CTA: 카드형 리디자인 (코랄 그라데이션 + 장식 원형 + 흰색 버튼)
- [x] 전체 섹션 스크롤 트리거 애니메이션 (whileInView, viewport once)
- [x] 피처 카드 hover scale 효과, 스텝 slide-in-left 애니메이션
- [x] Vercel 프로덕션 배포 완료

### Phase 9 (모바일 버그 수정) ✅
- [x] 모바일 Safari 하트 애니메이션 멈춤 수정: Framer Motion(JS) → CSS @keyframes + will-change-transform
- [x] CTA/헤더 로딩 지연 수정: skeleton 제거, 기본 상태 즉시 렌더링
- [x] 채팅 탭 홈 이동 버그 수정: `<Link href="#">` → null, 링크 없는 카드는 Link 없이 렌더링
- [x] auth 버튼 깜빡임(FOUC) 수정: isLoading 동안 opacity-0, auth 완료 시 fade-in
- [x] Framer Motion opacity 충돌 해결: motion.div 내부에 별도 div wrapper 추가
- [x] Vercel 프로덕션 배포 완료

### Phase 10 (기술 문제점 일괄 수정) ✅
- [x] P0: `listUsers()` 전체 조회 제거 → `generateLink().user.id`로 교체 (보안+성능)
- [x] P0: view_count/chat_request_count race condition → Supabase RPC atomic increment 함수로 교체
- [x] P0: view_count 미실행 버그 수정 (`void supabase.rpc()`)
- [x] P1: useAuth N+1 API 호출 → AuthContext 단일 fetch로 통합
- [x] P1: rate limiter serverless 한계점 문서화 (향후 Upstash Redis TODO)
- [x] P2: notification insert 에러 로깅 추가 (5개소)
- [x] P2: count 비교 로직 수정 (`count !== null && count >=`)
- [x] P2: login 페이지 dead code (sessionStorage) 제거
- [x] SQL migration: `006_increment_functions.sql` 생성
- [x] Vercel 프로덕션 배포 완료

### Phase 11 (소개 플로우 전면 개편 — 초대 기반 + 셀프 프로필) ✅
- [x] `invitations` 테이블 + RLS 정책 생성 (`007_invitations.sql`)
- [x] `profiles` 테이블에 `matchmaker_id`, `invitation_id` 컬럼 추가
- [x] `database.ts` 타입 업데이트 (`Invitation` 타입 + Profile 컬럼)
- [x] `constants.ts`에 `INVITATION_EXPIRY_DAYS`, `MAX_DAILY_INVITATIONS` 추가
- [x] 이미지 처리 공유 유틸 추출 (`src/lib/image-processing.ts`)
- [x] Flow A (초대): `/create/invite` → 초대 생성 → `/create/invite/complete`
- [x] Flow A (초대): `/invite/[inviteCode]` → 친구 프로필 작성 (public, 로그인 후 3스텝 폼)
- [x] Flow A (초대): 프로필 작성 완료 시 invitation status → completed, 주선자 알림
- [x] Flow A (초대): 대시보드에서 activateAndShare → profile is_active=true, 24h 타이머 시작
- [x] Flow B (셀프): `/create/self` → 3스텝 폼 → `/create/self/complete`
- [x] Flow B (셀프): 즉시 활성화 (is_active=true, 24h 타이머)
- [x] `/create` → 선택 허브 (초대 vs 셀프) 전환
- [x] `/dashboard` → 두 탭 구조 (내가 초대한 / 내 프로필)
- [x] `requestChat`에 matchmaker 대화신청 차단 로직 추가
- [x] BottomNav `/invite/` 경로 숨김
- [x] Tag 컴포넌트 `success`/`warning` variant 추가
- [x] 랜딩 CTA 문구 "시작하기"로 변경
- [x] 기존 `create/actions.ts`, `create/complete/page.tsx` 삭제
- [x] Vercel 프로덕션 배포 완료

### Phase 12 (버그 수정 — 차단관리, 헤더, 초대자 차단) ✅
- [x] `getBlockedUsers` RLS 버그 수정 — `createAdminClient`로 users join 우회
- [x] 헤더 프로필 사진 버튼 제거, 알림 벨만 남김
- [x] 초대 페이지에서 초대자 본인 프로필 작성 클라이언트 차단
- [x] Vercel 프로덕션 배포 완료

### Phase 13 (보안 감사 및 취약점 수정) ✅
- [x] OAuth CSRF 보호: state 파라미터 생성/검증 추가 (login, callback)
- [x] client_secret 빈 문자열 폴백 제거 (환경변수 미설정 시 즉시 에러)
- [x] Open Redirect 방지: middleware redirect 파라미터 검증
- [x] 보안 헤더 추가 (HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, X-XSS-Protection)
- [x] HTTP 이미지 설정 제거 (Kakao CDN HTTPS만 허용)
- [x] 초대 RLS `USING(TRUE)` 전체 공개 정책 제거
- [x] 알림 INSERT RLS 강화 (타인에게만 생성 가능)
- [x] `increment_chat_request_count` 함수 권한 검증 추가
- [x] Vercel 프로덕션 배포 완료
- [ ] (수동) Supabase에서 `008_security_fixes.sql` 마이그레이션 실행 필요

### Phase 14 (차단관리 수정 + 이용약관/개인정보 + 다중 사진/블러 선택) ✅
- [x] 차단 관리 오류 수정: Kakao CDN 와일드카드(`**.kakaocdn.net`) + null safety
- [x] `/terms` 서비스 이용약관 페이지 생성 (11개 조항)
- [x] `/privacy` 개인정보 처리방침 페이지 생성 (10개 섹션)
- [x] DB: `profiles.photos JSONB` 컬럼 추가 마이그레이션 (`009_multi_photos.sql`)
- [x] 타입/유효성검사: `ProfilePhoto` 타입 + 다중 사진 Zod 스키마 (최대 5장, 블러 선택)
- [x] 이미지 처리: `processAndUploadProfileImages()` — 블러 on/off 조건부 처리
- [x] 사진 업로드 UI: 3열 그리드 + 사진별 블러 토글 + 드래그 앤 드롭
- [x] 서버 액션: `create/self/actions.ts`, `invite/actions.ts` 다중 사진 대응
- [x] 사진 캐러셀: `PhotoCarousel` 컴포넌트 (scroll-snap 기반)
- [x] 프로필 표시: `blind-profile-view`, `chat-request-detail` 캐러셀 적용
- [x] 프로필 공개: `acceptProfileReveal`에서 `photos` 데이터 반환
- [x] Vercel 프로덕션 배포 완료
- [ ] (수동) Supabase에서 `009_multi_photos.sql` 마이그레이션 실행 필요

---

**Document End**

*Created: 2026-02-03*
