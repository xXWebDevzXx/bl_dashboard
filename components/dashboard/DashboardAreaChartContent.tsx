"use client";

import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ContentType } from "recharts/types/component/DefaultLegendContent";

const chartConfig = {
  aiTasksHours: {
    label: "AI Issues",
    color: "#059669",
  },
  nonAiTasksHours: {
    label: "Non-AI Issues",
    color: "#0891b2",
  },
} satisfies ChartConfig;

interface ChartData {
  date: string;
  aiTasksHours: number;
  nonAiTasksHours: number;
  formattedDate?: string;
}

export default function DashboardAreaChartContent() {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString("da-DK", { month: "short" });
    return `${day}. ${month}`;
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/dashboard/time-chart");

        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`);
        }

        const data = await response.json();

        // Check if the response is an error or not an array
        if (!response.ok || !Array.isArray(data)) {
          console.error("API returned error:", data);
          setChartData([]);
          return;
        }

        // Format dates for display
        const formattedData = data.map((item: ChartData) => ({
          ...item,
          formattedDate: formatDate(item.date),
        }));
        setChartData(formattedData);
      } catch (error) {
        console.error("Error fetching chart data:", error);
        setChartData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-2 sm:p-4">
        <h1 className="text-lg sm:text-xl desktop:text-2xl font-bold text-white mb-4">
          AI vs Non-AI issues
        </h1>
        <p className="text-white text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <div className="p-2 sm:p-4 mb-2 sm:mb-4">
        <h1 className="text-lg sm:text-xl desktop:text-2xl font-bold text-white">
          AI vs Non-AI issues
        </h1>
      </div>
      <ChartContainer
        config={chartConfig}
        className="h-[150px] sm:h-[180px] desktop:h-[300px] w-full pb-0"
      >
        <AreaChart
          accessibilityLayer
          data={chartData}
          margin={{ left: 8, right: 8, top: 8, bottom: 0 }}
        >
          <defs>
            <linearGradient id="gradientAiTasks" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#84B2FF" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#84B2FF" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="gradientNonAiTasks" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4876DE" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#4876DE" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="white" opacity="0.04" />
          <XAxis
            dataKey="formattedDate"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            className="text-xs sm:text-sm"
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => `${value}h`}
            width={25}
            className="text-xs sm:text-sm"
          />
          <Tooltip content={<ChartTooltipContent />} />
          <ChartLegend
            className="text-white text-xs sm:text-sm"
            content={ChartLegendContent as unknown as ContentType}
          />
          <Area
            dataKey="aiTasksHours"
            type="linear"
            fill="url(#gradientAiTasks)"
            stroke="var(--color-aiTasksHours)"
            stackId="a"
          />
          <Area
            dataKey="nonAiTasksHours"
            type="linear"
            fill="url(#gradientNonAiTasks)"
            stroke="var(--color-nonAiTasksHours)"
            stackId="b"
          />
        </AreaChart>
      </ChartContainer>
    </>
  );
}
