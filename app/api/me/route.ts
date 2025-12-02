import { NextRequest, NextResponse } from "next/server";
import { linearClient } from "@/lib/linear/client";
import { GET_VIEWER } from "@/lib/linear/queries";
import { ViewerResponse, LinearUser } from "@/lib/linear/types";

export async function GET(
  _request: NextRequest
): Promise<NextResponse<LinearUser | { error: string }>> {
  try {
    const data = await linearClient.query<ViewerResponse>(GET_VIEWER);
    return NextResponse.json(data.viewer);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

