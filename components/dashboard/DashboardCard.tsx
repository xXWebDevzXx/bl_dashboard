"use client";

import { cn } from "@/lib/utils";
import { LineChart, Line, ResponsiveContainer } from "recharts";

interface DashboardCardProps {
  className?: string;
  bigText?: string;
  smallText?: string;
  unit?: string | React.ReactNode;
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
    <div className={cn("bg-card border border-border-zinc/60 p-4 sm:p-6 desktop:p-8 h-fit text-white relative overflow-hidden shadow-xl shadow-black/25 animate-[fadeInScale_0.6s_ease-out_0.1s_both]", className)}>
     <div className="flex items-baseline space-x-1">
        <h1 className="text-3xl sm:text-4xl desktop:text-5xl font-bold relative z-10">{bigText}</h1>
        <p className="text-xl sm:text-2xl desktop:text-3xl font-bold">{unit}</p>
      </div>
      <p className="text-xs sm:text-sm font-semibold mt-1">{smallText}</p>

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
