import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma/client";
import type { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

type UserRole = "user" | "admin";

interface UsersQueryParams {
  page?: string;
  limit?: string;
  search?: string;
  role?: string;
  deleted?: string;
}

type UserSelect = {
  id: true;
  username: true;
  email: true;
  role: true;
  createdAt: true;
  updatedAt: true;
  isVerified: true;
  verifiedAt: true;
  auth0Id: true;
  deletedAt: true;
};

type SelectedUser = Prisma.UserGetPayload<{
  select: UserSelect;
}>;

interface UsersResponse {
  users: SelectedUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface ErrorResponse {
  error: string;
}

/**
 * GET /api/admin/users
 * List all users (admin only)
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<UsersResponse | ErrorResponse>> {
  try {
    // Check admin access
    await requireAdmin();

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const queryParams: UsersQueryParams = {
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
      search: searchParams.get("search") || undefined,
      role: searchParams.get("role") || undefined,
      deleted: searchParams.get("deleted") || undefined,
    };

    // Validate and parse pagination parameters
    const page = Math.max(1, parseInt(queryParams.page || "1", 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(queryParams.limit || "50", 10) || 50)
    );

    const skip = (page - 1) * limit;
    const search = queryParams.search?.trim() || "";
    const role = queryParams.role?.trim() || "";
    const deleted = queryParams.deleted === "true";

    // Build where clause with proper typing
    const where: Prisma.UserWhereInput = deleted
      ? { deletedAt: { not: { equals: 0 } } } // Show only deleted users
      : { deletedAt: { equals: 0 } }; // Show only non-deleted users

    if (search) {
      where.OR = [
        { email: { contains: search } },
        { username: { contains: search } },
      ];
    }

    if (role && (role === "user" || role === "admin")) {
      where.role = role as UserRole;
    }

    // Get users with pagination
    const userSelect: UserSelect = {
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
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: deleted
          ? { deletedAt: "desc" } // Most recently deleted first
          : { createdAt: "desc" }, // Most recently created first
        select: userSelect,
      }),
      prisma.user.count({ where }),
    ]);

    const response: UsersResponse = {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Get users error:", error);

    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
