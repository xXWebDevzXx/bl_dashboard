"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { BoxplotStats } from "@/lib/stats/boxplot";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface TopOutlier {
  identifier: string;
  value: number;
}

interface ExtendedBoxplotStats extends BoxplotStats {
  topOutliers: TopOutlier[];
}

interface BoxplotData {
  metric: "actual" | "accuracy" | "leadTime";
  unit: "hours" | "percent" | "days";
  ai: ExtendedBoxplotStats;
  nonAi: ExtendedBoxplotStats;
  issueData: Array<{
    identifier: string;
    group: "AI" | "Non-AI";
    value: number;
  }>;
}

interface Props {
  className?: string;
  initialData?: BoxplotData;
}

// Pure SVG Boxplot Component
const BoxplotSVG = ({
  x,
  width,
  yScale,
  q1,
  median,
  q3,
  whiskerMin,
  whiskerMax,
  outliers,
  showOutliers,
  color,
  stats,
  onHover,
  onLeave,
}: {
  x: number;
  width: number;
  yScale: (value: number) => number;
  q1: number;
  median: number;
  q3: number;
  whiskerMin: number;
  whiskerMax: number;
  outliers: number[];
  showOutliers: boolean;
  color: string;
  stats: ExtendedBoxplotStats;
  onHover?: (
    e: React.MouseEvent<SVGGElement>,
    stats: ExtendedBoxplotStats
  ) => void;
  onLeave?: () => void;
}) => {
  const boxWidth = 45;
  const centerX = x + width / 2;
  const boxX = centerX - boxWidth / 2;

  const yQ1 = yScale(q1);
  const yMedian = yScale(median);
  const yQ3 = yScale(q3);
  const yWhiskerMin = yScale(whiskerMin);
  const yWhiskerMax = yScale(whiskerMax);

  return (
    <g
      onMouseEnter={(e) => onHover?.(e, stats)}
      onMouseLeave={onLeave}
      style={{ cursor: "help" }}
    >
      {/* Lower whisker (vertical line) */}
      <line
        x1={centerX}
        y1={yWhiskerMin}
        x2={centerX}
        y2={yQ1}
        stroke="#9CA3AF"
        strokeWidth={2}
      />
      {/* Upper whisker (vertical line) */}
      <line
        x1={centerX}
        y1={yQ3}
        x2={centerX}
        y2={yWhiskerMax}
        stroke="#9CA3AF"
        strokeWidth={2}
      />

      {/* Whisker caps */}
      <line
        x1={centerX - 10}
        y1={yWhiskerMin}
        x2={centerX + 10}
        y2={yWhiskerMin}
        stroke="#9CA3AF"
        strokeWidth={2}
      />
      <line
        x1={centerX - 10}
        y1={yWhiskerMax}
        x2={centerX + 10}
        y2={yWhiskerMax}
        stroke="#9CA3AF"
        strokeWidth={2}
      />

      {/* Box (Q1 to Q3) */}
      <rect
        x={boxX}
        y={yQ3}
        width={boxWidth}
        height={Math.abs(yQ1 - yQ3)}
        fill={color}
        fillOpacity={0.3}
        stroke={color}
        strokeWidth={2}
      />

      {/* Median line */}
      <line
        x1={boxX}
        y1={yMedian}
        x2={boxX + boxWidth}
        y2={yMedian}
        stroke="#fff"
        strokeWidth={2}
      />

      {/* Outliers - only show if toggle is on */}
      {showOutliers &&
        outliers.map((outlier, idx) => {
          const outlierY = yScale(outlier);
          return (
            <circle
              key={idx}
              cx={centerX}
              cy={outlierY}
              r={4}
              fill={color}
              fillOpacity={0.8}
              stroke={color}
              strokeWidth={2}
            />
          );
        })}
    </g>
  );
};

export default function BoxPlotCard({ className, initialData }: Props) {
  const [data, setData] = useState<BoxplotData | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [metric, setMetric] = useState<"actual" | "accuracy" | "leadTime">(
    initialData?.metric || "actual"
  );
  const [showOutliers, setShowOutliers] = useState(true);
  const [tooltip, setTooltip] = useState<{
    stats: ExtendedBoxplotStats;
    name: string;
    x: number;
    y: number;
  } | null>(null);
  const [dateRange] = useState<{ from: string; to: string }>(
    () => {
      // Default to entire year (2025)
      return {
        from: "2025-01-01",
        to: "2025-12-31",
      };
    }
  );

  useEffect(() => {
    // Check if we should use initial data (only for default metric and date range)
    const isDefaultParams = 
      metric === "actual" && 
      dateRange.from === "2025-01-01" && 
      dateRange.to === "2025-12-31";

    if (initialData && isDefaultParams && initialData.metric === "actual") {
      setData(initialData);
      setLoading(false);
      return;
    }

    // Otherwise, fetch from API (when metric or date range changes)
    async function fetchData() {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          from: dateRange.from,
          to: dateRange.to,
          metric: metric,
        });
        const response = await fetch(
          `/api/dashboard/boxplot?${params.toString()}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch boxplot data");
        }
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching boxplot data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [dateRange.from, dateRange.to, metric, initialData]);

  if (loading) {
    return (
      <div
        className={cn(
          "bg-card border border-border-zinc/60 p-2 sm:p-4 desktop:p-6 rounded-sm shadow-xl shadow-black/25 animate-[fadeInScale_0.6s_ease-out_0.2s_both] overflow-hidden",
          className
        )}
      >
        <h2 className="text-lg sm:text-xl desktop:text-2xl font-bold text-white mb-4">
          Distribution:{" "}
          {metric === "actual"
            ? "Actual time per issue"
            : metric === "accuracy"
            ? "Accuracy per issue"
            : "Lead time per issue"}
        </h2>
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const hasEnoughData = data.ai.n >= 5 && data.nonAi.n >= 5;

  // Calculate overall min/max for Y axis scale
  // Use P95 as a reasonable cap to keep the main boxplot visible
  // Outliers beyond this will still be shown but compressed at the top
  const maxWhisker = Math.max(data.ai.whiskerHigh, data.nonAi.whiskerHigh);
  const maxP95 = Math.max(data.ai.p95, data.nonAi.p95);

  // When showing outliers: cap at P95 * 1.3 to show most data clearly
  // When hiding outliers: zoom in to whisker range only
  const smartMax = showOutliers
    ? Math.max(maxP95 * 1.3, maxWhisker * 1.2)
    : Math.max(data.ai.whiskerHigh, data.nonAi.whiskerHigh);

  const allValues = showOutliers
    ? [
        data.ai.whiskerLow,
        data.ai.whiskerHigh,
        data.ai.q1,
        data.ai.q3,
        data.nonAi.whiskerLow,
        data.nonAi.whiskerHigh,
        data.nonAi.q1,
        data.nonAi.q3,
        // Include outliers but they'll be capped by smartMax
        ...data.ai.outliers,
        ...data.nonAi.outliers,
      ]
    : [
        // Only use whisker bounds when zoomed in (outliers hidden)
        data.ai.whiskerLow,
        data.ai.whiskerHigh,
        data.ai.q1,
        data.ai.q3,
        data.nonAi.whiskerLow,
        data.nonAi.whiskerHigh,
        data.nonAi.q1,
        data.nonAi.q3,
      ];
  const globalMin = Math.min(...allValues);
  const globalMax = showOutliers ? smartMax : Math.max(...allValues);
  const padding = (globalMax - globalMin) * 0.1 || 1;
  const yMin = Math.max(0, globalMin - padding);
  const yMax = globalMax + padding;

  // Use whisker bounds from API
  const aiWhiskerMin = data.ai.whiskerLow;
  const aiWhiskerMax = data.ai.whiskerHigh;
  const nonAiWhiskerMin = data.nonAi.whiskerLow;
  const nonAiWhiskerMax = data.nonAi.whiskerHigh;

  // Responsive chart dimensions (viewBox coordinates)
  const chartHeight = 300;
  const chartWidth = 400;
  const paddingLeft = 35;
  const paddingRight = 15;
  const paddingTop = 15;
  const paddingBottom = 25;

  // Y axis scale function (will use plotHeight from inside SVG)
  const createYScale = (plotHeight: number) => {
    return (value: number) => {
      const range = yMax - yMin || 1;
      return plotHeight - ((value - yMin) / range) * plotHeight;
    };
  };

  // Y axis ticks
  const numTicks = 5;
  const yTicks: number[] = [];
  for (let i = 0; i <= numTicks; i++) {
    yTicks.push(yMin + ((yMax - yMin) * i) / numTicks);
  }

  // Format helpers
  const formatTooltip = (value: number): string => {
    if (data.unit === "hours") return value.toFixed(2);
    return value.toFixed(1);
  };

  const formatAxis = (value: number): string => {
    return value.toFixed(1);
  };

  const getUnitLabel = (): string => {
    if (data.unit === "hours") return "hrs";
    if (data.unit === "percent") return "%";
    return "days";
  };

  return (
    <div
      className={cn(
        "bg-card border border-border-zinc/60 p-2 sm:p-4 desktop:p-6 rounded-sm shadow-xl shadow-black/25 animate-[fadeInScale_0.6s_ease-out_0.2s_both] overflow-hidden h-fit",
        className
      )}
    >
      <div className="mb-3 sm:mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
          <h2 className="text-lg sm:text-xl desktop:text-2xl font-bold text-white">
            Distribution:{" "}
            {metric === "actual"
              ? "Actual time per issue"
              : metric === "accuracy"
              ? "Accuracy per issue"
              : "Lead time per issue"}
          </h2>
          <Select
            value={metric}
            onValueChange={(value) =>
              setMetric(value as "actual" | "accuracy" | "leadTime")
            }
          >
            <SelectTrigger className="w-full sm:w-[180px] bg-card-foreground border-border-zinc/60 text-white h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="actual">Actual Time</SelectItem>
              <SelectItem value="accuracy">Accuracy</SelectItem>
              <SelectItem value="leadTime">Lead Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <p className="text-xs sm:text-sm text-gray-400">
          {metric === "actual"
            ? "Hours per issue (AI vs Non-AI)"
            : metric === "accuracy"
            ? "Accuracy percentage per issue (AI vs Non-AI)"
            : "Days from creation to completion (AI vs Non-AI)"}
        </p>
      </div>

      {!hasEnoughData ? (
        <div className="bg-card-foreground p-4 rounded-lg border border-border-zinc/40">
          <p className="text-sm text-gray-400 text-center">
            Insufficient data (need at least 5 issues per group)
          </p>
          <p className="text-xs text-gray-500 text-center mt-1">
            AI: {data.ai.n} issues | Non-AI: {data.nonAi.n} issues
          </p>
        </div>
      ) : (
        <>
          {/* Show Outliers Toggle */}
          <div className="flex items-center gap-2 mb-3">
            <Switch
              id="show-outliers"
              checked={showOutliers}
              onCheckedChange={setShowOutliers}
            />
            <Label
              htmlFor="show-outliers"
              className="text-sm text-gray-300 cursor-pointer"
            >
              {showOutliers ? "Show outliers" : "Zoom in (outliers hidden)"}
            </Label>
          </div>

          {/* Boxplot Chart */}
          <div className="h-[280px] sm:h-80 desktop:h-[380px] w-full bg-card-foreground rounded-lg border border-border-zinc/60 p-2 sm:p-3 mb-3 sm:mb-4 relative">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-full"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Calculate plot dimensions based on viewBox */}
              {(() => {
                const plotWidth = chartWidth - paddingLeft - paddingRight;
                const plotHeight = chartHeight - paddingTop - paddingBottom;
                const yScale = createYScale(plotHeight);

                return (
                  <>
                    {/* Y axis */}
                    <line
                      x1={paddingLeft}
                      y1={paddingTop}
                      x2={paddingLeft}
                      y2={paddingTop + plotHeight}
                      stroke="#9CA3AF"
                      strokeWidth={1.5}
                    />

                    {/* Y axis ticks and labels */}
                    {yTicks.map((tick, idx) => {
                      const y = paddingTop + yScale(tick);
                      return (
                        <g key={idx}>
                          <line
                            x1={paddingLeft - 4}
                            y1={y}
                            x2={paddingLeft}
                            y2={y}
                            stroke="#9CA3AF"
                            strokeWidth={1}
                          />
                          <text
                            x={paddingLeft - 8}
                            y={y + 3}
                            fill="#9CA3AF"
                            fontSize="10"
                            textAnchor="end"
                          >
                            {formatAxis(tick)}
                          </text>
                        </g>
                      );
                    })}

                    {/* Y axis label */}
                    <text
                      x={12}
                      y={paddingTop + plotHeight / 2}
                      fill="#9CA3AF"
                      fontSize="10"
                      textAnchor="middle"
                      transform={`rotate(-90, 12, ${
                        paddingTop + plotHeight / 2
                      })`}
                    >
                      {getUnitLabel()}
                    </text>

                    {/* X axis */}
                    <line
                      x1={paddingLeft}
                      y1={paddingTop + plotHeight}
                      x2={paddingLeft + plotWidth}
                      y2={paddingTop + plotHeight}
                      stroke="#9CA3AF"
                      strokeWidth={1.5}
                    />

                    {/* Reference line at 100% for accuracy metric */}
                    {data.metric === "accuracy" &&
                      yMin <= 100 &&
                      yMax >= 100 && (
                        <>
                          <line
                            x1={paddingLeft}
                            y1={paddingTop + yScale(100)}
                            x2={paddingLeft + plotWidth}
                            y2={paddingTop + yScale(100)}
                            stroke="#ef4444"
                            strokeWidth={1.5}
                            strokeDasharray="4 4"
                            opacity={0.6}
                          />
                          <text
                            x={paddingLeft + plotWidth - 5}
                            y={paddingTop + yScale(100) - 5}
                            fill="#ef4444"
                            fontSize="10"
                            textAnchor="end"
                            fontWeight="500"
                          >
                            100%
                          </text>
                        </>
                      )}

                    {/* Boxplots */}
                    <BoxplotSVG
                      x={paddingLeft + plotWidth * 0.1}
                      width={plotWidth * 0.35}
                      yScale={yScale}
                      q1={data.ai.q1}
                      median={data.ai.median}
                      q3={data.ai.q3}
                      whiskerMin={aiWhiskerMin}
                      whiskerMax={aiWhiskerMax}
                      outliers={data.ai.outliers}
                      showOutliers={showOutliers}
                      color="#22d3ee"
                      stats={data.ai}
                      onHover={(e, stats) => {
                        const boxplotX = paddingLeft + plotWidth * 0.1;
                        const boxplotCenterX =
                          boxplotX + (plotWidth * 0.35) / 2;
                        setTooltip({
                          stats,
                          name: "AI",
                          x: boxplotCenterX - 100,
                          y: paddingTop + plotHeight * 0.3,
                        });
                      }}
                      onLeave={() => setTooltip(null)}
                    />

                    <BoxplotSVG
                      x={paddingLeft + plotWidth * 0.55}
                      width={plotWidth * 0.35}
                      yScale={yScale}
                      q1={data.nonAi.q1}
                      median={data.nonAi.median}
                      q3={data.nonAi.q3}
                      whiskerMin={nonAiWhiskerMin}
                      whiskerMax={nonAiWhiskerMax}
                      outliers={data.nonAi.outliers}
                      showOutliers={showOutliers}
                      color="#34d399"
                      stats={data.nonAi}
                      onHover={(e, stats) => {
                        const boxplotX = paddingLeft + plotWidth * 0.55;
                        const boxplotCenterX =
                          boxplotX + (plotWidth * 0.35) / 2;
                        setTooltip({
                          stats,
                          name: "Non-AI",
                          x: boxplotCenterX - 100,
                          y: paddingTop + plotHeight * 0.3,
                        });
                      }}
                      onLeave={() => setTooltip(null)}
                    />

                    {/* X axis labels */}
                    <text
                      x={paddingLeft + plotWidth * 0.275}
                      y={paddingTop + plotHeight + 20}
                      fill="#9CA3AF"
                      fontSize="11"
                      textAnchor="middle"
                      fontWeight="500"
                    >
                      AI
                    </text>
                    <text
                      x={paddingLeft + plotWidth * 0.725}
                      y={paddingTop + plotHeight + 20}
                      fill="#9CA3AF"
                      fontSize="11"
                      textAnchor="middle"
                      fontWeight="500"
                    >
                      Non-AI
                    </text>
                  </>
                );
              })()}
            </svg>

            {/* Tooltip - positioned outside SVG for better readability */}
            {tooltip && (
              <div
                className="absolute bg-[#1A1F26] border-2 border-[#374151] rounded-lg p-4 shadow-2xl text-white z-50 pointer-events-none"
                style={{
                  left: tooltip.name === "AI" ? "15%" : "55%",
                  top: "10%",
                  transform: "translateX(-50%)",
                  minWidth: "240px",
                }}
              >
                <p className="font-bold text-sm mb-3 text-white">
                  {tooltip.name} Issues
                </p>
                <div className="space-y-1.5 text-gray-200 text-sm">
                  <p className="font-medium">
                    n: <span className="text-white">{tooltip.stats.n}</span>
                  </p>
                  <div className="pt-1 border-t border-gray-600">
                    <p className="font-semibold text-xs text-gray-400 mb-1">
                      Quartiles (Report Focus)
                    </p>
                    <p>
                      Q1:{" "}
                      <span className="text-white font-medium">
                        {formatTooltip(tooltip.stats.q1)}
                      </span>{" "}
                      {getUnitLabel()}
                    </p>
                    <p>
                      Median:{" "}
                      <span className="text-white font-medium">
                        {formatTooltip(tooltip.stats.median)}
                      </span>{" "}
                      {getUnitLabel()}
                    </p>
                    <p>
                      Q3:{" "}
                      <span className="text-white font-medium">
                        {formatTooltip(tooltip.stats.q3)}
                      </span>{" "}
                      {getUnitLabel()}
                    </p>
                    <p>
                      IQR:{" "}
                      <span className="text-white font-medium">
                        {formatTooltip(tooltip.stats.iqr)}
                      </span>{" "}
                      {getUnitLabel()}
                    </p>
                  </div>
                  <div className="pt-1 border-t border-gray-600">
                    <p className="font-semibold text-xs text-gray-400 mb-1">
                      Range & Whiskers
                    </p>
                    <p>
                      Min:{" "}
                      <span className="text-white font-medium">
                        {formatTooltip(tooltip.stats.min)}
                      </span>{" "}
                      {getUnitLabel()}
                    </p>
                    <p>
                      Max:{" "}
                      <span className="text-white font-medium">
                        {formatTooltip(tooltip.stats.max)}
                      </span>{" "}
                      {getUnitLabel()}
                    </p>
                    <p>
                      Whisker Low:{" "}
                      <span className="text-white font-medium">
                        {formatTooltip(tooltip.stats.whiskerLow)}
                      </span>{" "}
                      {getUnitLabel()}
                    </p>
                    <p>
                      Whisker High:{" "}
                      <span className="text-white font-medium">
                        {formatTooltip(tooltip.stats.whiskerHigh)}
                      </span>{" "}
                      {getUnitLabel()}
                    </p>
                  </div>
                  <div className="pt-1 border-t border-gray-600">
                    <p className="font-semibold text-xs text-gray-400 mb-1">
                      Additional Stats
                    </p>
                    <p>
                      Mean:{" "}
                      <span className="text-white font-medium">
                        {formatTooltip(tooltip.stats.mean)}
                      </span>{" "}
                      {getUnitLabel()}
                    </p>
                    <p>
                      P95:{" "}
                      <span className="text-white font-medium">
                        {formatTooltip(tooltip.stats.p95)}
                      </span>{" "}
                      {getUnitLabel()}
                    </p>
                    <p className="font-medium">
                      Outliers:{" "}
                      <span className="text-white">
                        {tooltip.stats.outlierCount}
                      </span>
                    </p>
                  </div>
                  {tooltip.stats.topOutliers.length > 0 && (
                    <div className="pt-1 border-t border-gray-600">
                      <p className="font-semibold text-xs text-gray-400 mb-1">
                        Top 3 Outliers
                      </p>
                      {tooltip.stats.topOutliers.map((outlier, idx) => (
                        <p key={idx} className="text-xs">
                          {outlier.identifier}:{" "}
                          <span className="text-white font-medium">
                            {formatTooltip(outlier.value)}
                          </span>{" "}
                          {getUnitLabel()}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sample sizes and stats */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3">
            <div
              className="bg-card-foreground p-2 sm:p-3 rounded-lg border border-border-zinc/40 hover:border-cyan-normal/30 transition-all cursor-help"
              title={`n: ${data.ai.n}\nQ1: ${formatTooltip(
                data.ai.q1
              )} ${getUnitLabel()}\nMedian: ${formatTooltip(
                data.ai.median
              )} ${getUnitLabel()}\nQ3: ${formatTooltip(
                data.ai.q3
              )} ${getUnitLabel()}\nIQR: ${formatTooltip(
                data.ai.iqr
              )} ${getUnitLabel()}\nWhisker Low: ${formatTooltip(
                data.ai.whiskerLow
              )} ${getUnitLabel()}\nWhisker High: ${formatTooltip(
                data.ai.whiskerHigh
              )} ${getUnitLabel()}\nOutliers: ${data.ai.outlierCount}`}
            >
              <p className="text-[10px] sm:text-xs text-gray-400 mb-1">
                AI Issues
              </p>
              <p className="text-sm sm:text-base font-semibold text-cyan-light">
                n = {data.ai.n}
              </p>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                Median: {formatTooltip(data.ai.median)} {getUnitLabel()}
              </p>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
                IQR: {formatTooltip(data.ai.iqr)} {getUnitLabel()}
              </p>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
                Max: {formatTooltip(data.ai.max)} {getUnitLabel()}
              </p>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
                P95: {formatTooltip(data.ai.p95)} {getUnitLabel()}
              </p>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
                Outliers: {data.ai.outlierCount}
              </p>
            </div>
            <div
              className="bg-card-foreground p-2 sm:p-3 rounded-lg border border-border-zinc/40 hover:border-emerald-normal/30 transition-all cursor-help"
              title={`n: ${data.nonAi.n}\nQ1: ${formatTooltip(
                data.nonAi.q1
              )} ${getUnitLabel()}\nMedian: ${formatTooltip(
                data.nonAi.median
              )} ${getUnitLabel()}\nQ3: ${formatTooltip(
                data.nonAi.q3
              )} ${getUnitLabel()}\nIQR: ${formatTooltip(
                data.nonAi.iqr
              )} ${getUnitLabel()}\nWhisker Low: ${formatTooltip(
                data.nonAi.whiskerLow
              )} ${getUnitLabel()}\nWhisker High: ${formatTooltip(
                data.nonAi.whiskerHigh
              )} ${getUnitLabel()}\nOutliers: ${data.nonAi.outlierCount}`}
            >
              <p className="text-[10px] sm:text-xs text-gray-400 mb-1">
                Non-AI Issues
              </p>
              <p className="text-sm sm:text-base font-semibold text-emerald-light">
                n = {data.nonAi.n}
              </p>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                Median: {formatTooltip(data.nonAi.median)} {getUnitLabel()}
              </p>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
                IQR: {formatTooltip(data.nonAi.iqr)} {getUnitLabel()}
              </p>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
                Max: {formatTooltip(data.nonAi.max)} {getUnitLabel()}
              </p>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
                P95: {formatTooltip(data.nonAi.p95)} {getUnitLabel()}
              </p>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
                Outliers: {data.nonAi.outlierCount}
              </p>
            </div>
          </div>

          {/* Info text */}
          <div className="bg-card-foreground p-2 sm:p-3 rounded-lg border border-border-zinc/40">
            <p className="text-[10px] sm:text-xs text-gray-400 leading-relaxed">
              ℹ Box = Q1–Q3, linje = median, whiskers = 1.5×IQR, prikker =
              outliers
            </p>
          </div>
        </>
      )}
    </div>
  );
}
