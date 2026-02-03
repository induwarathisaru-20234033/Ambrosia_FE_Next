import { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {

}

export const config = {
  matcher: [
    // Protect these routes (automatically handles /auth/*)
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
