"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterOptions {
  projects: string[];
  estimates: string[];
  labels: string[];
}

export function IssueFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [project, setProject] = useState(searchParams.get("project") || "");
  const [delegate, setDelegate] = useState(searchParams.get("delegate") || "");
  const [estimate, setEstimate] = useState(searchParams.get("estimate") || "");
  const [hasTimeEntries, setHasTimeEntries] = useState(searchParams.get("hasTimeEntries") || "");
  const [label, setLabel] = useState(searchParams.get("label") || "");
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    projects: [],
    estimates: [],
    labels: [],
  });

  // Popover open states
  const [projectOpen, setProjectOpen] = useState(false);
  const [estimateOpen, setEstimateOpen] = useState(false);
  const [labelOpen, setLabelOpen] = useState(false);

  // Fetch filter options on mount
  useEffect(() => {
    fetch("/api/linear_issues/filter-options")
      .then((res) => res.json())
      .then((data) => setFilterOptions(data))
      .catch((err) => console.error("Failed to fetch filter options:", err));
  }, []);

  // Update URL with filters
  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());

    // Remove page when applying new filters
    params.delete("page");

    // Set or delete each filter parameter
    if (search) params.set("search", search);
    else params.delete("search");

    if (project && project !== "all") params.set("project", project);
    else params.delete("project");

    if (delegate) params.set("delegate", delegate);
    else params.delete("delegate");

    if (estimate && estimate !== "all") params.set("estimate", estimate);
    else params.delete("estimate");

    if (hasTimeEntries && hasTimeEntries !== "all") params.set("hasTimeEntries", hasTimeEntries);
    else params.delete("hasTimeEntries");

    if (label && label !== "all") params.set("label", label);
    else params.delete("label");

    router.push(`/issues?${params.toString()}`);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearch("");
    setProject("");
    setDelegate("");
    setEstimate("");
    setHasTimeEntries("");
    setLabel("");
    router.push("/issues");
  };

  // Check if any filters are active
  const hasActiveFilters = search || project || delegate || estimate || hasTimeEntries || label;

  return (
    <Card className="bg-[#161B22] border-zinc-800/60 mb-6 shadow-lg shadow-black/30">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white">Filters</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search" className="text-gray-300">Search</Label>
            <Input
              id="search"
              placeholder="Search by name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              className="bg-[#0D1117] border-zinc-800/60 text-white"
            />
          </div>

          {/* Project - Searchable Combobox */}
          <div className="space-y-2">
            <Label className="text-gray-300">Project</Label>
            <Popover open={projectOpen} onOpenChange={setProjectOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={projectOpen}
                  className="w-full justify-between bg-[#0D1117] border-zinc-800/60 text-white hover:bg-[#0D1117] hover:text-white cursor-pointer"
                >
                  {project ? project : "All projects"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0 bg-[#0D1117] border-zinc-800/60">
                <Command className="bg-[#0D1117]">
                  <CommandInput placeholder="Search projects..." className="text-white" />
                  <CommandList>
                    <CommandEmpty className="text-gray-400">No project found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value=""
                        onSelect={() => {
                          setProject("");
                          setProjectOpen(false);
                        }}
                        className="text-white"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            project === "" ? "opacity-100" : "opacity-0"
                          )}
                        />
                        All projects
                      </CommandItem>
                      {filterOptions.projects.map((proj) => (
                        <CommandItem
                          key={proj}
                          value={proj}
                          onSelect={(currentValue) => {
                            setProject(currentValue === project ? "" : currentValue);
                            setProjectOpen(false);
                          }}
                          className="text-white"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              project === proj ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {proj}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Estimate - Searchable Combobox */}
          <div className="space-y-2">
            <Label className="text-gray-300">Estimate</Label>
            <Popover open={estimateOpen} onOpenChange={setEstimateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={estimateOpen}
                  className="w-full justify-between bg-[#0D1117] border-zinc-800/60 text-white hover:bg-[#0D1117] hover:text-white cursor-pointer"
                >
                  {estimate ? estimate : "All estimates"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0 bg-[#0D1117] border-zinc-800/60">
                <Command className="bg-[#0D1117]">
                  <CommandInput placeholder="Search estimates..." className="text-white" />
                  <CommandList>
                    <CommandEmpty className="text-gray-400">No estimate found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value=""
                        onSelect={() => {
                          setEstimate("");
                          setEstimateOpen(false);
                        }}
                        className="text-white"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            estimate === "" ? "opacity-100" : "opacity-0"
                          )}
                        />
                        All estimates
                      </CommandItem>
                      {filterOptions.estimates.map((est) => (
                        <CommandItem
                          key={est}
                          value={est}
                          onSelect={(currentValue) => {
                            setEstimate(currentValue === estimate ? "" : currentValue);
                            setEstimateOpen(false);
                          }}
                          className="text-white"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              estimate === est ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {est}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Label - Searchable Combobox */}
          <div className="space-y-2">
            <Label className="text-gray-300">Label</Label>
            <Popover open={labelOpen} onOpenChange={setLabelOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={labelOpen}
                  className="w-full justify-between bg-[#0D1117] border-zinc-800/60 text-white hover:bg-[#0D1117] hover:text-white"
                >
                  {label ? label : "All labels"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0 bg-[#0D1117] border-zinc-800/60">
                <Command className="bg-[#0D1117]">
                  <CommandInput placeholder="Search labels..." className="text-white" />
                  <CommandList>
                    <CommandEmpty className="text-gray-400">No label found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value=""
                        onSelect={() => {
                          setLabel("");
                          setLabelOpen(false);
                        }}
                        className="text-white"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            label === "" ? "opacity-100" : "opacity-0"
                          )}
                        />
                        All labels
                      </CommandItem>
                      {filterOptions.labels.map((lbl) => (
                        <CommandItem
                          key={lbl}
                          value={lbl}
                          onSelect={(currentValue) => {
                            setLabel(currentValue === label ? "" : currentValue);
                            setLabelOpen(false);
                          }}
                          className="text-white"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              label === lbl ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {lbl}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Has Time Entries */}
          <div className="space-y-2">
            <Label htmlFor="hasTimeEntries" className="text-gray-300">Time Entries</Label>
            <Select value={hasTimeEntries} onValueChange={setHasTimeEntries}>
              <SelectTrigger className="bg-[#0D1117] border-zinc-800/60 text-white">
                <SelectValue placeholder="All tasks" />
              </SelectTrigger>
              <SelectContent className="bg-[#0D1117] border-zinc-800/60">
                <SelectItem value="all" className="text-white">All tasks</SelectItem>
                <SelectItem value="true" className="text-white">With time entries</SelectItem>
                <SelectItem value="false" className="text-white">Without time entries</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <Button
            onClick={applyFilters}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Apply Filters
          </Button>
          {hasActiveFilters && (
            <Button
              onClick={clearFilters}
              variant="outline"
              className="border-zinc-800/60 text-gray-300 hover:bg-zinc-800/60"
            >
              Clear Filters
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
