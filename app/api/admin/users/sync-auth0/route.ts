import { requireAdmin } from "@/lib/admin";
import {
  convertAuth0UserToSyncFormat,
  fetchAllAuth0Users,
} from "@/lib/auth0-management";
import { syncUserToDatabase } from "@/lib/auth0-sync";
import { NextRequest, NextResponse } from "next/server";

interface SyncResponse {
  success: boolean;
  message: string;
  stats: {
    total: number;
    created: number;
    updated: number;
    skipped: number;
    errors: number;
  };
  errors?: Array<{
    email?: string;
    userId: string;
    error: string;
  }>;
}

/**
 * POST /api/admin/users/sync-auth0
 * Sync all users from Auth0 to the database (admin only)
 */
export async function POST(
  _request: NextRequest
): Promise<NextResponse<SyncResponse | { error: string }>> {
  try {
    // Check admin access
    await requireAdmin();

    // Fetch all users from Auth0
    let auth0Users;
    try {
      auth0Users = await fetchAllAuth0Users();
    } catch (error) {
      console.error("Error fetching Auth0 users:", error);
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch users from Auth0",
        },
        { status: 500 }
      );
    }

    const stats = {
      total: auth0Users.length,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: 0,
    };

    const errors: Array<{
      email?: string;
      userId: string;
      error: string;
    }> = [];

    // Sync each user
    for (const auth0User of auth0Users) {
      try {
        // Skip blocked users
        if (auth0User.blocked) {
          stats.skipped++;
          continue;
        }

        // Skip users without email
        if (!auth0User.email) {
          stats.skipped++;
          continue;
        }

        // Convert to sync format
        const syncFormat = convertAuth0UserToSyncFormat(auth0User);

        // Import prisma here to avoid circular dependency
        const { prisma } = await import("@/lib/prisma/client");

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { auth0Id: auth0User.user_id },
        });

        // Sync user
        await syncUserToDatabase(syncFormat);

        if (existingUser) {
          stats.updated++;
        } else {
          stats.created++;
        }
      } catch (error) {
        stats.errors++;
        errors.push({
          email: auth0User.email,
          userId: auth0User.user_id,
          error:
            error instanceof Error ? error.message : "Unknown error occurred",
        });
        console.error(`Error syncing user ${auth0User.user_id}:`, error);
      }
    }

    const response: SyncResponse = {
      success: true,
      message: `Successfully synced ${
        stats.created + stats.updated
      } users from Auth0`,
      stats,
      ...(errors.length > 0 && { errors }),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Sync Auth0 users error:", error);

    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to sync users from Auth0",
      },
      { status: 500 }
    );
  }
}
