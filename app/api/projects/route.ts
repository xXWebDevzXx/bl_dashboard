import { NextResponse } from "next/server";
import { linearClient } from "@/lib/linear/client";
import { GET_PROJECTS } from "@/lib/linear/queries";
import { ProjectsResponse, LinearProject } from "@/lib/linear/types";

export async function GET(): Promise<
  NextResponse<LinearProject[] | { error: string }>
> {
  try {
    const data = await linearClient.query<ProjectsResponse>(GET_PROJECTS);
    return NextResponse.json(data.projects.nodes);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

