"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell } from "recharts";
import { cn } from "@/lib/utils";
import { ChartContainer, ChartTooltip, ChartLegend, ChartLegendContent, ChartConfig } from "@/components/ui/chart";

interface RadialChartData {
  labelTaskCounts: { label: string; count: number }[];
  totalTasks: number;
}

interface Props {
  className?: string;
  initialData?: RadialChartData;
}

export default function DashboardRadialChart({ className, initialData }: Props) {
  const [data, setData] = useState<RadialChartData | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    // If initial data is provided, use it
    if (initialData) {
      setData(initialData);
      setLoading(false);
      return;
    }

    // Otherwise, fetch from API (fallback for backward compatibility)
    async function fetchData() {
      try {
        const response = await fetch("/api/dashboard/task-distribution");
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching label task distribution:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [initialData]);

  if (loading) {
    return (
      <div className={cn("bg-card border border-border-zinc/60 p-4 sm:p-6 rounded-sm shadow-xl shadow-black/25 animate-[fadeInScale_0.6s_ease-out_0.4s_both] overflow-hidden", className)}>
        <h2 className="text-lg sm:text-xl desktop:text-2xl font-bold text-white mb-4">Issue Distribution by Label</h2>
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    );
  }

  if (!data || !data.labelTaskCounts) {
    return null;
  }

  // Prepare data for radial chart
  // Use emerald and cyan color scheme - lightest (center) to darkest (outer)
  const colors = [
    "#6ee7b7", // emerald-light (lightest - center)
    "#5eead4", // teal-300
    "#67e8f9", // cyan-light
    "#34d399", // emerald-light
    "#2dd4bf", // teal-400
    "#22d3ee", // cyan-light
    "#10b981", // emerald-normal
    "#14b8a6", // teal-500
    "#06b6d4", // cyan-normal
    "#059669", // emerald-normal
    "#0d9488", // teal-600
    "#0891b2", // cyan-normal (darkest - outer)
  ];

  // Gradient end colors (slightly darker for each)
  const gradientEndColors = [
    "#34d399", // emerald-light
    "#2dd4bf", // teal-400
    "#22d3ee", // cyan-light
    "#10b981", // emerald-normal
    "#14b8a6", // teal-500
    "#06b6d4", // cyan-normal
    "#059669", // emerald-normal
    "#0d9488", // teal-600
    "#0891b2", // cyan-normal
    "#047857", // emerald-normal
    "#0f766e", // teal-700
    "#0e7490", // cyan-normal
  ];

  // Sort by largest first for better visualization
  const sortedChartData = [...data.labelTaskCounts].sort((a, b) => b.count - a.count);
  const chartData = sortedChartData.map((item, idx) => ({
    name: item.label,
    value: item.count,
    baseColor: colors[idx % colors.length],
    endColor: gradientEndColors[idx % gradientEndColors.length],
    fill: `var(--color-${item.label.toLowerCase().replace(/\s+/g, '-')})`,
  }));

  // Create chart config for shadcn
  const chartConfig = sortedChartData.reduce((config, item, idx) => {
    const key = item.label.toLowerCase().replace(/\s+/g, '-');
    config[key] = {
      label: item.label,
      color: colors[idx % colors.length],
    };
    return config;
  }, {} as ChartConfig);

  return (
    <div className={cn("bg-card border border-border-zinc/60 p-4 sm:p-6 rounded-sm shadow-xl shadow-black/25 animate-[fadeInScale_0.6s_ease-out_0.4s_both] overflow-hidden", className)}>
      <div className="mb-4">
        <h2 className="text-lg sm:text-xl desktop:text-2xl font-bold text-white mb-2">Issue Distribution by Label</h2>
        <p className="text-xs sm:text-sm text-gray-400">How issues are distributed across labels</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6" onMouseLeave={() => setActiveIndex(-1)}>
        {chartData.map((item, idx) => (
          <div
            key={item.name}
            className="bg-card-foreground p-3 sm:p-4 rounded border border-border-zinc/40 hover:border-border-zinc/60 transition-all hover:shadow-lg"
            style={{
              boxShadow: activeIndex === idx ? `0 10px 15px -3px ${item.baseColor}20, 0 4px 6px -2px ${item.baseColor}10` : undefined,
              borderColor: activeIndex === idx ? `${item.baseColor}60` : undefined,
            }}
            onMouseEnter={() => setActiveIndex(idx)}
          >
            <p className="text-xs text-gray-400 mb-1">{item.name}</p>
            <p className="text-2xl sm:text-3xl font-bold" style={{ color: item.baseColor }}>{item.value}</p>
            <p className="text-xs text-gray-500">{((item.value / data.totalTasks) * 100).toFixed(1)}%</p>
          </div>
        ))}
      </div>

      {/* Pie Chart */}
      <div
        className="h-80 sm:h-[360px] w-full bg-card-foreground rounded-lg border border-border-zinc/60 shadow-inner"
        onMouseLeave={() => setActiveIndex(-1)}
      >
        <ChartContainer config={chartConfig} className="h-full w-full">
          <PieChart>
            <defs>
              {chartData.map((item, idx) => (
                <linearGradient
                  key={`pieGradient-${idx}`}
                  id={`pieGradient-${idx}`}
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor={item.baseColor} stopOpacity={0.4} />
                  <stop offset="50%" stopColor={item.baseColor} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={item.endColor} stopOpacity={0.1} />
                </linearGradient>
              ))}
            </defs>
            <ChartTooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload[0]) return null;
                const sliceData = payload[0].payload;
                return (
                  <div className="bg-card-foreground border border-border-zinc/60 rounded-lg p-3 shadow-xl">
                    <p className="text-white font-semibold mb-1">{sliceData.name}</p>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: sliceData.baseColor }}
                      />
                      <p className="text-gray-300 text-sm">
                        <span className="font-bold">{sliceData.value}</span> issues
                      </p>
                    </div>
                    <p className="text-gray-400 text-xs mt-1">
                      {((sliceData.value / data.totalTasks) * 100).toFixed(1)}% of total
                    </p>
                  </div>
                );
              }}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius="45%"
              outerRadius="75%"
              strokeWidth={2}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              isAnimationActive={false}
              label={(props: { cx?: number; cy?: number; midAngle?: number; outerRadius?: number; name?: string; percent?: number; index?: number }) => {
                const { cx, cy, midAngle, outerRadius, name, percent, index } = props;
                if (!cx || !cy || !outerRadius || !name || index === undefined) return null;
                if (!midAngle) return null;

                const RADIAN = Math.PI / 180;
                // Keep constant radius so labels don't move
                const radius = outerRadius + 30;
                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                const y = cy + radius * Math.sin(-midAngle * RADIAN);
                const entry = chartData[index];

                // Safety check: if entry is undefined, return null
                if (!entry || !entry.baseColor) return null;

                return (
                  <text
                    x={x}
                    y={y}
                    fill={entry.baseColor}
                    textAnchor={x > cx ? 'start' : 'end'}
                    dominantBaseline="central"
                    fontSize={12}
                    fontWeight={600}
                    pointerEvents="none"
                  >
                    {`${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                  </text>
                );
              }}
              labelLine={{
                stroke: "#9CA3AF",
                strokeWidth: 1,
                pointerEvents: "none",
              }}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={`url(#pieGradient-${index})`}
                  stroke={entry.baseColor}
                  strokeWidth={1}
                  style={{
                    filter: activeIndex === index ? 'brightness(1.2)' : undefined,
                    transform: activeIndex === index ? 'scale(1.05)' : undefined,
                    transformOrigin: 'center',
                    transition: 'all 0.3s ease',
                  }}
                />
              ))}
            </Pie>
            <ChartLegend content={<ChartLegendContent />} />
          </PieChart>
        </ChartContainer>
      </div>

      {/* Total */}
      <div className="mt-4 p-3 sm:p-4 bg-card-foreground rounded-lg border border-border-zinc/40 text-center hover:border-border-zinc/60 transition-colors">
        <p className="text-xs sm:text-sm text-gray-400 font-medium mb-1">Total Issues</p>
        <p className="text-3xl sm:text-4xl font-bold text-white">{data.totalTasks}</p>
      </div>
    </div>
  );
}
