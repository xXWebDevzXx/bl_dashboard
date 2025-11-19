"use client";
import React from "react";
import dynamic from "next/dynamic";

interface props {
  className?: string;
}

// Dynamically import the chart with SSR disabled
const ChartContent = dynamic(() => import("./DashboardCircleChartContent"), { ssr: false });

export default function DashboardCircleChart({ className }: props) {
  return (
    <div className={className}>
      <ChartContent />
    </div>
  );
}
