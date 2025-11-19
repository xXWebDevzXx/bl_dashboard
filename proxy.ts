import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { parse } from "cookie";
import { verifyToken } from "@/lib/jwt";

export function proxy(request: NextRequest) {
  // Parse cookies from request headers
  const cookieHeader = request.headers.get("cookie") || "";
  const cookies = parse(cookieHeader);
  const token = cookies["auth-token"];

  // Check if token exists
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Verify token
  const decoded = verifyToken(token);
  if (!decoded) {
    // Token is invalid or expired, redirect to login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Token is valid, allow the request to proceed
  return NextResponse.next();
}

// Configure which routes the proxy should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - /api/auth/* (auth API routes)
     * - /_next/static (static files)
     * - /_next/image (image optimization files)
     * - /favicon.ico (favicon file)
     * - /login (login page)
     * - /register (register page)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|login|register).*)",
  ],
};

