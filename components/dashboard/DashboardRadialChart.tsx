"use client";

import { useEffect, useState } from "react";
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

interface RadialChartData {
  labelTaskCounts: { label: string; count: number }[];
  totalTasks: number;
}

interface Props {
  className?: string;
}

export default function DashboardRadialChart({ className }: Props) {
  const [data, setData] = useState<RadialChartData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, []);

  if (loading) {
    return (
      <div className={cn("bg-[#161B22] border border-zinc-800/60 p-4 sm:p-6 rounded-sm shadow-xl shadow-black/20 animate-[fadeInScale_0.6s_ease-out_0.4s_both] overflow-hidden", className)}>
        <h2 className="text-lg sm:text-xl desktop:text-2xl font-bold text-white mb-4">Task Distribution by Label</h2>
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    );
  }

  if (!data || !data.labelTaskCounts) {
    return null;
  }

  // Prepare data for radial chart
  // Use colors that match the dashboard theme
  const colors = [
    "#38bdf8", // sky-400
    "#34d399", // emerald-400
    "#fbbf24", // amber-400
    "#6366f1", // indigo-500
    "#f43f5e", // rose-500
    "#a21caf", // purple-700
    "#e11d48", // rose-600
    "#84cc16", // lime-500
    "#0891b2", // cyan-600
    "#f59e42", // orange-400
  ];
  // Sort so largest is last (innermost ring)
  const sortedChartData = [...data.labelTaskCounts].sort((a, b) => a.count - b.count);
  const chartData = sortedChartData.map((item, idx) => ({
    name: item.label,
    value: item.count,
    fill: colors[idx % colors.length],
  }));

  return (
    <div className={cn("bg-[#161B22] border border-zinc-800/60 p-4 sm:p-6 rounded-sm shadow-xl shadow-black/20 animate-[fadeInScale_0.6s_ease-out_0.4s_both] overflow-hidden", className)}>
      <div className="mb-4">
        <h2 className="text-lg sm:text-xl desktop:text-2xl font-bold text-white mb-2">Task Distribution by Label</h2>
        <p className="text-xs sm:text-sm text-gray-400">How tasks are distributed across labels</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {sortedChartData.map((item, idx) => (
          <div key={item.label} className="bg-[#0D1117] p-3 sm:p-4 rounded">
            <p className="text-xs text-gray-400 mb-1">{item.label}</p>
            <p className="text-2xl sm:text-3xl font-bold" style={{ color: colors[idx % colors.length] }}>{item.count}</p>
            <p className="text-xs text-gray-500">{((item.count / data.totalTasks) * 100).toFixed(1)}%</p>
          </div>
        ))}
      </div>

      {/* Radial Chart */}
      <div className="h-[220px] sm:h-[260px] w-full flex items-center justify-center bg-[#0D1117] rounded-lg border border-zinc-800/60 shadow-inner">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="35%"
            outerRadius="90%"
            barSize={18}
            data={chartData}
            startAngle={90}
            endAngle={-270}
          >
            <RadialBar
              background={{ fill: "#161B22" }}
              dataKey="value"
              cornerRadius={12}
              label={{ position: "insideStart", fill: "#e5e7eb", fontSize: 13, fontWeight: 500 }}
            />
            <Legend
              iconSize={12}
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{
                fontSize: "13px",
                color: "#d1d5db",
                marginTop: "8px",
                fontWeight: 500,
                letterSpacing: "0.02em",
              }}
            />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>

      {/* Total */}
      <div className="mt-4 p-3 bg-[#0D1117] rounded text-center">
        <p className="text-xs text-gray-400">Total Tasks</p>
        <p className="text-3xl font-bold text-white">{data.totalTasks}</p>
      </div>
    </div>
  );
}
