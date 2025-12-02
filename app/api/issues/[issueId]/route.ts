import { linearClient } from "@/lib/linear/client";
import { GET_ISSUE_BY_ID } from "@/lib/linear/queries";
import {
  IssueByIdVariables,
  IssueResponse,
  LinearIssue,
} from "@/lib/linear/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ issueId: string }> }
): Promise<NextResponse<LinearIssue | { error: string }>> {
  try {
    const { issueId } = await params;
    const variables: IssueByIdVariables = { id: issueId };
    const data = await linearClient.query<IssueResponse>(
      GET_ISSUE_BY_ID,
      variables
    );

    if (!data.issue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    return NextResponse.json(data.issue);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
