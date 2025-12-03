"use client";

import { ChartContainer, ChartConfig, ChartLegend, ChartLegendContent, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import type { ContentType } from "recharts/types/component/DefaultLegendContent";
import { useEffect, useState } from "react";

const chartConfig = {
  aiTasksHours: {
    label: "AI Tasks",
    color: "#059669",
  },
  nonAiTasksHours: {
    label: "Non-AI Tasks",
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
        const data = await response.json();
        // Format dates for display
        const formattedData = data.map((item: ChartData) => ({
          ...item,
          formattedDate: formatDate(item.date),
        }));
        setChartData(formattedData);
      } catch (error) {
        console.error("Error fetching chart data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold text-white mb-4">AI vs Non-AI tasks</h1>
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <div className="p-4 mb-4">
        <h1 className="text-2xl font-bold text-white">AI vs Non-AI tasks</h1>
      </div>
      <ChartContainer config={chartConfig} className="h-[200px] w-full">
        <AreaChart accessibilityLayer data={chartData} margin={{ left: 12, right: 12, top: 12, bottom: 12 }}>
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
          <XAxis dataKey="formattedDate" tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => `${value}h`} width={30} />
          <Tooltip content={<ChartTooltipContent />} />
          <ChartLegend className="text-white" content={ChartLegendContent as unknown as ContentType} />
          <Area dataKey="aiTasksHours" type="linear" fill="url(#gradientAiTasks)" stroke="var(--color-aiTasksHours)" stackId="a" />
          <Area dataKey="nonAiTasksHours" type="linear" fill="url(#gradientNonAiTasks)" stroke="var(--color-nonAiTasksHours)" stackId="b" />
        </AreaChart>
      </ChartContainer>
    </>
  );
}
