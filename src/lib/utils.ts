import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

export function formatTime(date: Date | string): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function formatRelativeTime(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "방금 전";
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  if (diffDay < 7) return `${diffDay}일 전`;
  return formatDate(d);
}

export function formatCountdown(expiresAt: Date | string): string {
  const expires = new Date(expiresAt);
  const now = new Date();
  const diffMs = expires.getTime() - now.getTime();

  if (diffMs <= 0) return "만료됨";

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) return `${hours}시간 ${minutes}분 남음`;
  return `${minutes}분 남음`;
}

export function isExpired(expiresAt: Date | string): boolean {
  return new Date(expiresAt).getTime() < Date.now();
}

export function generateShortId(length: number = 8): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function getProfileUrl(shortId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl}/m/${shortId}`;
}

// Contact info filter patterns
const CONTACT_PATTERNS = [
  /\d{3}[-.\s]?\d{4}[-.\s]?\d{4}/g, // 전화번호 (010-1234-5678)
  /\d{2,3}[-.\s]?\d{3,4}[-.\s]?\d{4}/g, // 전화번호 변형
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, // 이메일
  /@[a-zA-Z0-9_.]{1,30}/g, // 인스타/트위터 아이디
  /카[카톡톡]+|카카오톡?/gi, // 카카오톡 언급
  /인스타그?램?|insta(gram)?/gi, // 인스타 언급
  /라인|line/gi, // 라인 언급
  /텔레그램|telegram/gi, // 텔레그램 언급
];

export function filterContactInfo(text: string): {
  filtered: string;
  hasContact: boolean;
} {
  let filtered = text;
  let hasContact = false;

  CONTACT_PATTERNS.forEach((pattern) => {
    pattern.lastIndex = 0; // Reset global regex state
    if (pattern.test(filtered)) {
      hasContact = true;
      pattern.lastIndex = 0; // Reset again before replace
      filtered = filtered.replace(pattern, "[연락처 정보 삭제됨]");
    }
  });

  return { filtered, hasContact };
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
