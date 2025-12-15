import { LinearTask, TogglTime } from "@prisma/client";
import { parseEstimateToNumber } from "./estimate-utils";
import type { DateRange } from "./report-data";
import { prisma } from "./prisma/client";

interface TaskWithTogglTimes extends LinearTask {
  togglTimes: TogglTime[];
}

export interface EstimationAccuracyData {
  aiTasks: {
    averageEstimated: number;
    averageActual: number;
    accuracyPercentage: number;
    taskCount: number;
  };
  nonAiTasks: {
    averageEstimated: number;
    averageActual: number;
    accuracyPercentage: number;
    taskCount: number;
  };
  overall: {
    averageEstimated: number;
    averageActual: number;
    accuracyPercentage: number;
  };
}

export async function getEstimationAccuracy(dateRange?: DateRange): Promise<EstimationAccuracyData> {
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

  // Build date filter for toggl times
  // For string fields, we use string comparison which works for ISO date strings
  const startDateStr = dateRange ? dateRange.startDate.toISOString().split("T")[0] : undefined;
  const endDateStr = dateRange ? dateRange.endDate.toISOString().split("T")[0] : undefined;
  const togglTimeDateFilter = dateRange && startDateStr && endDateStr
    ? {
        start: {
          gte: startDateStr,
          lte: endDateStr + "T23:59:59.999Z",
        },
      }
    : undefined;

  // Get all tasks with both estimated time and actual toggl time
  const tasksWithTime = await prisma.linearTask.findMany({
    where: {
      ...taskDateFilter,
      togglTimes: {
        some: togglTimeDateFilter || {},
      },
      estimatedTime: {
        not: { equals: "" },
      },
    },
    include: {
      togglTimes: {
        where: togglTimeDateFilter,
      },
    },
  });

  // Separate AI and Non-AI tasks
  const aiTasks = tasksWithTime.filter(task => task.delegateId !== null);
  const nonAiTasks = tasksWithTime.filter(task => task.delegateId === null);

  // Calculate metrics for AI tasks
  const aiMetrics = calculateMetrics(aiTasks);

  // Calculate metrics for Non-AI tasks
  const nonAiMetrics = calculateMetrics(nonAiTasks);

  // Calculate overall metrics
  const overallMetrics = calculateMetrics(tasksWithTime);

  return {
    aiTasks: aiMetrics,
    nonAiTasks: nonAiMetrics,
    overall: overallMetrics,
  };
}

function calculateMetrics(tasks: TaskWithTogglTimes[]) {
  if (tasks.length === 0) {
    return {
      averageEstimated: 0,
      averageActual: 0,
      accuracyPercentage: 0,
      taskCount: 0,
    };
  }

  let totalEstimated = 0;
  let totalActual = 0;

  tasks.forEach(task => {
    const estimatedHours = parseEstimateToNumber(task.estimatedTime);
    totalEstimated += estimatedHours;

    // Sum all toggl times for this task (convert seconds to hours)
    const actualHours = task.togglTimes.reduce(
      (sum: number, time: TogglTime) => sum + time.duration / 3600,
      0
    );
    totalActual += actualHours;
  });

  const averageEstimated = totalEstimated / tasks.length;
  const averageActual = totalActual / tasks.length;

  // Calculate accuracy percentage: (actual / estimated) * 100
  // 100% = perfect match
  // <100% = completed faster than estimated (good)
  // >100% = took longer than estimated (needs improvement)
  const accuracyPercentage = averageEstimated > 0
    ? (averageActual / averageEstimated) * 100
    : 0;

  return {
    averageEstimated: Math.round(averageEstimated * 100) / 100,
    averageActual: Math.round(averageActual * 100) / 100,
    accuracyPercentage: Math.round(accuracyPercentage * 10) / 10,
    taskCount: tasks.length,
  };
}
