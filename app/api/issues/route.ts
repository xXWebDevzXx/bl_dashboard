import { linearClient } from "@/lib/linear/client";
import { GET_ISSUES } from "@/lib/linear/queries";
import {
  IssueFilter,
  IssuesResponse,
  IssuesVariables,
  LinearIssue,
} from "@/lib/linear/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest
): Promise<NextResponse<LinearIssue[] | { error: string }>> {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const teamId = searchParams.get("teamId");
    const state = searchParams.get("state");

    // Build filter object
    const filter: IssueFilter = {};
    if (teamId) {
      filter.team = { id: { eq: teamId } };
    }
    if (state) {
      filter.state = { name: { eq: state } };
    }

    const variables: IssuesVariables = {
      first: limit,
      filter: Object.keys(filter).length > 0 ? filter : undefined,
    };

    const data = await linearClient.query<IssuesResponse>(
      GET_ISSUES,
      variables
    );

    return NextResponse.json(data.issues.nodes);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
