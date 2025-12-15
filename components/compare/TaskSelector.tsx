"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { formatHoursToHM } from "@/lib/time-format-utils";
import { parseEstimateRange } from "@/lib/estimate-utils";
import type { Task } from "./types";

interface Props {
  label: string;
  tasks: Task[];
  selectedTask: Task | null;
  onSelect: (task: Task | null) => void;
  excludeTaskId?: string;
  color?: "emerald" | "cyan";
}

export default function TaskSelector({
  label,
  tasks,
  selectedTask,
  onSelect,
  excludeTaskId,
  color = "emerald",
}: Props) {
  const [open, setOpen] = useState(false);
  const filteredTasks = tasks.filter((task) => task.id !== excludeTaskId);

  // Parse the selected task's estimate to get displayFormat
  const selectedTaskEstimateDisplay = selectedTask
    ? parseEstimateRange(selectedTask.estimatedTime).displayFormat
    : "";

  const colorClasses = {
    emerald: {
      badge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      border: "border-emerald-800/40",
      scrollbar: "scrollbar-emerald",
    },
    cyan: {
      badge: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
      border: "border-cyan-800/40",
      scrollbar: "scrollbar-cyan",
    },
  };

  const colors = colorClasses[color];

  return (
    <Card className="bg-[#161B22] border-zinc-800/60 shadow-xl shadow-black/25">
      <CardContent className="pt-6">
        <Label className="text-sm font-medium text-gray-400 mb-3 block">
          {label}
        </Label>

        {selectedTask ? (
          <Card className="bg-[#0D1117] border-zinc-800/60">
            <CardContent className="pt-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-500 font-mono">
                      {selectedTask.taskId}
                    </span>
                    {selectedTask.delegateId && (
                      <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                        AI
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-white font-medium text-sm mb-2">
                    {selectedTask.name}
                  </h3>
                  {selectedTask.projectName && (
                    <p className="text-xs text-gray-500">{selectedTask.projectName}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSelect(null)}
                  className="h-8 w-8 p-0 text-gray-500 hover:text-red-400 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Labels */}
              {selectedTask.labels.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedTask.labels.map((label) => (
                    <Badge
                      key={label.id}
                      variant="outline"
                      className={colors.badge}
                    >
                      {label.name}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-zinc-800/60">
                <div>
                  <p className="text-xs text-gray-500">Estimated</p>
                  <p className="text-sm text-white font-semibold">
                    {selectedTaskEstimateDisplay}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Actual</p>
                  <p className="text-sm text-white font-semibold">
                    {formatHoursToHM(selectedTask.actualTime)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between bg-[#0D1117] border-zinc-800/60 text-white hover:bg-[#0D1117] hover:text-white cursor-pointer"
              >
                <span className="text-gray-500">Select an issue...</span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="p-0 bg-[#0D1117] border-zinc-800/60 duration-100"
              align="start"
              style={{ width: 'var(--radix-popover-trigger-width)' }}
            >
              <Command className="bg-[#0D1117]">
                <CommandInput
                  placeholder="Search issues by name, ID, or project..."
                  className="text-white border-zinc-800/60"
                />
                <CommandList className={cn("max-h-96 scrollbar-thin pr-2", colors.scrollbar)}>
                  <CommandEmpty className="py-6 text-center text-sm text-gray-500">
                    No issues found.
                  </CommandEmpty>
                  <CommandGroup>
                    {filteredTasks.map((task) => (
                      <CommandItem
                        key={task.id}
                        value={`${task.taskId} ${task.name} ${task.projectName || ""}`}
                        onSelect={() => {
                          onSelect(task);
                          setOpen(false);
                        }}
                        className="text-white hover:bg-zinc-800/30! aria-selected:bg-zinc-800/30! data-[selected=true]:bg-zinc-800/30! cursor-pointer"
                      >
                        <Check className="mr-2 h-4 w-4 opacity-0" />
                        <div className="flex flex-col gap-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 font-mono">
                              {task.taskId}
                            </span>
                            {task.delegateId && (
                              <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-[10px] px-1 py-0">
                                AI
                              </Badge>
                            )}
                          </div>
                          <span className="text-sm text-white">{task.name}</span>
                          {task.projectName && (
                            <span className="text-xs text-gray-500">
                              {task.projectName}
                            </span>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )}
      </CardContent>
    </Card>
  );
}
