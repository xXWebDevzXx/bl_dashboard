import { auth0 } from "@/lib/auth0";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const returnTo = searchParams.get("returnTo") || "/dashboard";

  // Force a fresh authentication to get updated email_verified status
  // This will use SSO if user is already authenticated, but won't fail with consent errors
  return await auth0.startInteractiveLogin({
    returnTo,
    authorizationParameters: {
      max_age: 0, // Force fresh authentication check
      // Removed prompt: 'none' to allow consent screen for first-time users
    },
  });
}
