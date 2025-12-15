"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { parseEstimateRange } from "@/lib/estimate-utils";
import { formatHoursToHM } from "@/lib/time-format-utils";

interface Task {
  taskId: string;
  name: string;
  estimatedTime: string;
  actualTime: number;
}

interface Props {
  task1: Task;
  task2: Task;
  task1EstimateDisplay: string;
  task2EstimateDisplay: string;
}

// Custom bar shape with gradient and border - defined outside component
const GradientBar = (props: { fill?: string; x?: number; y?: number; width?: number; height?: number; payload?: unknown }) => {
  const { fill, x, y, width, height } = props;
  if (!fill || x === undefined || y === undefined || width === undefined || height === undefined) return null;

  const isEstimated = fill.includes("estimatedGradient");
  const strokeColor = isEstimated ? "#22d3ee" : "#34d399";

  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={fill} rx={0} />
      <path
        d={`M ${x} ${y + height} L ${x} ${y} L ${x + width} ${y} L ${x + width} ${y + height}`}
        fill="none"
        stroke={strokeColor}
        strokeWidth={1.5}
      />
    </g>
  );
};

// Custom tooltip component - defined outside component
const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; actual: number; estimateLabel: string } }> }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#1A1F26] border border-[#374151] rounded-md p-3 text-xs">
        <p className="text-white font-semibold mb-2">{data.name}</p>
        <p className="text-[#d1d5db] mb-1">
          <span className="text-emerald-400">Actual Time: </span>
          {formatHoursToHM(data.actual)}
        </p>
        <p className="text-[#d1d5db]">
          <span className="text-cyan-400">Estimated Time: </span>
          {data.estimateLabel}
        </p>
      </div>
    );
  }
  return null;
};

export default function ComparisonChart({ task1, task2, task1EstimateDisplay, task2EstimateDisplay }: Props) {
  const task1EstimateRange = parseEstimateRange(task1.estimatedTime);
  const task2EstimateRange = parseEstimateRange(task2.estimatedTime);

  // Calculate variance based on boundaries (same logic as in TaskComparisonView)
  const calculateVariance = (
    estimateRange: { min: number; max: number; midpoint: number },
    actual: number
  ) => {
    if (actual >= estimateRange.min && actual <= estimateRange.max) {
      return 0;
    }
    if (actual < estimateRange.min) {
      return actual - estimateRange.min;
    }
    return actual - estimateRange.max;
  };

  const task1Variance = calculateVariance(task1EstimateRange, task1.actualTime);
  const task2Variance = calculateVariance(task2EstimateRange, task2.actualTime);

  const chartData = [
    {
      name: task1.taskId,
      estimated: task1EstimateRange.midpoint,
      actual: parseFloat(task1.actualTime.toFixed(2)),
      estimateLabel: task1EstimateDisplay, // Use displayFormat for tooltip
    },
    {
      name: task2.taskId,
      estimated: task2EstimateRange.midpoint,
      actual: parseFloat(task2.actualTime.toFixed(2)),
      estimateLabel: task2EstimateDisplay, // Use displayFormat for tooltip
    },
  ];

  return (
    <Card className="bg-[#161B22] border-zinc-800/60 shadow-xl shadow-black/25">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white">Time Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full bg-[#0D1117] rounded-lg border border-zinc-800/60 shadow-inner p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }} barGap={15} barSize={60}>
              <defs>
                <linearGradient id="estimatedGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.5} />
                  <stop offset="50%" stopColor="#0891b2" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#0e7490" stopOpacity={0.15} />
                </linearGradient>
                <linearGradient id="actualGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#34d399" stopOpacity={0.5} />
                  <stop offset="50%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#059669" stopOpacity={0.15} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />

              <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} fontWeight={600} tick={{ fill: "#9CA3AF" }} />

              <YAxis
                stroke="#9CA3AF"
                fontSize={12}
                tick={{ fill: "#9CA3AF" }}
                label={{
                  value: "Hours",
                  angle: -90,
                  position: "insideLeft",
                  style: { fill: "#9CA3AF", fontSize: 12, fontWeight: 600 },
                }}
              />

              <Tooltip
                cursor={{ fill: "transparent" }}
                content={<CustomTooltip />}
              />

              <Legend
                wrapperStyle={{
                  fontSize: "12px",
                  fontWeight: 600,
                  paddingTop: "20px",
                }}
                iconSize={12}
              />
              <Bar dataKey="actual" fill="url(#actualGradient)" name="Actual Time (hours)" shape={<GradientBar />} radius={[0, 0, 0, 0]} />
              <Bar dataKey="estimated" fill="url(#estimatedGradient)" name="Estimated Time (hours)" shape={<GradientBar />} radius={[0, 0, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="bg-[#0D1117] border border-emerald-800/40 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-3 h-3 rounded-sm bg-gradient-to-b from-emerald-400/50 to-emerald-600/15" />
              <span className="text-sm font-medium text-emerald-400">{task1.taskId}</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Estimated:</span>
                <span className="text-white font-semibold">{task1EstimateDisplay}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Actual:</span>
                <span className="text-white font-semibold">{formatHoursToHM(task1.actualTime)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-zinc-800/60">
                <span className="text-gray-400">Difference:</span>
                <span className={`font-semibold ${
                  task1Variance === 0
                    ? "text-emerald-400"
                    : task1Variance > 0
                    ? "text-red-400"
                    : "text-green-400"
                }`}>
                  {task1Variance === 0
                    ? "100%"
                    : `${task1Variance > 0 ? "+" : ""}${formatHoursToHM(Math.abs(task1Variance))}`}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#0D1117] border border-cyan-800/40 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-3 h-3 rounded-sm bg-gradient-to-b from-cyan-400/50 to-cyan-600/15" />
              <span className="text-sm font-medium text-cyan-400">{task2.taskId}</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Estimated:</span>
                <span className="text-white font-semibold">{task2EstimateDisplay}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Actual:</span>
                <span className="text-white font-semibold">{formatHoursToHM(task2.actualTime)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-zinc-800/60">
                <span className="text-gray-400">Difference:</span>
                <span className={`font-semibold ${
                  task2Variance === 0
                    ? "text-cyan-400"
                    : task2Variance > 0
                    ? "text-red-400"
                    : "text-green-400"
                }`}>
                  {task2Variance === 0
                    ? "100%"
                    : `${task2Variance > 0 ? "+" : ""}${formatHoursToHM(Math.abs(task2Variance))}`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
