import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR, Righteous } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-pretendard",
  display: "swap",
});

const righteous = Righteous({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-righteous",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "친친 - 친구를 소개하는 가장 쉬운 방법",
    template: "%s | 친친",
  },
  description:
    "인스타 스토리 하나로 친구를 소개하세요. 블라인드 프로필로 시작해서 대화로 알아가고, 마음이 맞으면 프로필을 공개하세요.",
  keywords: ["소개팅", "블라인드", "친구 소개", "데이팅", "매칭"],
  authors: [{ name: "친친" }],
  creator: "친친",
  publisher: "친친",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "/",
    siteName: "친친",
    title: "친친 - 친구를 소개하는 가장 쉬운 방법",
    description:
      "인스타 스토리 하나로 친구를 소개하세요. 블라인드 프로필로 시작해서 대화로 알아가세요.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "친친 - 블라인드 소개팅",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "친친 - 친구를 소개하는 가장 쉬운 방법",
    description: "인스타 스토리 하나로 친구를 소개하세요.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#FF6B6B",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${notoSansKr.variable} ${righteous.variable} font-sans`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
