import { PrismaClient } from "@/app/generated/prisma/client";

export async function getDashboardStats() {
  const prisma = new PrismaClient();

  try {
    // Get total tasks count
    const linearTasksCount = await prisma.linearTask?.count();

    // Get tasks with Toggl time
    const linearTasksWithTime = await prisma.linearTask?.findMany({
      where: {
        togglTimes: { some: {} },
      },
    });

    const linearTasksWithTogglTimePercentage =
      (linearTasksWithTime.length / linearTasksCount) * 100;

    // Get average Toggl time
    const averageTogglTime = await prisma.togglTime?.aggregate({
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
        delegateId: { not: null },
      },
    });

    const linearTasksWithDelegatePercentage =
      (linearTasksWithCursor.length / linearTasksCount) * 100;

    return {
      linearTasksCount,
      linearTasksWithTogglTimePercentage,
      averageTogglTimeHours,
      linearTasksWithDelegatePercentage,
    };
  } finally {
    await prisma.$disconnect();
  }
}
