"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Task {
  taskId: string;
  name: string;
  togglEntries: {
    id: string;
    description: string;
    duration: number;
    start: string;
    stop: string;
  }[];
}

interface Props {
  task1: Task;
  task2: Task;
}

export default function TimeEntriesComparison({ task1, task2 }: Props) {
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const task1Stats = useMemo(() => {
    const durations = task1.togglEntries.map((e) => e.duration);
    return {
      total: durations.reduce((sum, d) => sum + d, 0),
      average: durations.length > 0 ? durations.reduce((sum, d) => sum + d, 0) / durations.length : 0,
      shortest: durations.length > 0 ? Math.min(...durations) : 0,
      longest: durations.length > 0 ? Math.max(...durations) : 0,
    };
  }, [task1.togglEntries]);

  const task2Stats = useMemo(() => {
    const durations = task2.togglEntries.map((e) => e.duration);
    return {
      total: durations.reduce((sum, d) => sum + d, 0),
      average: durations.length > 0 ? durations.reduce((sum, d) => sum + d, 0) / durations.length : 0,
      shortest: durations.length > 0 ? Math.min(...durations) : 0,
      longest: durations.length > 0 ? Math.max(...durations) : 0,
    };
  }, [task2.togglEntries]);

  return (
    <Card className="bg-card border-border-zinc/60 shadow-xl shadow-black/25">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white">Time Entries Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-card-foreground border border-emerald-dark/40 rounded-lg p-4">
            <p className="text-xs text-emerald-light mb-1 font-medium">Task 1 Average</p>
            <p className="text-2xl font-bold text-white">{formatDuration(task1Stats.average)}</p>
          </div>
          
          <div className="bg-card-foreground border border-emerald-dark/40 rounded-lg p-4">
            <p className="text-xs text-emerald-light mb-1 font-medium">Task 1 Longest</p>
            <p className="text-2xl font-bold text-white">{formatDuration(task1Stats.longest)}</p>
          </div>

          <div className="bg-card-foreground border border-cyan-dark/40 rounded-lg p-4">
            <p className="text-xs text-cyan-light mb-1 font-medium">Task 2 Average</p>
            <p className="text-2xl font-bold text-white">{formatDuration(task2Stats.average)}</p>
          </div>

          <div className="bg-card-foreground border border-cyan-dark/40 rounded-lg p-4">
            <p className="text-xs text-cyan-light mb-1 font-medium">Task 2 Longest</p>
            <p className="text-2xl font-bold text-white">{formatDuration(task2Stats.longest)}</p>
          </div>
        </div>

        {/* Side by Side Entries */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Task 1 Entries */}
          <div className="bg-card-foreground border border-emerald-dark/40 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-emerald-light">{task1.taskId} Entries</h4>
              <span className="text-xs text-gray-500">{task1.togglEntries.length} entries</span>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-emerald">
              {task1.togglEntries.length > 0 ? (
                task1.togglEntries.map((entry) => {
                  const startTime = formatDateTime(entry.start);
                  const stopTime = formatDateTime(entry.stop);

                  return (
                    <div key={entry.id} className="bg-card border border-border-zinc/60 rounded-lg p-3 hover:border-emerald-normal/40 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm text-white font-medium flex-1 mr-2">{entry.description || "No description"}</p>
                        <span className="text-sm font-bold text-emerald-light whitespace-nowrap">{formatDuration(entry.duration)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{startTime.date}</span>
                        <span>•</span>
                        <span>
                          {startTime.time} - {stopTime.time}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">No time entries</div>
              )}
            </div>
          </div>

          {/* Task 2 Entries */}
          <div className="bg-card-foreground border border-cyan-dark/40 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-cyan-light">{task2.taskId} Entries</h4>
              <span className="text-xs text-gray-500">{task2.togglEntries.length} entries</span>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-cyan">
              {task2.togglEntries.length > 0 ? (
                task2.togglEntries.map((entry) => {
                  const startTime = formatDateTime(entry.start);
                  const stopTime = formatDateTime(entry.stop);

                  return (
                    <div key={entry.id} className="bg-card border border-border-zinc/60 rounded-lg p-3 hover:border-cyan-normal/40 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm text-white font-medium flex-1 mr-2">{entry.description || "No description"}</p>
                        <span className="text-sm font-bold text-cyan-light whitespace-nowrap">{formatDuration(entry.duration)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{startTime.date}</span>
                        <span>•</span>
                        <span>
                          {startTime.time} - {stopTime.time}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">No time entries</div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
