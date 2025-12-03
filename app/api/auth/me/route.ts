import { auth0 } from "@/lib/auth0";
import { prisma } from "@/lib/prisma/client";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("=== /api/auth/me endpoint called ===");
    const session = await auth0.getSession();

    console.log("Session exists?:", !!session);
    console.log("Session user:", session?.user?.email);

    if (!session) {
      console.log("No session found, returning 401");
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get the latest user data from database to include any updates
    try {
      const dbUser = await prisma.user.findUnique({
        where: { auth0Id: session.user.sub },
      });

      if (dbUser) {
        // Merge database user data with session data
        const userData = {
          ...session.user,
          name: dbUser.username, // Use database username as the source of truth
          nickname: dbUser.username,
        };
        console.log(
          "Returning merged user data with DB username:",
          dbUser.username
        );
        return NextResponse.json(userData);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Internal server error";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
