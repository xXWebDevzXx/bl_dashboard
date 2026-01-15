"use client";

import { useState, useMemo } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

// Helper function to normalize estimate strings (remove "hours" suffix)
const normalizeEstimate = (estimate: string): string => {
  return estimate.replace(/\s*hours?\s*/gi, '').trim();
};

// Helper function to split combined estimates like "1-3, 2-4" into ["1-3", "2-4"]
const splitEstimates = (estimate: string): string[] => {
  return estimate.split(',').map(e => normalizeEstimate(e)).filter(e => e !== '');
};

// Helper function to extract the first number from an estimate for sorting
const getEstimateSortValue = (estimate: string): number => {
  const match = estimate.match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : 9999;
};

export default function TaskSelector({
  label,
  tasks,
  selectedTask,
  onSelect,
  excludeTaskId,
  color = "emerald",
}: Props) {
  const [open, setOpen] = useState(false);
  const [aiFilter, setAiFilter] = useState<"all" | "ai" | "non-ai">("all");
  const [estimateFilter, setEstimateFilter] = useState<string>("all");
  const [timeEntryFilter, setTimeEntryFilter] = useState<"all" | "with" | "without">("all");
  const [labelFilter, setLabelFilter] = useState<string>("all");
  const [projectFilter, setProjectFilter] = useState<string>("all");

  // Extract unique estimate labels from all tasks
  const uniqueEstimates = useMemo(() => {
    const estimates = new Set<string>();
    const estimateRegex = /^Estimate[\s:]\s*(.+)$/i;

    tasks.forEach((task) => {
      // Extract from task.estimatedTime field
      if (task.estimatedTime && task.estimatedTime !== "") {
        const splitEstimatesList = splitEstimates(task.estimatedTime);
        splitEstimatesList.forEach(est => estimates.add(est));
      }

      // Also extract from labels that start with "Estimate"
      task.labels.forEach((label) => {
        const match = label.name.match(estimateRegex);
        if (match) {
          const estimateValue = normalizeEstimate(match[1]);
          if (estimateValue) {
            estimates.add(estimateValue);
          }
        }
      });
    });

    // Sort by the first number in the estimate
    return Array.from(estimates).sort((a, b) => {
      const aVal = getEstimateSortValue(a);
      const bVal = getEstimateSortValue(b);
      if (aVal !== bVal) return aVal - bVal;
      // If first numbers are equal, sort alphabetically
      return a.localeCompare(b);
    });
  }, [tasks]);

  // Extract unique non-estimate labels from all tasks
  const uniqueLabels = useMemo(() => {
    const labels = new Set<string>();
    // Match labels that start with "Estimate" (with or without colon/space)
    const estimateRegex = /^Estimate[\s:]/i;
    tasks.forEach((task) => {
      task.labels.forEach((label) => {
        // Exclude estimate labels
        if (!estimateRegex.test(label.name)) {
          labels.add(label.name);
        }
      });
    });
    return Array.from(labels).sort();
  }, [tasks]);

  // Extract unique projects from all tasks
  const uniqueProjects = useMemo(() => {
    const projects = new Set<string>();
    tasks.forEach((task) => {
      if (task.projectName) {
        projects.add(task.projectName);
      }
    });
    return Array.from(projects).sort();
  }, [tasks]);

  // Apply filters to tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Exclude the other selected task
      if (task.id === excludeTaskId) return false;

      // Apply AI filter
      if (aiFilter === "ai" && !task.delegateId) return false;
      if (aiFilter === "non-ai" && task.delegateId) return false;

      // Apply estimate filter
      if (estimateFilter !== "all") {
        const taskEstimates = splitEstimates(task.estimatedTime);

        // Also check labels for estimate values
        const estimateRegex = /^Estimate[\s:]\s*(.+)$/i;
        const estimatesFromLabels: string[] = [];
        task.labels.forEach((label) => {
          const match = label.name.match(estimateRegex);
          if (match) {
            const estimateValue = normalizeEstimate(match[1]);
            if (estimateValue) {
              estimatesFromLabels.push(estimateValue);
            }
          }
        });

        // Combine estimates from both sources
        const allEstimates = [...taskEstimates, ...estimatesFromLabels];

        // Check if any of the task's estimates match the selected filter
        if (!allEstimates.includes(estimateFilter)) return false;
      }

      // Apply time entry filter
      if (timeEntryFilter === "with" && task.togglEntries.length === 0) return false;
      if (timeEntryFilter === "without" && task.togglEntries.length > 0) return false;

      // Apply label filter (non-estimate labels)
      if (labelFilter !== "all") {
        const hasLabel = task.labels.some(label => label.name === labelFilter);
        if (!hasLabel) return false;
      }

      // Apply project filter
      if (projectFilter !== "all") {
        if (task.projectName !== projectFilter) return false;
      }

      return true;
    });
  }, [tasks, excludeTaskId, aiFilter, estimateFilter, timeEntryFilter, labelFilter, projectFilter]);

  // Parse the selected task's estimate to get displayFormat
  const selectedTaskEstimateDisplay = selectedTask
    ? parseEstimateRange(selectedTask.estimatedTime).displayFormat
    : "";

  const colorClasses = {
    emerald: {
      badge: "bg-emerald-normal/20 text-emerald-light border-emerald-normal/30",
      border: "border-emerald-dark/40",
      scrollbar: "scrollbar-emerald",
    },
    cyan: {
      badge: "bg-cyan-normal/20 text-cyan-light border-cyan-normal/30",
      border: "border-cyan-dark/40",
      scrollbar: "scrollbar-cyan",
    },
  };

  const colors = colorClasses[color];

  return (
    <Card className="bg-card border-border-zinc/60 shadow-xl shadow-black/25">
      <CardContent className="pt-6">
        <Label className="text-sm font-medium text-gray-400 mb-3 block">{label}</Label>

        {/* Filters - Only show when no task is selected */}
        {!selectedTask && (
          <div className="space-y-3 mb-4">
            {/* First Row - Issue Type, Estimate, Time Entries */}

            {/* Second Row - Label, Project */}
            <div className="flex gap-3">
              {/* Label Filter */}
              <div className="space-y-2">
                <Label className="text-xs text-gray-500">Label</Label>
                <Select value={labelFilter} onValueChange={setLabelFilter}>
                  <SelectTrigger className="bg-card-foreground border-border-zinc/60 text-white h-10 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card-foreground border-border-zinc/60">
                    <SelectItem value="all" className="text-white text-sm">
                      All labels
                    </SelectItem>
                    {uniqueLabels.map((label) => (
                      <SelectItem key={label} value={label} className="text-white text-sm">
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Project Filter */}
              <div className="space-y-2">
                <Label className="text-xs text-gray-500">Project</Label>
                <Select value={projectFilter} onValueChange={setProjectFilter}>
                  <SelectTrigger className="bg-card-foreground border-border-zinc/60 text-white h-10 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card-foreground border-border-zinc/60">
                    <SelectItem value="all" className="text-white text-sm">
                      All projects
                    </SelectItem>
                    {uniqueProjects.map((project) => (
                      <SelectItem key={project} value={project} className="text-white text-sm">
                        {project}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-3 flex-wrap">
              {/* AI Filter */}
              <div className="space-y-2">
                <Label className="text-xs text-gray-500">Issue Type</Label>
                <Select value={aiFilter} onValueChange={(value) => setAiFilter(value as "all" | "ai" | "non-ai")}>
                  <SelectTrigger className="bg-card-foreground border-border-zinc/60 text-white h-10 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card-foreground border-border-zinc/60">
                    <SelectItem value="all" className="text-white text-sm">
                      All issues
                    </SelectItem>
                    <SelectItem value="ai" className="text-white text-sm">
                      AI issues
                    </SelectItem>
                    <SelectItem value="non-ai" className="text-white text-sm">
                      Non-AI issues
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Estimate Filter */}
              <div className="space-y-2">
                <Label className="text-xs text-gray-500">Estimate</Label>
                <Select value={estimateFilter} onValueChange={setEstimateFilter}>
                  <SelectTrigger className="bg-card-foreground border-border-zinc/60 text-white h-10 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card-foreground border-border-zinc/60">
                    <SelectItem value="all" className="text-white text-sm">
                      All estimates
                    </SelectItem>
                    {uniqueEstimates.map((estimate) => (
                      <SelectItem key={estimate} value={estimate} className="text-white text-sm">
                        {estimate}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Time Entry Filter */}
              <div className="space-y-2">
                <Label className="text-xs text-gray-500">Time Entries</Label>
                <Select value={timeEntryFilter} onValueChange={(value) => setTimeEntryFilter(value as "all" | "with" | "without")}>
                  <SelectTrigger className="bg-card-foreground border-border-zinc/60 text-white h-10 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card-foreground border-border-zinc/60">
                    <SelectItem value="all" className="text-white text-sm">
                      All issues
                    </SelectItem>
                    <SelectItem value="with" className="text-white text-sm">
                      With time entries
                    </SelectItem>
                    <SelectItem value="without" className="text-white text-sm">
                      Without time entries
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {selectedTask ? (
          <Card className="bg-card-foreground border-border-zinc/60">
            <CardContent className="pt-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-500 font-mono">{selectedTask.taskId}</span>
                    {selectedTask.delegateId && (
                      <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                        AI
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-white font-medium text-sm mb-2">{selectedTask.name}</h3>
                  {selectedTask.projectName && <p className="text-xs text-gray-500">{selectedTask.projectName}</p>}
                </div>
                <Button variant="ghost" size="sm" onClick={() => onSelect(null)} className="h-8 w-8 p-0 text-gray-500 hover:text-red-400 cursor-pointer">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Labels */}
              {selectedTask.labels.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedTask.labels.map((label) => (
                    <Badge key={label.id} variant="outline" className={colors.badge}>
                      {label.name}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-border-zinc/60">
                <div>
                  <p className="text-xs text-gray-500">Estimated</p>
                  <p className="text-sm text-white font-semibold">{selectedTaskEstimateDisplay}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Actual</p>
                  <p className="text-sm text-white font-semibold">{formatHoursToHM(selectedTask.actualTime)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between bg-card-foreground border-border-zinc/60 text-white hover:bg-card-foreground hover:text-white cursor-pointer">
                <span className="text-gray-500">Select an issue...</span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 bg-card-foreground border-border-zinc/60 duration-100" align="start" style={{ width: "var(--radix-popover-trigger-width)" }}>
              <Command className="bg-card-foreground">
                <CommandInput placeholder="Search issues by name, ID, or project..." className="text-white border-border-zinc/60" />
                <CommandList className={cn("max-h-96 scrollbar-thin pr-2", colors.scrollbar)}>
                  <CommandEmpty className="py-6 text-center text-sm text-gray-500">No issues found.</CommandEmpty>
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
                            <span className="text-xs text-gray-500 font-mono">{task.taskId}</span>
                            {task.delegateId && (
                              <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-[10px] px-1 py-0">
                                AI
                              </Badge>
                            )}
                          </div>
                          <span className="text-sm text-white">{task.name}</span>
                          {task.projectName && <span className="text-xs text-gray-500">{task.projectName}</span>}
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
