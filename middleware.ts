import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth0 } from "./lib/auth0";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow custom Auth0 API routes to be handled by their route handlers
  const customAuthRoutes = ["/api/auth/me", "/api/auth/profile", "/api/auth/refresh-session"];
  if (customAuthRoutes.includes(pathname)) {
    console.log(`=== Middleware: Allowing custom auth route: ${pathname} ===`);
    return NextResponse.next();
  }

  // Handle Auth0 routes through middleware (login, logout, callback)
  if (pathname.startsWith("/api/auth/")) {
    try {
      console.log("Auth0 route:", pathname);
      const response = await auth0.middleware(request);
      console.log("Auth0 response status:", response.status);
      return response;
    } catch (error) {
      console.error("Auth0 middleware error:", error);
      console.error(
        "Error details:",
        error instanceof Error ? error.message : String(error)
      );
      console.error("Error stack:", error instanceof Error ? error.stack : "");
      return NextResponse.json(
        {
          error: "Authentication error",
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 500 }
      );
    }
  }

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/login", "/register"];
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // For protected routes, check if user has a session
  const session = await auth0.getSession(request);

  if (!session) {
    // Redirect to login if not authenticated
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Allow access to verify-email page even if email is not verified
  if (pathname === "/verify-email") {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
