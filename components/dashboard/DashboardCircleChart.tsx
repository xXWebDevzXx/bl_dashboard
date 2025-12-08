"use client";
import React from "react";
import dynamic from "next/dynamic";

interface props {
  linearTasksWithTime: number;
  trackedCount: number;
  totalCount: number;
  className?: string;
}

// Dynamically import the chart with SSR disabled
const ChartContent = dynamic(() => import("./DashboardCircleChartContent"), { ssr: false });

export default function DashboardCircleChart({ linearTasksWithTime, trackedCount, totalCount, className }: props) {
  return (
    <div className={className}>
      <ChartContent linearTasksWithTime={linearTasksWithTime} trackedCount={trackedCount} totalCount={totalCount} />
    </div>
  );
}
