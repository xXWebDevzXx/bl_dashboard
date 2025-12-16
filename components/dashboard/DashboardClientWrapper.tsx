"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface Props {
  children: React.ReactNode;
}

export default function DashboardClientWrapper({ children }: Props) {
  const [showSpinner, setShowSpinner] = useState(true);

  useEffect(() => {
    // Check if this is the first visit
    const hasVisited = sessionStorage.getItem("dashboardVisited");

    if (!hasVisited) {
      // First visit, mark as visited and show spinner for 800ms
      sessionStorage.setItem("dashboardVisited", "true");

      const timer = setTimeout(() => {
        setShowSpinner(false);
      }, 800);

      return () => clearTimeout(timer);
    } else {
      // Not first visit, hide spinner immediately using microtask
      queueMicrotask(() => {
        setShowSpinner(false);
      });
    }
  }, []);

  // During SSR and before hydration, always show spinner
  if (showSpinner) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 text-emerald-normal animate-spin" />
          <p className="text-gray-400 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
