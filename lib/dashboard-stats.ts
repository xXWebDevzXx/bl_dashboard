import { prisma } from "@/lib/prisma/client";
import type { DateRange } from "./report-data";

export async function getDashboardStats(dateRange?: DateRange) {
  try {
    // Build date filter for tasks
    const taskDateFilter = dateRange
      ? {
          OR: [
            {
              createdAt: {
                gte: Math.floor(dateRange.startDate.getTime() / 1000),
                lte: Math.floor(dateRange.endDate.getTime() / 1000),
              },
            },
            {
              startedAt: {
                gte: Math.floor(dateRange.startDate.getTime() / 1000),
                lte: Math.floor(dateRange.endDate.getTime() / 1000),
              },
            },
            {
              completedAt: {
                gte: Math.floor(dateRange.startDate.getTime() / 1000),
                lte: Math.floor(dateRange.endDate.getTime() / 1000),
              },
            },
          ],
        }
      : undefined;

    // Build date filter for toggl times (based on start date string)
    // For string fields, we use string comparison which works for ISO date strings
    const startDateStr = dateRange
      ? dateRange.startDate.toISOString().split("T")[0]
      : undefined;
    const endDateStr = dateRange
      ? dateRange.endDate.toISOString().split("T")[0]
      : undefined;
    const togglTimeDateFilter =
      dateRange && startDateStr && endDateStr
        ? {
            start: {
              gte: startDateStr,
              lte: endDateStr + "T23:59:59.999Z",
            },
          }
        : undefined;

    // Get total tasks count
    const linearTasksCount = await prisma.linearTask?.count({
      where: taskDateFilter,
    });

    // Get tasks with Toggl time (filtered by date range)
    const linearTasksWithTime = await prisma.linearTask?.findMany({
      where: {
        ...taskDateFilter,
        togglTimes: {
          some: togglTimeDateFilter || {},
        },
      },
    });

    const linearTasksWithTogglTimePercentage =
      linearTasksCount && linearTasksCount > 0
        ? (linearTasksWithTime.length / linearTasksCount) * 100
        : 0;

    // Get average Toggl time (filtered by date range)
    const averageTogglTime = await prisma.togglTime?.aggregate({
      where: togglTimeDateFilter,
      _avg: {
        duration: true,
      },
    });

    const averageTogglTimeHours = averageTogglTime._avg.duration
      ? averageTogglTime._avg.duration / 3600
      : 0;

    // Get tasks with delegate
    const linearTasksWithCursor = await prisma.linearTask?.findMany({
      where: {
        ...taskDateFilter,
        delegateId: { not: null },
      },
    });

    const linearTasksWithDelegatePercentage =
      linearTasksCount && linearTasksCount > 0
        ? (linearTasksWithCursor.length / linearTasksCount) * 100
        : 0;

    return {
      linearTasksCount: linearTasksCount ?? 0,
      linearTasksWithTogglTimePercentage,
      linearTasksWithTogglTimeCount: linearTasksWithTime.length,
      averageTogglTimeHours,
      linearTasksWithDelegatePercentage,
    };
  } finally {
    await prisma.$disconnect();
  }
}
