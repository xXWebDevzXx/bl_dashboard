import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma/client";
import type { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/admin/users/[userId]
 * Get a specific user by ID (admin only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await requireAdmin();

    const { userId } = await params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        isVerified: true,
        verifiedAt: true,
        auth0Id: true,
        deletedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Get user error:", error);

    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/users/[userId]
 * Update a user (admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await requireAdmin();

    const { userId } = await params;

    const body = await request.json();
    const { username, email, role, isVerified } = body;

    const currentTimestamp = Math.floor(Date.now() / 1000);

    // Build update data with proper typing
    const updateData: Prisma.UserUpdateInput = {
      updatedAt: currentTimestamp,
    };

    if (username !== undefined) {
      if (typeof username !== "string" || username.trim().length === 0) {
        return NextResponse.json(
          { error: "Username must be a non-empty string" },
          { status: 400 }
        );
      }
      if (username.length > 20) {
        return NextResponse.json(
          { error: "Username must be 20 characters or less" },
          { status: 400 }
        );
      }
      updateData.username = username.trim();
    }

    if (email !== undefined) {
      if (typeof email !== "string" || !email.includes("@")) {
        return NextResponse.json(
          { error: "Invalid email format" },
          { status: 400 }
        );
      }
      updateData.email = email.trim();
    }

    if (role !== undefined) {
      if (role !== "user" && role !== "admin") {
        return NextResponse.json(
          { error: "Role must be 'user' or 'admin'" },
          { status: 400 }
        );
      }
      updateData.role = role as "user" | "admin";
    }

    if (isVerified !== undefined) {
      updateData.isVerified = Boolean(isVerified);
      if (isVerified && !updateData.verifiedAt) {
        updateData.verifiedAt = currentTimestamp;
      } else if (!isVerified) {
        updateData.verifiedAt = 0;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        isVerified: true,
        verifiedAt: true,
        auth0Id: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update user error:", error);

    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    // Handle unique constraint violation (e.g., duplicate email)
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/users/[userId]
 * Soft delete a user (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const adminUser = await requireAdmin();

    const { userId } = await params;

    // Prevent admin from deleting themselves
    if (adminUser.id === userId) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    const currentTimestamp = Math.floor(Date.now() / 1000);

    const deletedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        deletedAt: currentTimestamp,
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
      message: "User deleted successfully",
      user: deletedUser,
    });
  } catch (error) {
    console.error("Delete user error:", error);

    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
