"use client";
import React from "react";
import dynamic from "next/dynamic";
import type { TimeChartData } from "@/lib/time-chart-data";

interface props {
  className?: string;
  initialData?: TimeChartData[];
}

// Dynamically import the chart with SSR disabled
const ChartContent = dynamic(() => import("./DashboardAreaChartContent"), { ssr: false });

export default function DashboardAreaChart({ className, initialData }: props) {
  return (
    <div className={className}>
      <ChartContent initialData={initialData} />
    </div>
  );
}
