import { auth0 } from "./auth0";
import { getDashboardStats } from "./dashboard-stats";
import {
  EstimationAccuracyData,
  getEstimationAccuracy,
} from "./estimation-accuracy";
import { prisma } from "./prisma/client";
import { getTimeChartData, TimeChartData } from "./time-chart-data";

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
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export async function getReportData(dateRange?: DateRange): Promise<ReportData> {
  // Fetch all dashboard data in parallel
  const [stats, timeChartData, estimationAccuracy, taskDistribution] =
    await Promise.all([
      getDashboardStats(dateRange),
      getTimeChartData(dateRange),
      getEstimationAccuracy(dateRange),
      getTaskDistribution(dateRange),
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
