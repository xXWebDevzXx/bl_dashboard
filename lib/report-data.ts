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

export async function getReportData(): Promise<ReportData> {
  try {
    // Fetch all dashboard data in parallel
    const [stats, timeChartData, estimationAccuracy, taskDistribution] =
      await Promise.all([
        getDashboardStats(),
        getTimeChartData(),
        getEstimationAccuracy(),
        getTaskDistribution(),
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
  } finally {
    await prisma.$disconnect();
  }
}

async function getTaskDistribution() {
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

    // Get all labels and count tasks per label
    const labels = await prisma.linearLabel.findMany({
      include: {
        tasks: true,
      },
    });

    // Map to { label: string, count: number } and sort by count descending
    let allLabelCounts = labels.map((label) => ({
      label: label.name,
      count: label.tasks.length,
    }));

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
    const totalTasks = await prisma.linearTask.count();

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
