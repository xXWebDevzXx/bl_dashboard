"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar, Check } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

type TimePeriod = "1w" | "2w" | "1m" | "3m" | "6m" | "1y" | "all";

interface TimePeriodOption {
  value: TimePeriod;
  label: string;
}

const timePeriodOptions: TimePeriodOption[] = [
  { value: "1w", label: "1 Week" },
  { value: "2w", label: "2 Weeks" },
  { value: "1m", label: "1 Month" },
  { value: "3m", label: "3 Months" },
  { value: "6m", label: "6 Months" },
  { value: "1y", label: "1 Year" },
  { value: "all", label: "All Time" },
];

export default function TimePeriodFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPeriod = (searchParams.get("period") as TimePeriod) || "all";
  const [isOpen, setIsOpen] = useState(false);

  const handlePeriodChange = (period: TimePeriod) => {
    const params = new URLSearchParams(searchParams.toString());
    if (period === "all") {
      params.delete("period");
    } else {
      params.set("period", period);
    }

    const newUrl = params.toString() ? `?${params.toString()}` : "";
    router.push(`/dashboard${newUrl}`);
    setIsOpen(false);
  };

  const getCurrentLabel = () => {
    const option = timePeriodOptions.find((opt) => opt.value === currentPeriod);
    return option?.label || "All Time";
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-border-zinc bg-zinc-900/50 text-zinc-300 hover:bg-gradient-to-r hover:from-emerald-normal/5 hover:to-cyan-normal/5 hover:text-white hover:border-emerald-normal/10 cursor-pointer transition-all ease-in-out"
        >
          <Calendar className="w-4 h-4 mr-2" />
          {getCurrentLabel()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto bg-card border-border-zinc/80 p-3 shadow-xl">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-white mb-1 px-2">
            Time Period
          </label>
          {timePeriodOptions.map((option) => (
            <Button
              key={option.value}
              variant="ghost"
              size="sm"
              className={`w-full justify-between text-zinc-200 hover:bg-zinc-800/60 hover:text-white transition-colors ${
                currentPeriod === option.value ? "bg-zinc-800/60 text-white" : ""
              }`}
              onClick={() => handlePeriodChange(option.value)}
            >
              <span>{option.label}</span>
              {currentPeriod === option.value && (
                <Check className="w-4 h-4 ml-2" />
              )}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
