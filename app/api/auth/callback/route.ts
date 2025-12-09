import { auth0 } from "@/lib/auth0";
import { syncUserToDatabase } from "@/lib/auth0-sync";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Handle the OAuth callback - this processes the state parameter
    const response = await auth0.middleware(req);

    // Try to sync the user to the database
    // Use the request object to get the session from the response
    try {
      const session = await auth0.getSession(req);
      if (session?.user) {
        await syncUserToDatabase(session.user);
      }
    } catch (syncError) {
      console.error("Error syncing user:", syncError);
      // Don't fail the login if sync fails
    }

    return response;
  } catch (error) {
    console.error("Callback error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Authentication failed";
    console.error("Callback error details:", {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      url: req.url,
    });
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(errorMessage)}`, req.url)
    );
  }
}
