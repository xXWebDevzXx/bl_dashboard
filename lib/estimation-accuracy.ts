import { PrismaClient, LinearTask, TogglTime } from "@prisma/client";
import { parseEstimateToNumber } from "./estimate-utils";

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

export async function getEstimationAccuracy(): Promise<EstimationAccuracyData> {
  const prisma = new PrismaClient();

  try {
    // Get all tasks with both estimated time and actual toggl time
    const tasksWithTime = await prisma.linearTask.findMany({
      where: {
        togglTimes: { some: {} },
        estimatedTime: { not: "" },
      },
      include: {
        togglTimes: true,
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
  } finally {
    await prisma.$disconnect();
  }
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
