"use client";

import { useState, useEffect } from "react";
import { BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import TaskSelector from "./TaskSelector";
import TaskComparisonView from "./TaskComparisonView";
import type { Task } from "./types";

interface Props {
  tasks: Task[];
}

export default function CompareTasksClient({ tasks }: Props) {
  // Initialize state as null to match server rendering
  const [task1, setTask1] = useState<Task | null>(null);
  const [task2, setTask2] = useState<Task | null>(null);

  // Load saved tasks from localStorage after component mounts (client-side only)
  useEffect(() => {
    const savedTask1Id = localStorage.getItem("compareTask1Id");
    const savedTask2Id = localStorage.getItem("compareTask2Id");

    if (savedTask1Id) {
      const task = tasks.find((t) => t.id === savedTask1Id);
      if (task) setTask1(task);
    }

    if (savedTask2Id) {
      const task = tasks.find((t) => t.id === savedTask2Id);
      if (task) setTask2(task);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save task1 to localStorage when it changes
  useEffect(() => {
    if (task1) {
      localStorage.setItem("compareTask1Id", task1.id);
    } else {
      localStorage.removeItem("compareTask1Id");
    }
  }, [task1]);

  // Save task2 to localStorage when it changes
  useEffect(() => {
    if (task2) {
      localStorage.setItem("compareTask2Id", task2.id);
    } else {
      localStorage.removeItem("compareTask2Id");
    }
  }, [task2]);

  return (
    <div className="space-y-6">
      {/* Task Selectors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="animate-[fadeInScale_0.6s_ease-out_0.1s_both]">
          <TaskSelector label="Issue 1" tasks={tasks} selectedTask={task1} onSelect={setTask1} excludeTaskId={task2?.id} color="emerald" />
        </div>
        <div className="animate-[fadeInScale_0.6s_ease-out_0.2s_both]">
          <TaskSelector label="Issue 2" tasks={tasks} selectedTask={task2} onSelect={setTask2} excludeTaskId={task1?.id} color="cyan" />
        </div>
      </div>

      {/* Comparison View */}
      {task1 && task2 ? (
        <TaskComparisonView task1={task1} task2={task2} />
      ) : (
        <Card className="bg-[#161B22] border-zinc-800/60 shadow-xl shadow-black/25 animate-[fadeInScale_0.6s_ease-out_0.3s_both]">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="max-w-md mx-auto">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">Select Two Issues to Compare</h3>
              <p className="text-gray-500">Choose issues from the dropdowns above to see a detailed comparison of their metrics, time tracking, and performance.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
