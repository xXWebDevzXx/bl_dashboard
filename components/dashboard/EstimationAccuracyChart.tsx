"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

interface EstimationData {
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

interface Props {
  className?: string;
}

export default function EstimationAccuracyChart({ className }: Props) {
  const [data, setData] = useState<EstimationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/dashboard/estimation-accuracy");
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching estimation accuracy:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className={cn("bg-[#1A1F26] p-6 rounded-sm", className)}>
        <h2 className="text-xl font-bold text-white mb-4">Estimation Accuracy</h2>
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  // Prepare data for bar chart
  const chartData = [
    {
      name: "AI Tasks",
      Estimated: data.aiTasks.averageEstimated,
      Actual: data.aiTasks.averageActual,
      count: data.aiTasks.taskCount,
    },
    {
      name: "Non-AI Tasks",
      Estimated: data.nonAiTasks.averageEstimated,
      Actual: data.nonAiTasks.averageActual,
      count: data.nonAiTasks.taskCount,
    },
  ];

  return (
    <div className={cn("bg-[#1A1F26] p-6 rounded-sm", className)}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Estimation Accuracy</h2>
        <p className="text-sm text-gray-400">Estimated vs Actual hours per task</p>
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-[#0D1117] p-4 rounded">
          <p className="text-xs text-gray-400 mb-1">AI Tasks Accuracy</p>
          {data.aiTasks.taskCount > 0 ? (
            <>
              <p className="text-2xl font-bold text-emerald-500">
                {data.aiTasks.accuracyPercentage.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500">{data.aiTasks.taskCount} tasks</p>
            </>
          ) : (
            <p className="text-sm text-gray-500 italic">No data available</p>
          )}
        </div>
        <div className="bg-[#0D1117] p-4 rounded">
          <p className="text-xs text-gray-400 mb-1">Non-AI Tasks Accuracy</p>
          {data.nonAiTasks.taskCount > 0 ? (
            <>
              <p className="text-2xl font-bold text-cyan-500">
                {data.nonAiTasks.accuracyPercentage.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500">{data.nonAiTasks.taskCount} tasks</p>
            </>
          ) : (
            <p className="text-sm text-gray-500 italic">No data available</p>
          )}
        </div>
      </div>

      {/* Bar Chart */}
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis
              dataKey="name"
              stroke="#9CA3AF"
              tick={{ fill: "#9CA3AF" }}
            />
            <YAxis
              stroke="#9CA3AF"
              tick={{ fill: "#9CA3AF" }}
              label={{ value: "Hours", angle: -90, position: "insideLeft", fill: "#9CA3AF" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1A1F26",
                border: "1px solid #374151",
                borderRadius: "4px",
              }}
              labelStyle={{ color: "#fff" }}
              itemStyle={{ color: "#9CA3AF" }}
            />
            <Legend
              wrapperStyle={{ color: "#9CA3AF" }}
            />
            <Bar dataKey="Actual" fill="#0891b2" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Estimated" fill="#059669" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Interpretation */}
      <div className="mt-4 p-3 bg-[#0D1117] rounded">
        <p className="text-xs text-gray-400">
          {data.aiTasks.taskCount === 0
            ? "ℹ Add estimated time to AI tasks to see accuracy metrics"
            : data.aiTasks.accuracyPercentage < 100
            ? "✓ AI tasks are completed faster than estimated"
            : data.aiTasks.accuracyPercentage > 110
            ? "⚠ AI tasks are taking longer than estimated"
            : "✓ AI task estimates are accurate"}
        </p>
      </div>
    </div>
  );
}
