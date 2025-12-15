import { prisma } from "@/lib/prisma/client";
import type { DateRange } from "./report-data";

export interface TimeChartData {
  date: string;
  aiTasksHours: number;
  nonAiTasksHours: number;
}

export async function getTimeChartData(
  dateRange?: DateRange,
): Promise<TimeChartData[]> {
  try {
    // Build date filter for toggl times
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

    // Fetch all toggl times with their associated linear tasks
    const togglTimes = await prisma.togglTime.findMany({
      where: togglTimeDateFilter,
      include: {
        linearTask: {
          select: {
            delegateId: true,
          },
        },
      },
      orderBy: {
        start: "asc",
      },
    });

    // Group by date and sum durations for AI vs Non-AI tasks
    const dataByDate = new Map<
      string,
      { aiHours: number; nonAiHours: number }
    >();

    togglTimes.forEach((entry: (typeof togglTimes)[number]) => {
      // Extract date from start timestamp (format: "2025-01-15T10:30:00Z")
      const date = entry.start.split("T")[0];

      // Convert duration from seconds to hours
      const hours = entry.duration / 3600;

      // Get existing data for this date or initialize
      const existing =
        dataByDate.get(date) || { aiHours: 0, nonAiHours: 0 };

      // Add to AI or Non-AI based on delegate presence
      if (entry.linearTask.delegateId) {
        existing.aiHours += hours;
      } else {
        existing.nonAiHours += hours;
      }

      dataByDate.set(date, existing);
    });

    // Convert map to array and format for the chart
    const chartData: TimeChartData[] = Array.from(dataByDate.entries())
      .map(([date, data]) => ({
        date,
        aiTasksHours: Math.round(data.aiHours * 100) / 100, // Round to 2 decimals
        nonAiTasksHours:
          Math.round(data.nonAiHours * 100) / 100,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return chartData;
  } finally {
    await prisma.$disconnect();
  }
}
