"use client";

import { useMemo } from "react";
import ComparisonMetrics from "./ComparisonMetrics";
import ComparisonChart from "./ComparisonChart";
import TimeEntriesComparison from "./TimeEntriesComparison";
import type { Task } from "./types";

interface Props {
  task1: Task;
  task2: Task;
}

export default function TaskComparisonView({ task1, task2 }: Props) {
  const metrics = useMemo(() => {
    const calculateAccuracy = (estimated: number, actual: number) => {
      if (estimated === 0) return 0;
      return (actual / estimated) * 100;
    };

    const task1Accuracy = calculateAccuracy(task1.estimatedTime, task1.actualTime);
    const task2Accuracy = calculateAccuracy(task2.estimatedTime, task2.actualTime);

    const task1Variance = task1.actualTime - task1.estimatedTime;
    const task2Variance = task2.actualTime - task2.estimatedTime;

    return {
      task1: {
        accuracy: task1Accuracy,
        variance: task1Variance,
        variancePercentage: task1.estimatedTime > 0 ? (task1Variance / task1.estimatedTime) * 100 : 0,
        entriesCount: task1.togglEntries.length,
        isAI: !!task1.delegateId,
      },
      task2: {
        accuracy: task2Accuracy,
        variance: task2Variance,
        variancePercentage: task2.estimatedTime > 0 ? (task2Variance / task2.estimatedTime) * 100 : 0,
        entriesCount: task2.togglEntries.length,
        isAI: !!task2.delegateId,
      },
      comparison: {
        accuracyDiff: task1Accuracy - task2Accuracy,
        timeDiff: task1.actualTime - task2.actualTime,
        estimateDiff: task1.estimatedTime - task2.estimatedTime,
        entriesDiff: task1.togglEntries.length - task2.togglEntries.length,
      },
    };
  }, [task1, task2]);

  return (
    <div className="space-y-6">
      {/* Header Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Task 1 Header */}
        <div className="bg-gradient-to-br from-emerald-900/20 to-emerald-800/10 border border-emerald-800/40 rounded-lg p-6 animate-[fadeInScale_0.6s_ease-out_0.3s_both]">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-emerald-400 font-mono font-semibold">
                  {task1.taskId}
                </span>
                {task1.delegateId && (
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full font-medium">
                    AI: {task1.delegateName}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-white mb-2">{task1.name}</h2>
              {task1.projectName && (
                <p className="text-sm text-emerald-300/70">{task1.projectName}</p>
              )}
            </div>
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <span className="text-emerald-400 font-bold text-lg">1</span>
            </div>
          </div>

          {task1.labels.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {task1.labels.map((label) => (
                <span
                  key={label.id}
                  className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs rounded-full font-medium"
                >
                  {label.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Task 2 Header */}
        <div className="bg-gradient-to-br from-cyan-900/20 to-cyan-800/10 border border-cyan-800/40 rounded-lg p-6 animate-[fadeInScale_0.6s_ease-out_0.4s_both]">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-cyan-400 font-mono font-semibold">
                  {task2.taskId}
                </span>
                {task2.delegateId && (
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full font-medium">
                    AI: {task2.delegateName}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-white mb-2">{task2.name}</h2>
              {task2.projectName && (
                <p className="text-sm text-cyan-300/70">{task2.projectName}</p>
              )}
            </div>
            <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
              <span className="text-cyan-400 font-bold text-lg">2</span>
            </div>
          </div>

          {task2.labels.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {task2.labels.map((label) => (
                <span
                  key={label.id}
                  className="px-3 py-1 bg-cyan-500/20 text-cyan-300 text-xs rounded-full font-medium"
                >
                  {label.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Metrics Comparison */}
      <div className="animate-[fadeInScale_0.6s_ease-out_0.5s_both]">
        <ComparisonMetrics task1={task1} task2={task2} metrics={metrics} />
      </div>

      {/* Visual Comparison Chart */}
      <div className="animate-[fadeInScale_0.6s_ease-out_0.6s_both]">
        <ComparisonChart task1={task1} task2={task2} />
      </div>

      {/* Time Entries Comparison */}
      <div className="animate-[fadeInScale_0.6s_ease-out_0.7s_both]">
        <TimeEntriesComparison task1={task1} task2={task2} />
      </div>
    </div>
  );
}
