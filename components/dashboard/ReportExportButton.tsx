"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ReportExportButton() {
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  const handleExport = async (format: "pdf" | "excel") => {
    setIsGenerating(format);
    try {
      const response = await fetch(`/api/dashboard/report?format=${format}`);

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

      toast.success(`Report exported successfully as ${format.toUpperCase()}`, {
        description: `Your dashboard report has been downloaded.`,
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
      <PopoverContent className="w-56 bg-[#161B22] border-zinc-800/60 p-2">
        <div className="flex flex-col gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-white hover:bg-zinc-800"
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
            className="w-full justify-start text-white hover:bg-zinc-800"
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
      </PopoverContent>
    </Popover>
  );
}
