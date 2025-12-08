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

// Custom bar shape with gradient and border (top and sides only, no bottom) - defined outside component
const GradientBar = (props: { fill?: string; x?: number; y?: number; width?: number; height?: number; payload?: unknown }) => {
  const { fill, x, y, width, height } = props;
  if (!fill || x === undefined || y === undefined || width === undefined || height === undefined) return null;

  // Determine border color based on which data key this is
  const isCyan = fill.includes("actualGradient");
  const strokeColor = isCyan ? "#22d3ee" : "#34d399";

  return (
    <g>
      {/* Main fill rectangle */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        rx={0}
      />
      {/* Border lines - left, top, right (no bottom) */}
      <path
        d={`M ${x} ${y + height} L ${x} ${y} L ${x + width} ${y} L ${x + width} ${y + height}`}
        fill="none"
        stroke={strokeColor}
        strokeWidth={1.5}
      />
    </g>
  );
};

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
      <div className={cn("bg-[#161B22] border border-zinc-800/60 p-2 sm:p-4 desktop:p-6 rounded-sm shadow-xl shadow-black/25 animate-[fadeInScale_0.6s_ease-out_0.2s_both] overflow-hidden", className)}>
        <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Estimation Accuracy</h2>
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  // Prepare data for bar chart
  const chartData = [
    {
      name: "AI Issues",
      Estimated: data.aiTasks.averageEstimated,
      Actual: data.aiTasks.averageActual,
      count: data.aiTasks.taskCount,
    },
    {
      name: "Non-AI Issues",
      Estimated: data.nonAiTasks.averageEstimated,
      Actual: data.nonAiTasks.averageActual,
      count: data.nonAiTasks.taskCount,
    },
  ];

  return (
    <div className={cn("bg-[#161B22] border border-zinc-800/60 p-2 sm:p-4 desktop:p-6 rounded-sm shadow-xl shadow-black/25 animate-[fadeInScale_0.6s_ease-out_0.2s_both] overflow-hidden", className)}>
      <div className="mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl desktop:text-2xl font-bold text-white mb-2">Estimation Accuracy</h2>
        <p className="text-xs sm:text-sm text-gray-400">Estimated vs Actual hours per issue</p>
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-[#0D1117] p-2 sm:p-3 desktop:p-4 rounded-lg border border-zinc-800/40 hover:border-emerald-500/30 transition-all hover:shadow-lg hover:shadow-emerald-500/10">
          <p className="text-[10px] sm:text-xs text-gray-400 mb-1 font-medium">AI Issues Accuracy</p>
          {data.aiTasks.taskCount > 0 ? (
            <>
              <p className="text-lg sm:text-xl desktop:text-2xl font-bold text-emerald-400">
                {data.aiTasks.accuracyPercentage.toFixed(1)}%
              </p>
              <p className="text-[10px] sm:text-xs text-gray-500">{data.aiTasks.taskCount} issues</p>
            </>
          ) : (
            <p className="text-xs sm:text-sm text-gray-500 italic">No data</p>
          )}
        </div>
        <div className="bg-[#0D1117] p-2 sm:p-3 desktop:p-4 rounded-lg border border-zinc-800/40 hover:border-cyan-500/30 transition-all hover:shadow-lg hover:shadow-cyan-500/10">
          <p className="text-[10px] sm:text-xs text-gray-400 mb-1 font-medium">Non-AI Issues Accuracy</p>
          {data.nonAiTasks.taskCount > 0 ? (
            <>
              <p className="text-lg sm:text-xl desktop:text-2xl font-bold text-cyan-400">
                {data.nonAiTasks.accuracyPercentage.toFixed(1)}%
              </p>
              <p className="text-[10px] sm:text-xs text-gray-500">{data.nonAiTasks.taskCount} issues</p>
            </>
          ) : (
            <p className="text-xs sm:text-sm text-gray-500 italic">No data</p>
          )}
        </div>
      </div>

      {/* Bar Chart */}
      <div className="h-[180px] sm:h-[220px] desktop:h-[250px] w-full bg-[#0D1117] rounded-lg border border-zinc-800/60 p-2 sm:p-3">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="actualGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.5} />
                <stop offset="50%" stopColor="#0891b2" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#0e7490" stopOpacity={0.15} />
              </linearGradient>
              <linearGradient id="estimatedGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#34d399" stopOpacity={0.5} />
                <stop offset="50%" stopColor="#059669" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#047857" stopOpacity={0.15} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis
              dataKey="name"
              stroke="#9CA3AF"
              tick={{ fill: "#9CA3AF", fontSize: 12 }}
            />
            <YAxis
              stroke="#9CA3AF"
              tick={{ fill: "#9CA3AF", fontSize: 12 }}
              width={35}
              label={{ value: "Hrs", angle: -90, position: "insideLeft", fill: "#9CA3AF", fontSize: 11 }}
            />
            <Tooltip
              cursor={{ fill: "transparent" }}
              contentStyle={{
                backgroundColor: "#1A1F26",
                border: "1px solid #374151",
                borderRadius: "6px",
                fontSize: "12px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
              }}
              labelStyle={{ color: "#fff", fontWeight: 600 }}
              itemStyle={{ color: "#d1d5db" }}
            />
            <Legend
              wrapperStyle={{ color: "#9CA3AF", fontSize: "12px", fontWeight: 500 }}
            />
            <Bar dataKey="Actual" fill="url(#actualGradient)" radius={[0, 0, 0, 0]} shape={<GradientBar />} />
            <Bar dataKey="Estimated" fill="url(#estimatedGradient)" radius={[0, 0, 0, 0]} shape={<GradientBar />} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Interpretation */}
      <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-[#0D1117] rounded-lg border border-zinc-800/40">
        <p className="text-[10px] sm:text-xs text-gray-400 leading-relaxed">
          {data.aiTasks.taskCount === 0
            ? "ℹ Add estimated time to AI issues to see accuracy metrics"
            : data.aiTasks.accuracyPercentage < 100
            ? "✓ AI issues are completed faster than estimated"
            : data.aiTasks.accuracyPercentage > 110
            ? "⚠ AI issues are taking longer than estimated"
            : "✓ AI issue estimates are accurate"}
        </p>
      </div>
    </div>
  );
}
