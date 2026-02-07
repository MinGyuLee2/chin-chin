import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { checkRateLimit } from "@/lib/rate-limit";

export async function middleware(request: NextRequest) {
  // Rate limit auth callback to prevent abuse
  if (request.nextUrl.pathname.startsWith("/api/auth/callback")) {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
    const { allowed } = checkRateLimit(`auth:${ip}`, 10, 60 * 1000); // 10 requests per minute

    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes that don't need auth
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
