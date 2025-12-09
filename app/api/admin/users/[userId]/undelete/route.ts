import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma/client";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/admin/users/[userId]/undelete
 * Restore a soft-deleted user (admin only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
): Promise<
  NextResponse<
    | {
        success: boolean;
        user: { id: string; username: string; email: string };
      }
    | { error: string }
  >
> {
  try {
    await requireAdmin();

    const { userId } = await params;

    const currentTimestamp = Math.floor(Date.now() / 1000);

    // Restore user by setting deletedAt to 0
    const restoredUser = await prisma.user.update({
      where: { id: userId },
      data: {
        deletedAt: 0,
        updatedAt: currentTimestamp,
      },
      select: {
        id: true,
        username: true,
        email: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: restoredUser,
    });
  } catch (error) {
    console.error("Undelete user error:", error);

    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    // Handle case where user is not found or not deleted
    if (
      error instanceof Error &&
      error.message.includes("Record to update not found")
    ) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to restore user" },
      { status: 500 }
    );
  }
}
