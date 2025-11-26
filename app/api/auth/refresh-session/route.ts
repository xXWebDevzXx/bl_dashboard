import { auth0 } from "@/lib/auth0";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const returnTo = searchParams.get('returnTo') || '/dashboard';
    
    // Start a new login flow - since user is already authenticated with Auth0,
    // this should be quick (SSO) and will refresh the session with updated email_verified status
    return await auth0.startInteractiveLogin({
      returnTo,
      authorizationParams: {
        prompt: 'none', // Silent authentication - no login UI if already authenticated
        max_age: 0, // Force fresh authentication check
      }
    });
  } catch (error) {
    console.error("Session refresh error:", error);
    // If silent auth fails, do a regular login
    return await auth0.startInteractiveLogin({
      returnTo: '/verify-email',
    });
  }
}

