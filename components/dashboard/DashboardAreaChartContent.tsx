import { ChartContainer, ChartConfig, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { ContentType } from "recharts/types/component/DefaultLegendContent";

const chartConfig = {
  value1: {
    label: "Hest",
    color: "#84B2FF",
  },
  value2: {
    label: "Ko",
    color: "#4876DE",
  },
} satisfies ChartConfig;

const testData = [
  { name: "Dag 1", time: "2h", value1: 2, value2: 5 },
  { name: "Dag 2", time: "3h", value1: 4, value2: 2 },
  { name: "Dag 3", time: "1h", value1: 1, value2: 3 },
  { name: "Dag 4", time: "5h", value1: 5, value2: 4 },
  { name: "Dag 5", time: "3h", value1: 3, value2: 6 },
  { name: "Dag 6", time: "6h", value1: 6, value2: 2 },
  { name: "Dag 7", time: "4h", value1: 4, value2: 5 },
  { name: "Dag 8", time: "7h", value1: 7, value2: 3 },
  { name: "Dag 9", time: "5h", value1: 5, value2: 4 },
  { name: "Dag 10", time: "8h", value1: 8, value2: 6 },
];

export default function DashboardAreaChartContent() {
  return (
    <>
      <div className="p-4 mb-4">
        <h1 className="text-2xl font-bold text-white">Tid brugt pr. uge: AI vs Non-AI tasks</h1>
      </div>
      <ChartContainer config={chartConfig} className="h-[200px] w-full">
        <AreaChart accessibilityLayer data={testData} margin={{ left: 12, right: 12, top: 12, bottom: 12 }}>
          <defs>
            <linearGradient id="gradientValue1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#84B2FF" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#84B2FF" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="gradientValue2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4876DE" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#4876DE" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="white" opacity="0.04" />
          <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => `${value}h`} width={30} />
          <ChartLegend className="text-white" content={ChartLegendContent as unknown as ContentType} />
          <Area dataKey="value1" type="linear" fill="url(#gradientValue1)" stroke="var(--color-value1)" stackId="a" />
          <Area dataKey="value2" type="linear" fill="url(#gradientValue2)" stroke="var(--color-value2)" stackId="b" />
        </AreaChart>
      </ChartContainer>
    </>
  );
}
