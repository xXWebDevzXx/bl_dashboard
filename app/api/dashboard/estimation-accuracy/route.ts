import { NextResponse } from "next/server";
import { getEstimationAccuracy } from "@/lib/estimation-accuracy";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getEstimationAccuracy();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching estimation accuracy data:", error);
    return NextResponse.json(
      { error: "Failed to fetch estimation accuracy data" },
      { status: 500 }
    );
  }
}
