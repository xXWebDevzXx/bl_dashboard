import { prisma } from "@/lib/prisma/client";
import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Filter parameters
    const projectName = searchParams.get("project");
    const delegateId = searchParams.get("delegate");
    const estimateFilter = searchParams.get("estimate");
    const search = searchParams.get("search");
    const hasTimeEntries = searchParams.get("hasTimeEntries");
    const createdAfter = searchParams.get("createdAfter");
    const createdBefore = searchParams.get("createdBefore");
    const startedAfter = searchParams.get("startedAfter");
    const startedBefore = searchParams.get("startedBefore");
    const completedAfter = searchParams.get("completedAfter");
    const completedBefore = searchParams.get("completedBefore");
    const labelName = searchParams.get("label");

    const skip = (page - 1) * limit;

    // Build where clause dynamically
    const where: Record<string, unknown> = {};

    // Search filter (searches in name and taskId)
    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
          },
        },
        {
          taskId: {
            contains: search,
          },
        },
      ];
    }

    // Project filter
    if (projectName) {
      where.projectName = {
        contains: projectName,
      };
    }

    // Delegate filter
    if (delegateId) {
      where.delegateId = delegateId;
    }

    // Estimate filter (exact match for now, can be extended)
    if (estimateFilter) {
      where.estimatedTime = estimateFilter;
    }

    // Has time entries filter
    if (hasTimeEntries !== null) {
      if (hasTimeEntries === "true") {
        where.togglTimes = {
          some: {},
        };
      } else if (hasTimeEntries === "false") {
        where.togglTimes = {
          none: {},
        };
      }
    }

    // Date filters
    if (createdAfter || createdBefore) {
      where.createdAt = {
        ...(createdAfter && { gte: parseInt(createdAfter) }),
        ...(createdBefore && { lte: parseInt(createdBefore) }),
      };
    }

    if (startedAfter || startedBefore) {
      where.startedAt = {
        ...(startedAfter && { gte: parseInt(startedAfter) }),
        ...(startedBefore && { lte: parseInt(startedBefore) }),
      };
    }

    if (completedAfter || completedBefore) {
      where.completedAt = {
        ...(completedAfter && { gte: parseInt(completedAfter) }),
        ...(completedBefore && { lte: parseInt(completedBefore) }),
      };
    }

    // Label filter
    if (labelName) {
      where.labels = {
        some: {
          linearLabel: {
            name: {
              contains: labelName,
            },
          },
        },
      };
    }

    const [data, total] = await Promise.all([
      prisma.linearTask.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          taskId: true,
          estimatedTime: true,
          delegateId: true,
          delegateName: true,
          projectName: true,
          startedAt: true,
          completedAt: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.linearTask.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: `Internal server error: ${errorMessage}` }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
