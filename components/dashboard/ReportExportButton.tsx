"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { type DateRange } from "@/components/ui/calendar";
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ReportExportButton() {
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const handleExport = async (format: "pdf" | "excel") => {
    setIsGenerating(format);
    try {
      // Build query parameters
      const params = new URLSearchParams();
      params.append("format", format);

      if (dateRange?.from) {
        params.append("startDate", dateRange.from.toISOString().split("T")[0]);
      }
      if (dateRange?.to) {
        params.append("endDate", dateRange.to.toISOString().split("T")[0]);
      }

      const response = await fetch(
        `/api/dashboard/report?${params.toString()}`
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate report");
      }

      // Get the blob from response
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = `dashboard-report-${
        new Date().toISOString().split("T")[0]
      }.${format === "pdf" ? "pdf" : "xlsx"}`;

      if (contentDisposition) {
        // Handle both quoted and unquoted filenames
        const filenameMatch = contentDisposition.match(
          /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
        );
        if (filenameMatch && filenameMatch[1]) {
          // Remove quotes if present
          filename = filenameMatch[1].replace(/['"]/g, "");
        }
      }

      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      const dateRangeText =
        dateRange?.from && dateRange?.to
          ? ` for ${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`
          : "";

      toast.success(`Report exported successfully as ${format.toUpperCase()}`, {
        description: `Your dashboard report${dateRangeText} has been downloaded.`,
      });
    } catch (error) {
      console.error("Error exporting report:", error);
      toast.error("Failed to export report", {
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while generating the report. Please try again.",
      });
    } finally {
      setIsGenerating(null);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-zinc-700 bg-zinc-900/50 text-zinc-300 hover:bg-gradient-to-r hover:from-emerald-600/5 hover:to-cyan-600/5 hover:text-white hover:border-emerald-600/10 cursor-pointer transition-all ease-in-out"
          disabled={isGenerating !== null}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto bg-[#161B22] border-zinc-800/80 p-5 shadow-xl">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-white">
                Date Range
              </label>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Optional: Select a date range to filter the report data
              </p>
            </div>
            <DateRangePicker date={dateRange} onDateChange={setDateRange} />
          </div>
          <div className="border-t border-zinc-800/60 pt-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-white mb-1">
                Export Format
              </label>
              <div className="flex flex-col gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-zinc-200 hover:bg-zinc-800/60 hover:text-white transition-colors"
              onClick={() => handleExport("pdf")}
              disabled={isGenerating !== null}
            >
              {isGenerating === "pdf" ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <FileText className="w-4 h-4 mr-2" />
              )}
              Export as PDF
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-zinc-200 hover:bg-zinc-800/60 hover:text-white transition-colors"
              onClick={() => handleExport("excel")}
              disabled={isGenerating !== null}
            >
              {isGenerating === "excel" ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <FileSpreadsheet className="w-4 h-4 mr-2" />
              )}
              Export as Excel
            </Button>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
