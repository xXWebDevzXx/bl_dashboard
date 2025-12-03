"use client";

import { useEffect, useState } from "react";

interface props {
  linearTasksWithTime: number;
}

export default function DashboardCircleChartContent({ linearTasksWithTime }: props) {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const percentage = linearTasksWithTime.toFixed(1);
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedPercentage / 100) * circumference;

  // Animate the percentage counter on mount
  useEffect(() => {
    const targetPercentage = parseFloat(percentage);
    const duration = 1500; // 1.5 seconds
    const steps = 60;
    const increment = targetPercentage / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= targetPercentage) {
        setAnimatedPercentage(targetPercentage);
        clearInterval(timer);
      } else {
        setAnimatedPercentage(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [percentage]);

  return (
    <div className="flex flex-col items-center justify-center w-full p-6">
      <h2 className="text-xl font-bold text-white mb-6">Tasks med Tidsregistrering</h2>

      <div className="relative flex items-center justify-center w-[220px] h-[220px]">
        <svg className="transform -rotate-90" width="220" height="220">
          {/* Background circle */}
          <circle
            cx="110"
            cy="110"
            r={radius}
            stroke="#1e293b"
            strokeWidth="16"
            fill="none"
          />

          {/* Gradient definition */}
          <defs>
            <linearGradient id="circleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="100%" stopColor="#0891b2" />
            </linearGradient>

            {/* Glow effect */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Progress circle with animation */}
          <circle
            cx="110"
            cy="110"
            r={radius}
            stroke="url(#circleGradient)"
            strokeWidth="16"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            filter="url(#glow)"
            style={{
              transition: 'stroke-dashoffset 0.3s ease-out'
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-bold text-white mb-1">
            {animatedPercentage.toFixed(1)}%
          </span>
          <span className="text-sm text-gray-400">tracked</span>
        </div>
      </div>
    </div>
  );
}
