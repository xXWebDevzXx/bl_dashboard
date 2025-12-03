import { NextResponse } from "next/server";
import { linearClient } from "@/lib/linear/client";
import { GET_TEAMS } from "@/lib/linear/queries";
import { TeamsResponse, LinearTeam } from "@/lib/linear/types";

export async function GET(): Promise<
  NextResponse<LinearTeam[] | { error: string }>
> {
  try {
    const data = await linearClient.query<TeamsResponse>(GET_TEAMS);
    return NextResponse.json(data.teams.nodes);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

