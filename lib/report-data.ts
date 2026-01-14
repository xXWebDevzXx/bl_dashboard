import { auth0 } from "./auth0";
import { parseEstimateToHours } from "./boxplot-utils";
import { getDashboardStats } from "./dashboard-stats";
import {
  EstimationAccuracyData,
  getEstimationAccuracy,
} from "./estimation-accuracy";
import { prisma } from "./prisma/client";
import { computeBoxplotStats, type BoxplotStats } from "./stats/boxplot";
import { getTimeChartData, TimeChartData } from "./time-chart-data";

export interface BoxplotReportData {
  metric: "actual" | "accuracy" | "leadTime";
  unit: "hours" | "percent" | "days";
  ai: BoxplotStats;
  nonAi: BoxplotStats;
}

export interface ReportData {
  metadata: {
    generatedAt: string;
    generatedDate: string;
  };
  stats: {
    linearTasksCount: number;
    linearTasksWithTogglTimePercentage: number;
    linearTasksWithTogglTimeCount: number;
    averageTogglTimeHours: number;
    linearTasksWithDelegatePercentage: number;
  };
  timeChartData: TimeChartData[];
  estimationAccuracy: EstimationAccuracyData;
  taskDistribution: {
    labelTaskCounts: Array<{ label: string; count: number }>;
    totalTasks: number;
  };
  boxplotStats: {
    actualTime: BoxplotReportData;
    accuracy: BoxplotReportData;
    leadTime: BoxplotReportData;
  };
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export async function getReportData(dateRange?: DateRange): Promise<ReportData> {
  // Fetch all dashboard data in parallel
  const [stats, timeChartData, estimationAccuracy, taskDistribution, boxplotStats] =
    await Promise.all([
      getDashboardStats(dateRange),
      getTimeChartData(dateRange),
      getEstimationAccuracy(dateRange),
      getTaskDistribution(dateRange),
      getBoxplotStats(dateRange),
    ]);

  const now = new Date();

  return {
    metadata: {
      generatedAt: now.toISOString(),
      generatedDate: now.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    },
    stats,
    timeChartData,
    estimationAccuracy,
    taskDistribution,
    boxplotStats,
  };
}

async function getTaskDistribution(dateRange?: DateRange) {
  try {
    const session = await auth0.getSession();
    if (!session?.user) {
      return {
        labelTaskCounts: [],
        totalTasks: 0,
      };
    }

    const auth0Id = session.user.sub;
    const user = await prisma.user.findUnique({
      where: { auth0Id },
    });

    if (!user) {
      return {
        labelTaskCounts: [],
        totalTasks: 0,
      };
    }

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

    // Get all labels and count tasks per label
    const labels = await prisma.linearLabel.findMany({
      include: {
        tasks: {
          include: {
            linearTask: true,
          },
        },
      },
    });

    // Filter tasks by date range if provided, then map to { label: string, count: number }
    let allLabelCounts = labels.map((label) => {
      let filteredTasks = label.tasks;
      
      if (taskDateFilter && taskDateFilter.OR) {
        filteredTasks = label.tasks.filter((taskLabel) => {
          const task = taskLabel.linearTask;
          
          // Check if task matches any of the OR conditions
          return taskDateFilter.OR.some((condition) => {
            if (condition.createdAt) {
              return task.createdAt >= condition.createdAt.gte && 
                     task.createdAt <= condition.createdAt.lte;
            }
            if (condition.startedAt && task.startedAt) {
              return task.startedAt >= condition.startedAt.gte && 
                     task.startedAt <= condition.startedAt.lte;
            }
            if (condition.completedAt && task.completedAt) {
              return task.completedAt >= condition.completedAt.gte && 
                     task.completedAt <= condition.completedAt.lte;
            }
            return false;
          });
        });
      }
      
      return {
        label: label.name,
        count: filteredTasks.length,
      };
    });

    // Sort by count descending
    allLabelCounts = allLabelCounts.sort((a, b) => b.count - a.count);
    const topLabels = allLabelCounts.slice(0, 5);
    const otherLabels = allLabelCounts.slice(5);
    const otherCount = otherLabels.reduce((sum, item) => sum + item.count, 0);
    const labelTaskCounts = [...topLabels];
    if (otherCount > 0) {
      labelTaskCounts.push({ label: "Other", count: otherCount });
    }

    // Get total tasks for reference
    const totalTasks = await prisma.linearTask.count({
      where: taskDateFilter,
    });

    return {
      labelTaskCounts,
      totalTasks,
    };
  } catch (error) {
    console.error("Error fetching task distribution:", error);
    return {
      labelTaskCounts: [],
      totalTasks: 0,
    };
  }
}

async function getBoxplotStats(dateRange?: DateRange): Promise<{
  actualTime: BoxplotReportData;
  accuracy: BoxplotReportData;
  leadTime: BoxplotReportData;
}> {
  try {
    // Default to current year if no date range provided
    const startDate = dateRange?.startDate ?? new Date(new Date().getFullYear(), 0, 1);
    const endDate = dateRange?.endDate ?? new Date(new Date().getFullYear(), 11, 31);
    
    const startTimestamp = Math.floor(startDate.getTime() / 1000);
    const endTimestamp = Math.floor(endDate.getTime() / 1000);
    const startDateStr = startDate.toISOString().split("T")[0];
    const endDateStr = endDate.toISOString().split("T")[0] + "T23:59:59.999Z";

    // Build date filters
    const taskDateFilter = {
      OR: [
        { createdAt: { gte: startTimestamp, lte: endTimestamp } },
        { startedAt: { gte: startTimestamp, lte: endTimestamp } },
        { completedAt: { gte: startTimestamp, lte: endTimestamp } },
      ],
    };

    const togglTimeDateFilter = {
      start: { gte: startDateStr, lte: endDateStr },
    };

    // Fetch tasks for actual time and accuracy metrics
    const tasksWithToggl = await prisma.linearTask.findMany({
      where: {
        ...taskDateFilter,
        togglTimes: { some: togglTimeDateFilter },
      },
      select: {
        taskId: true,
        delegateId: true,
        estimatedTime: true,
        togglTimes: {
          where: togglTimeDateFilter,
          select: { duration: true },
        },
      },
      take: 10000,
    });

    // Fetch tasks for lead time metric
    const tasksWithCompletion = await prisma.linearTask.findMany({
      where: {
        ...taskDateFilter,
        completedAt: { not: null, gte: startTimestamp, lte: endTimestamp },
      },
      select: {
        taskId: true,
        delegateId: true,
        createdAt: true,
        completedAt: true,
      },
      take: 10000,
    });

    // Calculate actual time values
    const aiActualValues: number[] = [];
    const nonAiActualValues: number[] = [];
    const aiAccuracyValues: number[] = [];
    const nonAiAccuracyValues: number[] = [];

    for (const task of tasksWithToggl) {
      if (task.togglTimes.length > 0) {
        const actualHours = task.togglTimes.reduce(
          (sum, time) => sum + time.duration / 3600,
          0
        );
        
        if (task.delegateId !== null) {
          aiActualValues.push(actualHours);
        } else {
          nonAiActualValues.push(actualHours);
        }

        // Calculate accuracy if estimate exists
        const estimatedHours = parseEstimateToHours(task.estimatedTime);
        if (estimatedHours !== null && estimatedHours > 0 && actualHours > 0) {
          const accuracy = (actualHours / estimatedHours) * 100;
          if (task.delegateId !== null) {
            aiAccuracyValues.push(accuracy);
          } else {
            nonAiAccuracyValues.push(accuracy);
          }
        }
      }
    }

    // Calculate lead time values
    const aiLeadTimeValues: number[] = [];
    const nonAiLeadTimeValues: number[] = [];

    for (const task of tasksWithCompletion) {
      if (task.completedAt && task.createdAt) {
        const days = (task.completedAt - task.createdAt) / 86400;
        if (days >= 0) {
          if (task.delegateId !== null) {
            aiLeadTimeValues.push(days);
          } else {
            nonAiLeadTimeValues.push(days);
          }
        }
      }
    }

    // Compute boxplot stats for all metrics
    const roundValue = (value: number, decimals: number): number => {
      const factor = Math.pow(10, decimals);
      return Math.round(value * factor) / factor;
    };

    const roundStats = (stats: BoxplotStats, decimals: number): BoxplotStats => ({
      ...stats,
      min: roundValue(stats.min, decimals),
      q1: roundValue(stats.q1, decimals),
      median: roundValue(stats.median, decimals),
      q3: roundValue(stats.q3, decimals),
      max: roundValue(stats.max, decimals),
      mean: roundValue(stats.mean, decimals),
      p95: roundValue(stats.p95, decimals),
      iqr: roundValue(stats.iqr, decimals),
      whiskerLow: roundValue(stats.whiskerLow, decimals),
      whiskerHigh: roundValue(stats.whiskerHigh, decimals),
      outliers: stats.outliers.map(v => roundValue(v, decimals)),
    });

    return {
      actualTime: {
        metric: "actual",
        unit: "hours",
        ai: roundStats(computeBoxplotStats(aiActualValues), 2),
        nonAi: roundStats(computeBoxplotStats(nonAiActualValues), 2),
      },
      accuracy: {
        metric: "accuracy",
        unit: "percent",
        ai: roundStats(computeBoxplotStats(aiAccuracyValues), 1),
        nonAi: roundStats(computeBoxplotStats(nonAiAccuracyValues), 1),
      },
      leadTime: {
        metric: "leadTime",
        unit: "days",
        ai: roundStats(computeBoxplotStats(aiLeadTimeValues), 1),
        nonAi: roundStats(computeBoxplotStats(nonAiLeadTimeValues), 1),
      },
    };
  } catch (error) {
    console.error("Error fetching boxplot stats:", error);
    const emptyStats: BoxplotStats = {
      min: 0, q1: 0, median: 0, q3: 0, max: 0,
      mean: 0, p95: 0, iqr: 0, whiskerLow: 0, whiskerHigh: 0,
      n: 0, outlierCount: 0, outliers: [],
    };
    return {
      actualTime: { metric: "actual", unit: "hours", ai: emptyStats, nonAi: emptyStats },
      accuracy: { metric: "accuracy", unit: "percent", ai: emptyStats, nonAi: emptyStats },
      leadTime: { metric: "leadTime", unit: "days", ai: emptyStats, nonAi: emptyStats },
    };
  }
}
