/**
 * Middleware to handle authentication-based routing
 * Redirects base URL to /menu (logged in) or /login (not logged in)
 */

import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // Only handle root path redirects
  const pathname = request.nextUrl.pathname;
  if (pathname !== "/") {
    return NextResponse.next();
  }

  // Check if user has an access token cookie
  const accessToken = request.cookies.get("access_token")?.value;

  // Redirect based on authentication status
  if (accessToken) {
    // User is logged in, redirect to menu
    return NextResponse.redirect(new URL("/menu", request.url));
  } else {
    // User is not logged in, redirect to login
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: [
    // Protect these routes (automatically handles /auth/*)
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
