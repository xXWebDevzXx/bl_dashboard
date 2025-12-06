"use client";

import { useEffect, useState } from "react";

interface props {
  linearTasksWithTime: number;
}

export default function DashboardCircleChartContent({ linearTasksWithTime }: props) {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const percentage = linearTasksWithTime.toFixed(1);

  // Responsive radius based on screen size
  const [radius, setRadius] = useState(60);
  const [svgSize, setSvgSize] = useState(160);

  useEffect(() => {
    const updateSize = () => {
      if (window.innerWidth < 640) {
        setRadius(50);
        setSvgSize(140);
      } else if (window.innerWidth < 1100) {
        setRadius(65);
        setSvgSize(180);
      } else {
        setRadius(80);
        setSvgSize(220);
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedPercentage / 100) * circumference;
  const center = svgSize / 2;
  const strokeWidth = window.innerWidth < 640 ? 12 : 16;

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
    <div className="flex flex-col items-center justify-center w-full p-2 sm:p-4 desktop:p-6">
      <h2 className="text-base sm:text-lg desktop:text-xl font-bold text-white mb-3 sm:mb-4 desktop:mb-6">Tasks med Tidsregistrering</h2>

      <div className={`relative flex items-center justify-center`} style={{ width: svgSize, height: svgSize }}>
        <svg className="transform -rotate-90" width={svgSize} height={svgSize}>
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="#1e293b"
            strokeWidth={strokeWidth}
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
            cx={center}
            cy={center}
            r={radius}
            stroke="url(#circleGradient)"
            strokeWidth={strokeWidth}
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
          <span className="text-3xl sm:text-4xl desktop:text-5xl font-bold text-white mb-1">
            {animatedPercentage.toFixed(1)}%
          </span>
          <span className="text-xs sm:text-sm text-gray-400">tracked</span>
        </div>
      </div>
    </div>
  );
}
