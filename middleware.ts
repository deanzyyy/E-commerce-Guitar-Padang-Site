import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    const sessionCookie = request.cookies.get("session");

    if (!sessionCookie) {
      // Redirect to login if no session
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      // Decode session to check role
      const session = JSON.parse(
        Buffer.from(sessionCookie.value, "base64").toString()
      );

      if (session.role !== "ADMIN") {
        // Redirect to home if not admin
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch (error) {
      // Invalid session, redirect to login
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

