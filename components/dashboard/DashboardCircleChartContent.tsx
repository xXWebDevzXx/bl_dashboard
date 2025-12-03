interface props {
  linearTasksWithTime: number;
}

export default function DashboardCircleChartContent({ linearTasksWithTime }: props) {
  const percentage = linearTasksWithTime.toFixed(1);
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (parseInt(percentage) / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-[200px] h-[200px]">
      <svg className="transform -rotate-90" width="200" height="200">

        <circle cx="100" cy="100" r={radius} stroke="#1e293b" strokeWidth="12" fill="none" />

        <defs>
          <linearGradient id="circleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>

        <circle cx="100" cy="100" r={radius} stroke="url(#circleGradient)" strokeWidth="12" fill="none" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" />
      </svg>

      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-4xl font-bold text-white">+{percentage}%</span>
      </div>
    </div>
  );
}
