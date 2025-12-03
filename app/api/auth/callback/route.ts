import { auth0 } from "@/lib/auth0";
import { syncUserToDatabase } from "@/lib/auth0-sync";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Handle the OAuth callback
    const response = await auth0.middleware(req);

    // Try to sync the user to the database
    try {
      const session = await auth0.getSession();
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
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(
          error instanceof Error ? error.message : "Authentication failed"
        )}`,
        req.url
      )
    );
  }
}
