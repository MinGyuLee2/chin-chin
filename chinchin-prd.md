# 친친 (ChinChin) - Product Requirements Document

> **Version**: 1.0.0  
> **Last Updated**: 2026-02-11
> **Status**: MVP Deployed  
> **Target Platform**: Web (Mobile-first PWA)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Product Vision & Strategy](#3-product-vision--strategy)
4. [User Personas](#4-user-personas)
5. [User Stories & Acceptance Criteria](#5-user-stories--acceptance-criteria)
6. [Functional Requirements](#6-functional-requirements)
7. [Non-Functional Requirements](#7-non-functional-requirements)
8. [Technical Architecture](#8-technical-architecture)
9. [Database Schema](#9-database-schema)
10. [API Specifications](#10-api-specifications)
11. [UI/UX Specifications](#11-uiux-specifications)
12. [Security & Privacy](#12-security--privacy)
13. [Analytics & Metrics](#13-analytics--metrics)
14. [Release Plan](#14-release-plan)
15. [Risk Assessment](#15-risk-assessment)

---

## 1. Executive Summary

### 1.1 Product Overview

**친친(ChinChin)**은 인스타그램 스토리를 통해 친구를 소개하는 블라인드 소개팅 웹 서비스입니다. 주선자가 친구의 블라인드 프로필 링크를 생성하고 SNS에 공유하면, 관심 있는 사람이 익명 채팅을 통해 대화를 나누고, 서로 마음에 들면 프로필을 공개하여 실제 만남으로 이어지는 서비스입니다.

### 1.2 Key Value Propositions

| Value | Description |
|-------|-------------|
| **Zero Friction** | 앱 설치 불필요, 웹 링크 클릭만으로 서비스 이용 |
| **Trust-based** | 데이팅 앱의 낯선 사람이 아닌 친구가 보증하는 신뢰 기반 매칭 |
| **Personality First** | 외모가 아닌 대화를 통해 먼저 알아가는 블라인드 매칭 |
| **Viral by Design** | 인스타 스토리 공유를 통한 자연스러운 바이럴 확산 |

### 1.3 Success Metrics (KPIs)

| Metric | Target (Month 1) | Target (Month 3) |
|--------|------------------|------------------|
| Weekly Active Link Creation | 50 | 200 |
| Link → Chat Request Conversion | 10% | 15% |
| Chat → Profile Reveal Conversion | 40% | 50% |
| User Retention (7-day) | 30% | 45% |

### 1.4 Development Scope

**In Scope (MVP)**:
- 카카오 로그인
- 블라인드 프로필 링크 생성
- 익명 채팅
- 프로필 공개 시스템
- 주선자 대시보드
- 인앱 알림 (Supabase Realtime)

**Out of Scope (Post-MVP)**:
- 리워드 시스템
- AI 매칭 추천
- 커뮤니티 기능
- 프리미엄 프로필 꾸미기

---

## 2. Problem Statement

### 2.1 Current Pain Points

**For Matchmakers (주선자)**:
- 직접 소개팅 주선 시 결과에 대한 심리적 부담
- 양쪽의 취향을 정확히 파악하기 어려움
- 소개 후 관리까지 해야 하는 피로감
- 거절당하면 어색해지는 관계

**For Singles**:
- 데이팅 앱은 외모/스펙 중심으로 피로감
- 낯선 사람에 대한 불신
- 첫 대면의 어색함과 부담
- 자신이 노출되는 것에 대한 프라이버시 우려

### 2.2 Market Opportunity

| Segment | Existing Solution | Gap |
|---------|-------------------|-----|
| 데이팅 앱 | 틴더, 범블 | 신뢰도 낮음, 외모 중심 |
| 소개팅 앱 | 블라인드, 정오의 데이트 | 앱 설치 필요, 알고리즘 의존 |
| 지인 소개 | 직접 주선 | 부담감 높음, 관리 필요 |
| **친친** | - | 웹 기반, 바이럴, 블라인드, 주선자 중심 |

---

## 3. Product Vision & Strategy

### 3.1 Vision Statement

> "인스타 스토리 하나로 친구를 소개하는 가장 쉬운 방법"

### 3.2 Product Principles

| Principle | Description | Implementation |
|-----------|-------------|----------------|
| **앱 설치는 필요 없다** | 웹 링크만으로 모든 것이 해결 | PWA, Deep linking |
| **대화가 먼저, 얼굴은 나중에** | 블라인드로 시작, 대화 후 공개 | Image blur, Progressive disclosure |
| **주선자가 스타다** | 주선자가 직접 홍보하고 보상받음 | Dashboard, Reward system |
| **24시간의 긴장감** | FOMO를 활용한 행동 유도 | Link expiration, Countdown |
| **프라이버시 최우선** | 단계적 정보 공개, 완전 익명 채팅 | Anonymous chat, Consent-based reveal |

### 3.3 Competitive Differentiation

| Feature | 친친 | 틴더/범블 | 전통 소개팅 |
|---------|------|----------|------------|
| 앱 설치 | ❌ 불필요 | ✅ 필요 | ❌ 불필요 |
| 신뢰도 | 친구 보증 | 프로필만 | 소개자 보증 |
| 첫 접촉 | 익명 채팅 | 사진 스와이프 | 대면 만남 |
| 바이럴 | SNS 자연 확산 | 광고 의존 | 입소문 |
| 부담감 | 낮음 | 중간 | 높음 |

---

## 4. User Personas

### 4.1 Primary Persona: 주선자 (Matchmaker)

```yaml
Name: 이서윤
Age: 26
Occupation: 브랜드 마케터
Relationship: 연애 중 (8개월)
Social: 인스타 팔로워 800명, 스토리 자주 올림

Goals:
  - 싱글인 친한 친구가 좋은 사람 만나길 바람
  - 직접 조율하지 않고 편하게 소개하고 싶음
  - 매칭 성공 시 뿌듯함을 느끼고 싶음

Pain Points:
  - 직접 소개팅 주선의 부담감
  - 양쪽 친구 취향 파악의 어려움
  - 소개 후 관리의 피로

Behaviors:
  - 하루 인스타 스토리 2-3개 올림
  - 친구들 근황에 관심 많음
  - 트렌디한 서비스에 호기심

Success Scenario:
  "5분 만에 민지 프로필 링크 만들고 스토리에 올렸는데,
   일주일 만에 매칭 성공해서 민지한테 고맙다고 연락 왔어!"
```

### 4.2 Secondary Persona: 관심자 (Interested Party)

```yaml
Name: 박준호
Age: 28
Occupation: IT 스타트업 개발자
Relationship: 싱글 (6개월)
Social: 인스타는 주로 보기만

Goals:
  - 자연스러운 만남의 기회
  - 외모로 먼저 판단받지 않고 싶음
  - 부담 없이 대화해보고 싶음

Pain Points:
  - 데이팅 앱의 외모 중심 피로감
  - 첫 대면의 어색함
  - 공통 관심사 없이 대화 시작의 어려움

Success Scenario:
  "아는 형 스토리에서 링크 봤는데, 취향이 비슷해 보여서
   대화 신청했더니 진짜 잘 맞아서 다음 주에 만나기로 했어!"
```

### 4.3 Tertiary Persona: 소개 대상자 (Profile Subject)

```yaml
Name: 김민지
Age: 26
Occupation: 프로덕트 디자이너
Relationship: 싱글 (1년 넘음)

Goals:
  - 친구의 도움으로 좋은 사람 만나고 싶음
  - 프라이버시는 지키면서 소개받고 싶음
  - 대화해보고 괜찮은 사람만 만나고 싶음

Pain Points:
  - 직접 소개팅은 거절하기 미안함
  - 누가 내 프로필을 보는지 모르는 불안
  - 소개받는다는 것이 부끄러움

Success Scenario:
  "서윤이가 링크 만들어줬는데, 대화해보니까 진짜 잘 맞는 사람이어서
   프로필 공개하고 인스타로 대화 이어가고 있어!"
```

---

## 5. User Stories & Acceptance Criteria

### 5.1 Epic 1: 인증 (Authentication)

#### US-1.1: 카카오 로그인

```gherkin
As a 사용자
I want to 카카오 계정으로 간편하게 로그인하고 싶다
So that 별도 회원가입 없이 서비스를 이용할 수 있다

Acceptance Criteria:
  Given 사용자가 친친 웹사이트에 접속했을 때
  When "카카오톡으로 시작하기" 버튼을 클릭하면
  Then 카카오 로그인 화면으로 이동한다
  And 로그인 성공 시 서비스 메인 화면으로 리다이렉트된다
  And 사용자 정보(닉네임, 프로필 이미지)가 저장된다

Technical Notes:
  - Kakao OAuth 2.0 사용
  - 필수 스코프: profile_nickname, profile_image
  - JWT 토큰 발급 후 httpOnly 쿠키에 저장
```

#### US-1.2: 세션 유지

```gherkin
As a 로그인한 사용자
I want to 브라우저를 닫아도 로그인 상태가 유지되길 원한다
So that 매번 로그인하지 않아도 된다

Acceptance Criteria:
  Given 사용자가 로그인한 상태에서
  When 브라우저를 닫고 다시 접속하면
  Then 로그인 상태가 유지된다
  And 토큰 만료 시 자동으로 갱신된다
  And 30일 이상 미접속 시 재로그인을 요청한다
```

### 5.2 Epic 2: 프로필 링크 생성 (Profile Link Creation)

#### US-2.1: 프로필 정보 입력

```gherkin
As a 주선자
I want to 친구의 프로필 정보를 입력하고 싶다
So that 블라인드 프로필 링크를 생성할 수 있다

Acceptance Criteria:
  Given 주선자가 로그인한 상태에서
  When "친구 소개하기" 버튼을 클릭하면
  Then 프로필 입력 폼이 표시된다

  Required Fields:
    - 사진 (최대 5장, 사진별 블러 선택 가능)
    - 나이 (18-99)
    - 성별 (남/여)
    - 직업 카테고리 (드롭다운)
    - 한 줄 소개 (10-50자)
    - 취향 키워드 (3개 선택)

  Optional Fields:
    - MBTI
    - 좋아하는 음악 장르
    - 인스타그램 ID (공개용)

Validation Rules:
  - 사진: 최소 1장~최대 5장, 장당 최대 10MB, jpg/png/webp
  - 나이: 숫자만, 18-99 범위
  - 한 줄 소개: 10자 이상 50자 이하
  - 키워드: 정확히 3개 선택
```

#### US-2.2: 이미지 블러 처리 (선택적)

```gherkin
As a 프로필 작성자
I want to 사진별로 블러 적용 여부를 선택하고 싶다
So that 원하는 사진만 블라인드 처리하고 나머지는 즉시 공개할 수 있다

Acceptance Criteria:
  Given 사용자가 사진을 업로드했을 때
  When 각 사진 하단의 블러 토글을 ON/OFF하면
  Then 블러 ON: 서버에서 blur 처리 후 프로필 공개 전까지 블러 표시
  And 블러 OFF: 원본 이미지가 즉시 모두에게 공개됨
  And 블러 강도는 얼굴이 식별 불가능한 수준이다

Technical Notes:
  - 서버: Sharp.js로 블러 처리 (조건부, blurEnabled=true일 때만)
  - 블러 반경: 30px gaussian blur
  - DB: profiles.photos JSONB [{url, originalUrl, blurEnabled}]
  - 기존 photo_url/original_photo_url은 첫 번째 사진과 동기화 (하위 호환)
```

#### US-2.3: 링크 생성

```gherkin
As a 주선자
I want to 고유한 공유 링크를 생성하고 싶다
So that 인스타 스토리에 올릴 수 있다

Acceptance Criteria:
  Given 주선자가 프로필 정보를 모두 입력했을 때
  When "링크 생성하기" 버튼을 클릭하면
  Then 고유 링크가 생성된다 (예: chinchin.app/m/abc123)
  And 링크 유효기간은 24시간이다
  And 만료 시간이 카운트다운으로 표시된다
  And "인스타 스토리로 공유" 버튼이 표시된다
  And 인앱 알림이 발송된다

Link Format:
  - Base URL: https://chinchin.app/m/
  - ID: nanoid(8) - 영문 소문자 + 숫자
  - Example: chinchin.app/m/a1b2c3d4
```

### 5.3 Epic 3: 블라인드 프로필 뷰어 (Profile Viewer)

#### US-3.1: 프로필 페이지 조회

```gherkin
As a 관심자
I want to 링크를 클릭하면 블라인드 프로필을 볼 수 있다
So that 대화 신청 여부를 결정할 수 있다

Acceptance Criteria:
  Given 유효한 프로필 링크를 클릭했을 때
  When 페이지가 로드되면
  Then 블라인드 프로필 카드가 풀스크린으로 표시된다

  Displayed Information:
    - 블러 처리된 사진
    - 나이, 성별
    - 직업 카테고리
    - 한 줄 소개
    - 취향 키워드 3개
    - MBTI (입력된 경우)
    - 조회수
    - 남은 시간 (카운트다운)

  And 만료된 링크는 "이 소개는 마감되었어요" 페이지 표시
  And 조회 시 view_count가 1 증가한다
```

#### US-3.2: 대화 신청

```gherkin
As a 관심자
I want to 마음에 드는 프로필에 대화를 신청하고 싶다
So that 익명 채팅을 시작할 수 있다

Acceptance Criteria:
  Given 블라인드 프로필을 보고 있을 때
  When "대화 신청하기" 버튼을 클릭하면
  Then 카카오 로그인 화면으로 이동한다 (미로그인 시)
  And 로그인 후 대화 신청이 완료된다
  And "대화 요청을 보냈어요!" 메시지가 표시된다
  And 소개 대상자에게 인앱 알림이 발송된다

Business Rules:
  - 동일 프로필에 대한 중복 신청 불가
  - 본인 프로필에는 신청 불가
  - 1일 최대 10개 프로필에 신청 가능
```

### 5.4 Epic 4: 익명 채팅 (Anonymous Chat)

#### US-4.1: 대화 수락/거절

```gherkin
As a 소개 대상자
I want to 대화 신청을 수락하거나 거절하고 싶다
So that 원하는 사람과만 대화할 수 있다

Acceptance Criteria:
  Given 대화 신청 알림을 받았을 때
  When 알림을 클릭하면
  Then 신청자의 블라인드 프로필이 표시된다
  And "수락" / "거절" 버튼이 표시된다

  When "수락"을 클릭하면
  Then 채팅방이 활성화된다
  And 양쪽에 인앱 알림이 발송된다
  And 48시간 타이머가 시작된다

  When "거절"을 클릭하면
  Then 신청자에게 정중한 거절 메시지가 전송된다
  And 채팅방이 종료된다
```

#### US-4.2: 실시간 채팅

```gherkin
As a 채팅 참여자
I want to 실시간으로 메시지를 주고받고 싶다
So that 상대방과 대화할 수 있다

Acceptance Criteria:
  Given 채팅방이 활성화된 상태에서
  When 메시지를 입력하고 전송하면
  Then 메시지가 즉시 상대방에게 전달된다
  And 읽음 표시가 업데이트된다
  And 새 메시지 발생 시 인앱 알림이 발송된다

  Chat Features:
    - 텍스트 메시지 (최대 500자)
    - 이모지 지원
    - 읽음 표시
    - 시간 표시

  Restrictions:
    - 사진/파일 전송 불가
    - 링크 전송 불가
    - 연락처 정보 자동 차단

Technical Notes:
  - Supabase Realtime 사용
  - 메시지 암호화 전송 (TLS)
  - 채팅방 48시간 후 자동 만료
```

#### US-4.3: 프로필 공개 요청

```gherkin
As a 채팅 참여자
I want to 대화가 잘 통하면 프로필 공개를 요청하고 싶다
So that 실제 정보를 교환할 수 있다

Acceptance Criteria:
  Given 채팅 중인 상태에서
  When "프로필 공개 요청" 버튼을 클릭하면
  Then 상대방에게 공개 요청 알림이 전송된다

  When 상대방이 수락하면
  Then 양쪽에 실제 프로필이 공개된다
    - 선명한 원본 사진
    - 실명 (입력된 경우)
    - 인스타그램 ID
  And 채팅방에 축하 메시지가 표시된다
  And 인스타 연결 버튼 + 취향 기반 대화 주제 제안이 표시된다

  When 상대방이 거절하면
  Then "아직 더 대화하고 싶어요" 메시지가 전송된다
  And 대화는 계속 가능하다
```

### 5.5 Epic 5: 주선자 대시보드 (Dashboard)

#### US-5.1: 링크 관리

```gherkin
As a 주선자
I want to 내가 만든 링크들의 현황을 보고 싶다
So that 성과를 확인하고 관리할 수 있다

Acceptance Criteria:
  Given 주선자가 로그인한 상태에서
  When 대시보드 페이지에 접속하면
  Then 내가 만든 모든 프로필 링크 목록이 표시된다

  Per Link Information:
    - 프로필 썸네일 (블러)
    - 한 줄 소개
    - 조회수
    - 대화 신청 수
    - 진행 중인 대화 수
    - 프로필 공개 성공 여부
    - 남은 시간 또는 만료 상태
    - 통계 보기 버튼
    - 조기 마감 버튼 (활성 링크만)

Sorting:
  - 기본: 생성일 역순
  - 필터: 활성/만료/성공
```

---

## 6. Functional Requirements

### 6.1 Feature Priority Matrix

| Feature | Priority | Status | Dependencies |
|---------|----------|--------|--------------|
| 카카오 로그인 | P0 | MVP | Kakao SDK |
| 프로필 링크 생성 | P0 | MVP | 카카오 로그인 |
| 이미지 블러 처리 | P0 | MVP | Sharp.js |
| 블라인드 프로필 뷰어 | P0 | MVP | 프로필 링크 |
| 대화 신청 | P0 | MVP | 카카오 로그인 |
| 익명 채팅 | P0 | MVP | Supabase Realtime |
| 프로필 공개 | P0 | MVP | 익명 채팅 |
| 인앱 알림 | P0 | MVP | Supabase Realtime |
| 주선자 대시보드 | P0 | MVP | 프로필 링크 |
| 링크 자동 만료 | P0 | MVP | Cron job |
| 신고/차단 | P1 | Week 2 | 익명 채팅 |
| 리워드 시스템 | P2 | Post-MVP | - |

### 6.2 Business Rules

#### BR-1: 링크 생성 제한
```yaml
Rule: 동일 사용자가 1일 최대 10개의 프로필 링크 생성 가능
Rationale: 스팸 방지 및 품질 유지
Enforcement: 서버 사이드 검증
Error Message: "오늘은 더 이상 링크를 만들 수 없어요. 내일 다시 시도해주세요!"
```

#### BR-2: 대화 신청 제한
```yaml
Rule: 동일 프로필에 대한 중복 대화 신청 불가
Rationale: 스팸 방지
Enforcement: DB unique constraint + 서버 검증
Error Message: "이미 대화를 신청한 프로필이에요"
```

#### BR-3: 링크 유효 기간
```yaml
Rule: 프로필 링크는 생성 후 24시간 후 자동 만료
Rationale: 긴급함 유발, 데이터 관리
Enforcement: expires_at 필드 + Cron job
```

#### BR-4: 채팅방 유효 기간
```yaml
Rule: 채팅방은 활성화 후 48시간 후 자동 만료
Rationale: 의사결정 유도, 리소스 관리
Enforcement: expires_at 필드 + Cron job
```

---

## 7. Non-Functional Requirements

### 7.1 Performance Requirements

| Metric | Target | Measurement |
|--------|--------|-------------|
| Page Load Time (LCP) | < 2.5s | Lighthouse |
| Time to Interactive (TTI) | < 3.5s | Lighthouse |
| First Contentful Paint (FCP) | < 1.8s | Lighthouse |
| API Response Time (p95) | < 500ms | Server logs |
| WebSocket Latency | < 100ms | Monitoring |
| Image Load Time | < 1s | Network tab |

### 7.2 Scalability Requirements

```yaml
Initial Capacity:
  Concurrent Users: 1,000
  Daily Active Users: 5,000
  Messages per Day: 50,000
  Storage: 50GB

Growth Target (6 months):
  Concurrent Users: 10,000
  Daily Active Users: 50,000
  Messages per Day: 500,000
  Storage: 500GB
```

### 7.3 Availability Requirements

```yaml
Target Uptime: 99.5%
Planned Maintenance: < 1 hour/month (0:00-5:00 KST)
Recovery Time Objective (RTO): < 1 hour
Recovery Point Objective (RPO): < 1 hour
```

### 7.4 Security Requirements

```yaml
Authentication:
  - OAuth 2.0 (Kakao)
  - JWT tokens (httpOnly cookies)
  - Token refresh mechanism

Data Protection:
  - TLS 1.3 for all communications
  - Encrypted storage for sensitive data
  - GDPR-compliant data handling

Access Control:
  - Row Level Security (Supabase)
  - Role-based permissions
  - Rate limiting (per IP, per user)
```

### 7.5 Compatibility Requirements

```yaml
Browsers:
  - Chrome 90+ (Primary)
  - Safari 14+ (Primary - iOS)
  - Samsung Internet 15+
  - Firefox 88+
  - Edge 90+

Devices:
  - iOS 14+
  - Android 10+
  - Desktop (1280px+)

Screen Sizes:
  - Mobile: 320px - 480px (Primary)
  - Tablet: 481px - 1024px
  - Desktop: 1025px+
```

---

## 8. Technical Architecture

### 8.1 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Mobile    │  │   Desktop   │  │    PWA      │             │
│  │   Browser   │  │   Browser   │  │  (Cached)   │             │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘             │
│         └────────────────┼────────────────┘                     │
│                          ▼                                      │
│              ┌───────────────────────┐                          │
│              │    Next.js App        │                          │
│              │  (React + TypeScript) │                          │
│              └───────────────────────┘                          │
└─────────────────────────────────────────────────────────────────┘
                           │ HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Edge Layer (Vercel)                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   CDN       │  │   Edge      │  │   Image     │             │
│  │   Cache     │  │   Functions │  │   Optimize  │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
                           │ HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Backend Layer (Supabase)                     │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  PostgreSQL │  │   Realtime  │  │   Storage   │             │
│  │  Database   │  │  WebSocket  │  │   (S3)      │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │    Auth     │  │    Edge     │  │   pg_cron   │             │
│  │   (JWT)     │  │  Functions  │  │  (Scheduler)│             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
                           │ HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                     External Services                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐                              │
│  │   Kakao     │  │   Sentry    │                              │
│  │   OAuth     │  │   (Error)   │                              │
│  └─────────────┘  └─────────────┘                              │
└─────────────────────────────────────────────────────────────────┘
```

### 8.2 Technology Stack

| Layer | Technology | Version | Rationale |
|-------|------------|---------|-----------|
| **Frontend** ||||
| Framework | Next.js | 14.x | App Router, SSR, Edge |
| Language | TypeScript | 5.x | Type safety |
| Styling | Tailwind CSS | 3.x | Utility-first |
| Components | shadcn/ui | latest | Accessible |
| Animation | Framer Motion | 10.x | Smooth transitions |
| State | Zustand | 4.x | Simple, lightweight |
| Forms | React Hook Form | 7.x | Performance |
| Validation | Zod | 3.x | Type-safe schemas |
| **Backend** ||||
| Database | Supabase (PostgreSQL) | 15.x | Realtime, Auth |
| Auth | Supabase Auth + Kakao | - | OAuth |
| Storage | Supabase Storage | - | S3-compatible |
| Realtime | Supabase Realtime | - | WebSocket |
| Functions | Supabase Edge Functions | Deno | Serverless |
| **Infrastructure** ||||
| Hosting | Vercel | - | Edge, Preview |
| CDN | Vercel Edge Network | - | Global |
| **External APIs** ||||
| Auth | Kakao OAuth 2.0 | - | Login |
| Notifications | Supabase Realtime | - | In-app notifications |
| **DevOps** ||||
| Error Tracking | Sentry | latest | Monitoring |
| Analytics | Vercel Analytics | - | Performance |
| CI/CD | GitHub Actions | - | Automation |

### 8.3 Project Structure

```
chinchin/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── public/
│   ├── icons/
│   └── manifest.json
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── callback/kakao/route.ts
│   │   ├── (main)/
│   │   │   ├── page.tsx        # Landing
│   │   │   ├── create/page.tsx # Profile creation
│   │   │   ├── dashboard/page.tsx
│   │   │   └── chat/[roomId]/page.tsx
│   │   ├── m/[shortId]/page.tsx  # Blind profile
│   │   ├── api/
│   │   │   ├── auth/route.ts
│   │   │   ├── profiles/route.ts
│   │   │   ├── chat/route.ts
│   │   │   └── notifications/route.ts
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                 # shadcn/ui
│   │   ├── auth/
│   │   ├── profile/
│   │   ├── chat/
│   │   └── layout/
│   ├── lib/
│   │   ├── supabase/
│   │   ├── kakao/
│   │   └── utils/
│   ├── hooks/
│   ├── stores/
│   └── types/
├── supabase/
│   ├── migrations/
│   └── functions/
├── .env.example
├── next.config.js
├── tailwind.config.ts
└── package.json
```

---

## 9. Database Schema

### 9.1 Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐
│     users       │       │    profiles     │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │───┐   │ id (PK)         │
│ kakao_id        │   │   │ short_id        │
│ nickname        │   └──<│ creator_id (FK) │
│ profile_image   │       │ photo_url       │
│ access_token    │       │ age, gender     │
│ created_at      │       │ bio             │
└─────────────────┘       │ interest_tags   │
        │                 │ expires_at      │
        │                 │ is_active       │
        │                 └─────────────────┘
        │                         │
        ▼                         ▼
┌─────────────────┐       ┌─────────────────┐
│   chat_rooms    │       │   messages      │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │───────│ id (PK)         │
│ profile_id (FK) │       │ room_id (FK)    │
│ requester_id    │       │ sender_id (FK)  │
│ target_id       │       │ content         │
│ status          │       │ is_read         │
│ profile_revealed│       │ created_at      │
│ expires_at      │       └─────────────────┘
└─────────────────┘
        │
        ▼
┌─────────────────┐
│  notifications  │
├─────────────────┤
│ id (PK)         │
│ user_id (FK)    │
│ type            │
│ message         │
│ is_read         │
│ created_at      │
└─────────────────┘
```

### 9.2 Table Definitions

```sql
-- ================================================
-- 1. Users Table (카카오 사용자)
-- ================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kakao_id BIGINT UNIQUE NOT NULL,
  nickname VARCHAR(50),
  profile_image_url TEXT,
  kakao_access_token TEXT,
  kakao_refresh_token TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_kakao_id ON users(kakao_id);

-- ================================================
-- 2. Profiles Table (프로필 링크)
-- ================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  short_id VARCHAR(20) UNIQUE NOT NULL,
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Profile Information
  photo_url TEXT NOT NULL,
  original_photo_url TEXT,
  photos JSONB DEFAULT '[]',  -- [{url, originalUrl, blurEnabled}]
  name VARCHAR(50),
  age SMALLINT NOT NULL CHECK (age >= 18 AND age <= 99),
  gender VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female')),
  occupation_category VARCHAR(50),
  bio VARCHAR(100) NOT NULL,
  interest_tags TEXT[] NOT NULL,
  mbti VARCHAR(4),
  music_genre VARCHAR(50),
  instagram_id VARCHAR(100),
  
  -- Link Settings
  expires_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  view_count INTEGER DEFAULT 0,
  chat_request_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_short_id ON profiles(short_id);
CREATE INDEX idx_profiles_creator ON profiles(creator_id);
CREATE INDEX idx_profiles_active ON profiles(is_active, expires_at);

-- ================================================
-- 3. Chat Rooms Table (채팅방)
-- ================================================
CREATE TABLE chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

CREATE INDEX idx_chat_rooms_requester ON chat_rooms(requester_id);
CREATE INDEX idx_chat_rooms_target ON chat_rooms(target_id);
CREATE UNIQUE INDEX idx_chat_rooms_unique ON chat_rooms(profile_id, requester_id);

-- ================================================
-- 4. Messages Table (메시지)
-- ================================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) <= 500),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_room ON messages(room_id, created_at DESC);

-- ================================================
-- 5. Notifications Table (알림)
-- ================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(100),
  message TEXT,
  link_url TEXT,
  sent_via VARCHAR(20) DEFAULT 'in_app',
  sent_at TIMESTAMPTZ,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);

-- ================================================
-- 6. Reports Table (신고)
-- ================================================
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reported_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  room_id UUID REFERENCES chat_rooms(id) ON DELETE SET NULL,
  reason VARCHAR(100) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- Row Level Security (RLS)
-- ================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users: Can read/update own record
CREATE POLICY users_select ON users FOR SELECT USING (id = auth.uid());
CREATE POLICY users_update ON users FOR UPDATE USING (id = auth.uid());

-- Profiles: Creator can CRUD, others can read active
CREATE POLICY profiles_select ON profiles FOR SELECT USING (
  creator_id = auth.uid() OR (is_active = TRUE AND expires_at > NOW())
);
CREATE POLICY profiles_insert ON profiles FOR INSERT WITH CHECK (creator_id = auth.uid());
CREATE POLICY profiles_update ON profiles FOR UPDATE USING (creator_id = auth.uid());

-- Chat Rooms: Participants can access
CREATE POLICY chat_rooms_select ON chat_rooms FOR SELECT USING (
  requester_id = auth.uid() OR target_id = auth.uid()
);

-- Messages: Room participants can access
CREATE POLICY messages_select ON messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM chat_rooms 
    WHERE chat_rooms.id = messages.room_id 
    AND (chat_rooms.requester_id = auth.uid() OR chat_rooms.target_id = auth.uid())
  )
);

-- Notifications: User can access own
CREATE POLICY notifications_select ON notifications FOR SELECT USING (user_id = auth.uid());
```

---

## 10. API Specifications

### 10.1 Authentication APIs

#### POST /api/auth/kakao
카카오 로그인 처리

```typescript
// Request
{ code: string }

// Response 200
{
  success: true,
  user: { id: string, nickname: string, profileImage: string }
}

// Response 401
{ success: false, error: { code: "INVALID_CODE", message: "유효하지 않은 인증 코드입니다." } }
```

#### GET /api/auth/me
현재 사용자 정보 조회

```typescript
// Response 200
{
  success: true,
  user: { id: string, kakaoId: number, nickname: string, profileImage: string }
}
```

### 10.2 Profile APIs

#### POST /api/profiles
새 프로필 링크 생성

```typescript
// Request (FormData)
{
  photo: File,
  age: number,
  gender: "male" | "female",
  occupationCategory: string,
  bio: string,
  interestTags: string[],  // 정확히 3개
  mbti?: string,
  instagramId?: string
}

// Response 201
{
  success: true,
  profile: {
    id: string,
    shortId: string,
    linkUrl: string,  // https://chinchin.app/m/abc123
    expiresAt: string
  }
}
```

#### GET /api/profiles/:shortId
프로필 조회 (블라인드)

```typescript
// Response 200
{
  success: true,
  profile: {
    photoUrl: string,  // 블러 처리된 이미지
    age: number,
    gender: string,
    bio: string,
    interestTags: string[],
    viewCount: number,
    expiresAt: string
  }
}
```

### 10.3 Chat APIs

#### POST /api/chat/request
대화 신청

```typescript
// Request
{ profileId: string }

// Response 201
{ success: true, chatRoom: { id: string, status: "pending" } }
```

#### POST /api/chat/:roomId/accept
대화 신청 수락

```typescript
// Response 200
{ success: true, chatRoom: { id: string, status: "active", expiresAt: string } }
```

#### GET /api/chat/:roomId/messages
메시지 목록 조회

```typescript
// Response 200
{
  success: true,
  messages: [
    { id: string, senderId: string, content: string, isRead: boolean, createdAt: string }
  ]
}
```

#### POST /api/chat/:roomId/messages
메시지 전송

```typescript
// Request
{ content: string }

// Response 201
{ success: true, message: { id: string, content: string, createdAt: string } }
```

#### POST /api/chat/:roomId/reveal-accept
프로필 공개 수락

```typescript
// Response 200
{
  success: true,
  profiles: {
    requester: { name: string, originalPhotoUrl: string, instagramId: string },
    target: { name: string, originalPhotoUrl: string, instagramId: string }
  }
}
```

---

## 11. UI/UX Specifications

### 11.1 Design System

#### Color Palette
```css
/* Primary */
--primary: #FF6B6B;        /* Coral Pink */
--primary-dark: #E55555;
--primary-light: #FFE5E5;

/* Secondary */
--secondary: #4ECDC4;      /* Mint */

/* Neutral */
--gray-900: #1A1A1A;
--gray-700: #4A4A4A;
--gray-500: #9A9A9A;
--gray-100: #F5F5F5;
--white: #FFFFFF;
```

#### Typography
```css
/* Font Family */
--font-primary: 'Pretendard Variable', sans-serif;
--font-display: 'Righteous', cursive;

/* Font Sizes */
--text-xs: 0.75rem;   /* 12px */
--text-sm: 0.875rem;  /* 14px */
--text-base: 1rem;    /* 16px */
--text-lg: 1.125rem;  /* 18px */
--text-xl: 1.25rem;   /* 20px */
--text-2xl: 1.5rem;   /* 24px */
```

### 11.2 Key Screens

#### Landing Page
```
┌────────────────────────────────┐
│  [로고]           [로그인]     │
├────────────────────────────────┤
│    친구를 소개하는             │
│    가장 쉬운 방법              │
│                                │
│  ┌──────────────────────────┐  │
│  │ 🍫 카카오톡으로 시작하기  │  │
│  └──────────────────────────┘  │
├────────────────────────────────┤
│  1️⃣ 링크 생성                 │
│  2️⃣ 스토리 공유               │
│  3️⃣ 매칭 성공                 │
└────────────────────────────────┘
```

#### Blind Profile Card
```
┌────────────────────────────────┐
│                                │
│      [블러 처리된 사진]         │
│                                │
│   26살 · 여성 · 디자이너        │
│                                │
│  "전시회와 카페 투어 좋아해요"   │
│                                │
│  #전시회  #카페  #독서          │
│                                │
│  ENFP · 인디음악               │
│                                │
│  ┌──────────────────────────┐  │
│  │  💬 대화 신청하기         │  │
│  └──────────────────────────┘  │
│                                │
│  👀 23명 조회 · ⏰ 15시간 남음  │
└────────────────────────────────┘
```

---

## 12. Security & Privacy

### 12.1 Authentication Security
- OAuth 2.0 with PKCE
- JWT in httpOnly cookies
- Automatic token refresh

### 12.2 Data Protection
- TLS 1.3 encryption
- Encrypted token storage
- 30-day auto-deletion for expired data

### 12.3 Privacy Policy
- 최소 수집 원칙
- 명확한 데이터 사용 고지
- 삭제 요청 즉시 처리

---

## 13. Analytics & Metrics

### 13.1 Key Events
- `auth.login_completed`
- `profile.create_completed`
- `profile.viewed`
- `chat.request_sent`
- `chat.request_accepted`
- `chat.reveal_accepted`

### 13.2 Funnel Metrics
| Stage | Target |
|-------|--------|
| Visit → Login | 20% |
| Login → Create | 50% |
| View → Request | 10% |
| Request → Accept | 60% |
| Chat → Reveal | 40% |

---

## 14. Release Plan

### Phase 1: Foundation (Week 1-2)
- [ ] Next.js 프로젝트 초기화
- [ ] Supabase 설정 및 DB 마이그레이션
- [ ] 카카오 OAuth 연동
- [ ] 기본 UI 컴포넌트

### Phase 2: Core Features (Week 3-4)
- [ ] 프로필 생성 폼
- [ ] 이미지 블러 처리
- [ ] 블라인드 프로필 뷰어
- [ ] 링크 생성 및 공유

### Phase 3: Chat System (Week 5-6)
- [ ] 대화 신청/수락
- [ ] 실시간 채팅 (Supabase Realtime)
- [ ] 프로필 공개 플로우

### Phase 4: Dashboard & Polish (Week 7-8)
- [ ] 주선자 대시보드
- [ ] 인앱 알림 (Supabase Realtime)
- [ ] 테스트 및 버그 수정
- [ ] 성능 최적화

---

## 15. Risk Assessment

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| 낮은 대화 신청률 | High | Medium | 취향 일치도 표시, 첫 메시지 템플릿 |
| 스팸/악용 | High | Medium | Rate limiting, 신고 기능 |
| 인스타 공유율 낮음 | High | Low | 공유용 이미지 자동 생성, 리워드 |
| 프라이버시 논란 | High | Low | 동의 체크박스, 삭제 요청 즉시 처리 |

---

## Appendix

### A. Interest Tags (취향 키워드)
```
카페투어, 전시회, 영화, 독서, 운동, 등산, 여행,
요리, 음악감상, 게임, 반려동물, 사진, 맛집탐방,
드라이브, 캠핑, 공연관람, 와인, 댄스, 요가, 러닝
```

### B. Occupation Categories (직업 카테고리)
```
IT/개발, 디자인, 마케팅/광고, 금융/회계, 의료/건강,
교육, 미디어/콘텐츠, 서비스업, 공무원, 법률, 건설/건축,
제조/생산, 연구/R&D, 영업/판매, 물류/유통, 기타
```

### C. Kakao API Reference
- OAuth: https://developers.kakao.com/docs/latest/ko/kakaologin/rest-api

---

**Document End**

*Last Updated: 2026-02-07*
