import { auth0 } from "@/lib/auth0";
import { prisma } from "@/lib/prisma/client";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth0.getSession();

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get the latest user data from database to include any updates
    try {
      const dbUser = await prisma.user.findUnique({
        where: { auth0Id: session.user.sub },
      });

      if (dbUser) {
        // Check if account is deleted
        if (dbUser.deletedAt && dbUser.deletedAt > 0) {
          return NextResponse.json(
            { error: "Account deleted", accountDeleted: true },
            { status: 403 }
          );
        }

        // Merge database user data with session data
        const userData = {
          ...session.user,
          name: dbUser.username, // Use database username as the source of truth
          nickname: dbUser.username,
        };
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
