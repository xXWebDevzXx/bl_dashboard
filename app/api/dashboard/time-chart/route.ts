import { NextResponse } from "next/server";
import { getTimeChartData } from "@/lib/time-chart-data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getTimeChartData();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching time chart data:", error);
    return NextResponse.json(
      { error: "Failed to fetch time chart data" },
      { status: 500 }
    );
  }
}
