"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error for debugging
    console.error("Dashboard error:", error);

    // Show toast notification
    toast.error("Failed to load dashboard", {
      description: error.message || "An unexpected error occurred. Please try again.",
      duration: 5000,
    });
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4 max-w-md text-center p-6">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h2 className="text-xl font-semibold text-gray-200">
          Failed to load dashboard
        </h2>
        <p className="text-gray-400 text-sm">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <Button
          onClick={reset}
          variant="default"
          className="mt-4"
        >
          Try again
        </Button>
      </div>
    </div>
  );
}
