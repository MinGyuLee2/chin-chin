// Interest tags (취향 키워드)
export const INTEREST_TAGS = [
  "카페투어",
  "전시회",
  "영화",
  "독서",
  "운동",
  "등산",
  "여행",
  "요리",
  "음악감상",
  "게임",
  "반려동물",
  "사진",
  "맛집탐방",
  "드라이브",
  "캠핑",
  "공연관람",
  "와인",
  "댄스",
  "요가",
  "러닝",
] as const;

// Occupation categories (직업 카테고리)
export const OCCUPATION_CATEGORIES = [
  "IT/개발",
  "디자인",
  "마케팅/광고",
  "금융/회계",
  "의료/건강",
  "교육",
  "미디어/콘텐츠",
  "서비스업",
  "공무원",
  "법률",
  "건설/건축",
  "제조/생산",
  "연구/R&D",
  "영업/판매",
  "물류/유통",
  "기타",
] as const;

// MBTI types
export const MBTI_TYPES = [
  "ISTJ",
  "ISFJ",
  "INFJ",
  "INTJ",
  "ISTP",
  "ISFP",
  "INFP",
  "INTP",
  "ESTP",
  "ESFP",
  "ENFP",
  "ENTP",
  "ESTJ",
  "ESFJ",
  "ENFJ",
  "ENTJ",
] as const;

// Music genres
export const MUSIC_GENRES = [
  "K-POP",
  "팝",
  "힙합/R&B",
  "인디음악",
  "록/메탈",
  "재즈",
  "클래식",
  "EDM",
  "발라드",
  "트로트",
] as const;

// Profile expiry time (24 hours)
export const PROFILE_EXPIRY_HOURS = 24;

// Chat room expiry time (48 hours)
export const CHAT_ROOM_EXPIRY_HOURS = 48;

// Maximum daily profile creations
export const MAX_DAILY_PROFILE_CREATIONS = 10;

// Maximum daily chat requests
export const MAX_DAILY_CHAT_REQUESTS = 10;

// Invitation expiry time (7 days)
export const INVITATION_EXPIRY_DAYS = 7;

// Maximum daily invitations
export const MAX_DAILY_INVITATIONS = 10;

// Report reasons (신고 사유)
export const REPORT_REASONS = [
  { value: "harassment", label: "불쾌한 언행" },
  { value: "inappropriate", label: "부적절한 콘텐츠" },
  { value: "spam", label: "스팸/광고" },
  { value: "scam", label: "사기 의심" },
  { value: "other", label: "기타" },
] as const;
