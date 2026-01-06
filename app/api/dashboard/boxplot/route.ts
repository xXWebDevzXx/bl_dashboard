import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { parseEstimateToHours } from "@/lib/boxplot-utils";
import { computeBoxplotStats, type BoxplotStats } from "@/lib/stats/boxplot";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

interface IssueDataPoint {
  identifier: string;
  group: "AI" | "Non-AI";
  value: number;
}

interface TopOutlier {
  identifier: string;
  value: number;
}

interface BoxplotResponse {
  metric: "actual" | "accuracy" | "leadTime";
  unit: "hours" | "percent" | "days";
  ai: BoxplotStats & { topOutliers: TopOutlier[] };
  nonAi: BoxplotStats & { topOutliers: TopOutlier[] };
  issueData: IssueDataPoint[];
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const metric = searchParams.get("metric") || "actual";

    if (!from || !to) {
      return NextResponse.json(
        { error: "Missing required query parameters: from and to" },
        { status: 400 }
      );
    }

    if (metric !== "actual" && metric !== "accuracy" && metric !== "leadTime") {
      return NextResponse.json(
        { error: "Invalid metric. Must be 'actual', 'accuracy', or 'leadTime'" },
        { status: 400 }
      );
    }

    // Parse dates
    const startDate = new Date(from);
    const endDate = new Date(to);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format. Use YYYY-MM-DD" },
        { status: 400 }
      );
    }

    // Build date filters
    const startTimestamp = Math.floor(startDate.getTime() / 1000);
    const endTimestamp = Math.floor(endDate.getTime() / 1000);
    const startDateStr = from;
    const endDateStr = to + "T23:59:59.999Z";

    // Build task date filter (createdAt/startedAt/completedAt)
    const taskDateFilter = {
      OR: [
        {
          createdAt: {
            gte: startTimestamp,
            lte: endTimestamp,
          },
        },
        {
          startedAt: {
            gte: startTimestamp,
            lte: endTimestamp,
          },
        },
        {
          completedAt: {
            gte: startTimestamp,
            lte: endTimestamp,
          },
        },
      ],
    };

    // Build toggl time date filter (based on start string)
    const togglTimeDateFilter = {
      start: {
        gte: startDateStr,
        lte: endDateStr,
      },
    };

    // Build base where clause based on metric
    const baseWhere: Prisma.LinearTaskWhereInput = { ...taskDateFilter };
    
    if (metric === "leadTime") {
      // Lead time requires completedAt
      baseWhere.completedAt = {
        not: null,
        gte: startTimestamp,
        lte: endTimestamp,
      };
    } else {
      // Actual and accuracy require toggl times
      baseWhere.togglTimes = {
        some: togglTimeDateFilter,
      };
    }

    // Fetch tasks based on metric requirements
    const tasks = await prisma.linearTask.findMany({
      where: baseWhere,
      select: {
        taskId: true,
        delegateId: true,
        estimatedTime: true,
        createdAt: true,
        completedAt: true,
        togglTimes: metric !== "leadTime" ? {
          where: togglTimeDateFilter,
          select: {
            duration: true,
          },
        } : undefined,
      },
      take: 10000, // Reasonable limit to prevent memory issues
    });

    // Calculate per-issue metrics with identifiers
    const aiDataPoints: IssueDataPoint[] = [];
    const nonAiDataPoints: IssueDataPoint[] = [];

    for (const task of tasks) {
      const group: "AI" | "Non-AI" = task.delegateId !== null ? "AI" : "Non-AI";
      let value: number | null = null;

      if (metric === "actual") {
        // Actual time per issue: sum(togglTimes.duration) / 3600
        if (task.togglTimes && task.togglTimes.length > 0) {
          const actualHours = task.togglTimes.reduce(
            (sum, time) => sum + time.duration / 3600,
            0
          );
          value = actualHours;
        }
      } else if (metric === "accuracy") {
        // Accuracy per issue: (actual / estimated) * 100
        if (task.togglTimes && task.togglTimes.length > 0) {
          const actualHours = task.togglTimes.reduce(
            (sum, time) => sum + time.duration / 3600,
            0
          );
          const estimatedHours = parseEstimateToHours(task.estimatedTime);
          if (estimatedHours !== null && estimatedHours > 0 && actualHours > 0) {
            value = (actualHours / estimatedHours) * 100;
          }
        }
      } else if (metric === "leadTime") {
        // Lead time: (completedAt - createdAt) / 86400 days
        if (task.completedAt && task.createdAt) {
          const days = (task.completedAt - task.createdAt) / 86400;
          if (days >= 0) {
            value = days;
          }
        }
      }

      // Only add if value is valid
      if (value !== null && value >= 0) {
        const dataPoint: IssueDataPoint = {
          identifier: task.taskId,
          group,
          value,
        };
        if (group === "AI") {
          aiDataPoints.push(dataPoint);
        } else {
          nonAiDataPoints.push(dataPoint);
        }
      }
    }

    // Extract values for stats calculation
    const aiValues = aiDataPoints.map((dp) => dp.value);
    const nonAiValues = nonAiDataPoints.map((dp) => dp.value);

    // Compute comprehensive stats for both groups
    const aiStats = computeBoxplotStats(aiValues);
    const nonAiStats = computeBoxplotStats(nonAiValues);

    // Round values appropriately
    // Tooltip: hours=2 decimals, %/days=1 decimal
    // Axis: all 1 decimal
    const roundTooltip = (value: number): number => {
      if (metric === "actual") {
        return Math.round(value * 100) / 100; // 2 decimals for hours
      }
      return Math.round(value * 10) / 10; // 1 decimal for % and days
    };

    // Get top 3 outliers with identifiers for each group
    const getTopOutliers = (dataPoints: IssueDataPoint[], stats: BoxplotStats) => {
      const outlierValues = new Set(stats.outliers.map(roundTooltip));
      return dataPoints
        .filter((dp) => {
          const rounded = roundTooltip(dp.value);
          return outlierValues.has(rounded);
        })
        .sort((a, b) => b.value - a.value)
        .slice(0, 3)
        .map((dp) => ({
          identifier: dp.identifier,
          value: roundTooltip(dp.value),
        }));
    };

    const roundStats = (stats: BoxplotStats): BoxplotStats => {
      return {
        ...stats,
        min: roundTooltip(stats.min),
        q1: roundTooltip(stats.q1),
        median: roundTooltip(stats.median),
        q3: roundTooltip(stats.q3),
        max: roundTooltip(stats.max),
        mean: roundTooltip(stats.mean),
        p95: roundTooltip(stats.p95),
        iqr: roundTooltip(stats.iqr),
        whiskerLow: roundTooltip(stats.whiskerLow),
        whiskerHigh: roundTooltip(stats.whiskerHigh),
        outliers: stats.outliers.map(roundTooltip),
      };
    };

    const response: BoxplotResponse = {
      metric: metric as "actual" | "accuracy" | "leadTime",
      unit: metric === "actual" ? "hours" : metric === "accuracy" ? "percent" : "days",
      ai: {
        ...roundStats(aiStats),
        topOutliers: getTopOutliers(aiDataPoints, aiStats),
      },
      nonAi: {
        ...roundStats(nonAiStats),
        topOutliers: getTopOutliers(nonAiDataPoints, nonAiStats),
      },
      issueData: [...aiDataPoints, ...nonAiDataPoints],
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching boxplot data:", error);
    return NextResponse.json(
      { error: "Failed to fetch boxplot data" },
      { status: 500 }
    );
  }
}
