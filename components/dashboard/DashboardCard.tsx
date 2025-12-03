"use client";

import { cn } from "@/lib/utils";
import { LineChart, Line, ResponsiveContainer } from "recharts";

interface DashboardCardProps {
  className?: string;
  bigText?: string;
  smallText?: string;
  unit?: string;
  chartData?: Array<{ value: number }>;
  lineColor?: string;
  showChart?: boolean;
  chartHeight?: number; // Height in pixels
}

function DashboardCard({
  className,
  bigText,
  smallText,
  unit,
  chartData,
  lineColor = "#4876DE",
  showChart = false,
}: DashboardCardProps) {
  return (
    <div className={cn("bg-[#1A1F26] p-8 h-fit text-white relative overflow-hidden", className)}>
     <div className="flex items-baseline space-x-1">
        <h1 className="text-5xl font-bold relative z-10">{bigText}</h1>
        <p className="text-3xl font-bold">{unit}</p>
      </div>
      <p className="text-xs font-semibold">{smallText}</p>

      {showChart && chartData && (
        <div className="absolute pointer-events-none bottom-2 h-10 w-30 right-0">
          <svg width="0" height="0">
            <defs>
              <linearGradient id={`lineGradient-${lineColor}`} x1="55%" y1="0%" x2="90%" y2="0%">
                <stop offset="0%" stopColor={lineColor} stopOpacity="1" />
                <stop offset="50%" stopColor={lineColor} stopOpacity="0.5" />
                <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={`url(#lineGradient-${lineColor})`}
                strokeWidth={2}
                dot={false}
                isAnimationActive={true}
                animationDuration={1000}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default DashboardCard;
