import { auth0 } from "@/lib/auth0";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Start a new login flow - since user is already authenticated with Auth0,
    // this should be quick (SSO) and will refresh the session with updated email_verified status
    return await auth0.startInteractiveLogin({
      returnTo: '/dashboard',
    });
  } catch (error) {
    console.error("Session refresh error:", error);
    return NextResponse.redirect(new URL("/api/auth/login", req.url));
  }
}

