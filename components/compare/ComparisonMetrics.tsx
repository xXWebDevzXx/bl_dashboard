"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatHoursToHM, formatHoursWithSign } from "@/lib/time-format-utils";

interface Task {
  estimatedTime: string;
  actualTime: number;
  delegateId: string | null;
  togglEntries: unknown[];
}

interface Metrics {
  task1: {
    accuracy: number;
    variance: number;
    variancePercentage: number;
    entriesCount: number;
    isAI: boolean;
  };
  task2: {
    accuracy: number;
    variance: number;
    variancePercentage: number;
    entriesCount: number;
    isAI: boolean;
  };
  comparison: {
    accuracyDiff: number;
    timeDiff: number;
    estimateDiff: number;
    entriesDiff: number;
  };
}

interface Props {
  task1: Task;
  task2: Task;
  metrics: Metrics;
  task1EstimateDisplay: string;
  task2EstimateDisplay: string;
}

export default function ComparisonMetrics({ task1, task2, metrics, task1EstimateDisplay, task2EstimateDisplay }: Props) {
  const getComparisonIndicator = (diff: number) => {
    if (Math.abs(diff) < 0.01) {
      return { text: "Equal", color: "text-gray-400", icon: "=" };
    }
    return diff > 0
      ? { text: "Higher", color: "text-emerald-light", icon: "↑" }
      : { text: "Lower", color: "text-cyan-light", icon: "↓" };
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90 && accuracy <= 110) return "text-emerald-light";
    if (accuracy >= 80 && accuracy <= 120) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <Card className="bg-card border-border-zinc/60 shadow-xl shadow-black/25">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white">Comparison Metrics</CardTitle>
      </CardHeader>
      <CardContent>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Estimated Time */}
        <div className="bg-card-foreground border border-border-zinc/40 rounded-lg p-4">
          <p className="text-xs text-gray-400 mb-3 font-medium uppercase tracking-wide">
            Estimated Time
          </p>
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-emerald-light">Task 1</span>
              <span className="text-lg font-bold text-white">
                {task1EstimateDisplay}
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-cyan-light">Task 2</span>
              <span className="text-lg font-bold text-white">
                {task2EstimateDisplay}
              </span>
            </div>
            <div className="pt-2 border-t border-border-zinc/60">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Difference</span>
                <span
                  className={`text-sm font-semibold ${
                    getComparisonIndicator(metrics.comparison.estimateDiff).color
                  }`}
                >
                  {getComparisonIndicator(metrics.comparison.estimateDiff).icon}{" "}
                  {formatHoursToHM(Math.abs(metrics.comparison.estimateDiff))}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actual Time */}
        <div className="bg-card-foreground border border-border-zinc/40 rounded-lg p-4">
          <p className="text-xs text-gray-400 mb-3 font-medium uppercase tracking-wide">
            Actual Time
          </p>
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-emerald-light">Task 1</span>
              <span className="text-lg font-bold text-white">
                {formatHoursToHM(task1.actualTime)}
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-cyan-light">Task 2</span>
              <span className="text-lg font-bold text-white">
                {formatHoursToHM(task2.actualTime)}
              </span>
            </div>
            <div className="pt-2 border-t border-border-zinc/60">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Difference</span>
                <span
                  className={`text-sm font-semibold ${
                    getComparisonIndicator(metrics.comparison.timeDiff).color
                  }`}
                >
                  {getComparisonIndicator(metrics.comparison.timeDiff).icon}{" "}
                  {formatHoursToHM(Math.abs(metrics.comparison.timeDiff))}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Accuracy */}
        <div className="bg-card-foreground border border-border-zinc/40 rounded-lg p-4">
          <p className="text-xs text-gray-400 mb-3 font-medium uppercase tracking-wide">
            Accuracy
          </p>
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-emerald-light">Task 1</span>
              <span
                className={`text-lg font-bold ${getAccuracyColor(
                  metrics.task1.accuracy
                )}`}
              >
                {metrics.task1.accuracy.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-cyan-light">Task 2</span>
              <span
                className={`text-lg font-bold ${getAccuracyColor(
                  metrics.task2.accuracy
                )}`}
              >
                {metrics.task2.accuracy.toFixed(1)}%
              </span>
            </div>
            <div className="pt-2 border-t border-border-zinc/60">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Difference</span>
                <span
                  className={`text-sm font-semibold ${
                    getComparisonIndicator(metrics.comparison.accuracyDiff).color
                  }`}
                >
                  {getComparisonIndicator(metrics.comparison.accuracyDiff).icon}{" "}
                  {Math.abs(metrics.comparison.accuracyDiff).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Time Entries */}
        <div className="bg-card-foreground border border-border-zinc/40 rounded-lg p-4">
          <p className="text-xs text-gray-400 mb-3 font-medium uppercase tracking-wide">
            Time Entries
          </p>
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-emerald-light">Task 1</span>
              <span className="text-lg font-bold text-white">
                {metrics.task1.entriesCount}
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-cyan-light">Task 2</span>
              <span className="text-lg font-bold text-white">
                {metrics.task2.entriesCount}
              </span>
            </div>
            <div className="pt-2 border-t border-border-zinc/60">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Difference</span>
                <span
                  className={`text-sm font-semibold ${
                    getComparisonIndicator(metrics.comparison.entriesDiff).color
                  }`}
                >
                  {getComparisonIndicator(metrics.comparison.entriesDiff).icon}{" "}
                  {Math.abs(metrics.comparison.entriesDiff)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Variance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <Card className="bg-linear-to-r from-emerald-dark/20 to-emerald-dark/10 border-emerald-dark/40">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-emerald-light">
                Issue 1 Variance
              </span>
              {metrics.task1.isAI && (
                <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                  AI
                </Badge>
              )}
            </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl font-bold ${
                metrics.task1.variance === 0
                  ? "text-emerald-light"
                  : metrics.task1.variance > 0
                  ? "text-red-400"
                  : "text-green-400"
              }`}
            >
              {metrics.task1.variance === 0 ? "100%" : formatHoursWithSign(metrics.task1.variance)}
            </span>
            {metrics.task1.variance !== 0 && (
              <span className="text-sm text-gray-400">
                ({metrics.task1.variance > 0 ? "+" : ""}
                {metrics.task1.variancePercentage.toFixed(1)}%)
              </span>
            )}
          </div>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-r from-cyan-dark/20 to-cyan-dark/10 border-cyan-dark/40">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-cyan-light">
                Issue 2 Variance
              </span>
              {metrics.task2.isAI && (
                <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                  AI
                </Badge>
              )}
            </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl font-bold ${
                metrics.task2.variance === 0
                  ? "text-cyan-light"
                  : metrics.task2.variance > 0
                  ? "text-red-400"
                  : "text-green-400"
              }`}
            >
              {metrics.task2.variance === 0 ? "100%" : formatHoursWithSign(metrics.task2.variance)}
            </span>
            {metrics.task2.variance !== 0 && (
              <span className="text-sm text-gray-400">
                ({metrics.task2.variance > 0 ? "+" : ""}
                {metrics.task2.variancePercentage.toFixed(1)}%)
              </span>
            )}
          </div>
          </CardContent>
        </Card>
      </div>
      </CardContent>
    </Card>
  );
}
