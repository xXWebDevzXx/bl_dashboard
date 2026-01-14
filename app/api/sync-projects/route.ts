import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";

// Types
interface LinearProject {
  id: string;
  name: string;
  description: string | null;
  state: string;
  startDate: string | null;
  targetDate: string | null;
  lead: {
    id: string;
    name: string;
  } | null;
}

interface TogglProject {
  id: number;
  name: string;
  workspace_id: number;
  active: boolean;
  // Add other fields as needed
}

interface TogglTask {
  id: number;
  name: string;
  project_id: number;
  estimated_seconds: number | null;
  // Add other fields as needed
}

interface TogglTimeEntry {
  id: number;
  start: string;
  stop: string;
  duration: number;
  description: string;
  task_id: number;
  project_id: number;
  user_id: number;
  // Add other fields as needed
}

// Toggl Reports API response structure (nested)
interface TogglReportEntry {
  description: string;
  task_id: number;
  project_id: number;
  user_id: number;
  time_entries?: Array<{
    id: number;
    start: string;
    stop: string;
    seconds: number;
  }>;
}

interface LinearIssue {
  id: string;
  number: number;
  identifier: string;
  title: string;
  description: string | null;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  estimate: number | null;
  project: {
    name: string;
  } | null;
  assignee: {
    id: string;
    name: string;
    displayName: string;
  } | null;
  delegate: {
    id: string;
    name: string;
  } | null;
  labels: {
    nodes: LinearLabel[];
  };
}

interface LinearLabel {
  id: string;
  name: string;
  color: string;
}

interface ProjectWithTask {
  linearProject: LinearProject;
  togglProject: TogglProject;
  developmentTask: TogglTask | null;
}

interface LinearProjectsResponse {
  data: {
    team: {
      id: string;
      projects: {
        nodes: LinearProject[];
      };
    };
  };
  errors?: unknown[];
}

interface LinearIssuesResponse {
  data: {
    team: {
      issues: {
        nodes: LinearIssue[];
        pageInfo: {
          hasNextPage: boolean;
          endCursor: string | null;
        };
      };
    };
  };
  errors?: unknown[];
}

interface SyncResult {
  success: boolean;
  data: ProjectWithTask[];
  developmentTaskIds: number[];
  timeEntries: TogglTimeEntry[];
  linearIssues: LinearIssue[];
  labels: LinearLabel[];
  summary: {
    totalLinearProjects: number;
    matchedProjects: number;
    projectsWithDevelopmentTask: number;
    totalTimeEntries: number;
    totalDuration: number; // in seconds
    totalIssues: number;
    totalLabels: number;
  };
}

export async function GET() {
  try {
    // Step 1: Fetch Linear issues with labels
    const { teamId } = await fetchLinearProjects();
    const linearIssues = await fetchLinearIssues(teamId);

    // Step 2: Extract unique labels from all issues
    const labelsMap = new Map<string, LinearLabel>();
    for (const issue of linearIssues) {
      for (const label of issue.labels.nodes) {
        if (!labelsMap.has(label.id)) {
          labelsMap.set(label.id, label);
        }
      }
    }
    const uniqueLabels = Array.from(labelsMap.values());

    // Step 3: Fetch time entries by developer user IDs
    let timeEntries: TogglTimeEntry[] = [];
    try {
      timeEntries = await fetchTogglTimeEntriesByDevelopers();
    } catch (error) {
      console.error("Error fetching time entries:", error);
      // Continue without time entries
    }

    // Calculate total duration
    const totalDuration = timeEntries.reduce(
      (sum, entry) => sum + entry.duration,
      0
    );

    const response: SyncResult = {
      success: true,
      data: [], // No longer needed, keeping for backward compatibility
      developmentTaskIds: [], // No longer needed, keeping for backward compatibility
      timeEntries,
      linearIssues,
      labels: uniqueLabels,
      summary: {
        totalLinearProjects: 0, // No longer fetching projects
        matchedProjects: 0, // No longer matching projects
        projectsWithDevelopmentTask: 0, // No longer looking for development tasks
        totalTimeEntries: timeEntries.length,
        totalDuration,
        totalIssues: linearIssues.length,
        totalLabels: uniqueLabels.length,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error syncing projects:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// Fetch projects from Linear
async function fetchLinearProjects(): Promise<{
  projects: LinearProject[];
  teamId: string;
}> {
  try {
    const apiKey = process.env.LINEAR_API_KEY;

    if (!apiKey) {
      throw new Error("LINEAR_API_KEY environment variable is not set");
    }

    const response = await fetch("https://api.linear.app/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${apiKey}`,
      },
      body: JSON.stringify({
        query: `
          query {
            team(id: "BLE") {
              id
              projects {
                nodes {
                  id
                  name
                  description
                  state
                  startDate
                  targetDate
                }
              }
            }
          }
        `,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Linear API error (${response.status}): ${errorText}`);
    }

    const data = await response.json() as LinearProjectsResponse;

    if (data.errors) {
      throw new Error(`Linear GraphQL errors: ${JSON.stringify(data.errors)}`);
    }

    return {
      projects: data.data.team.projects.nodes,
      teamId: data.data.team.id,
    };
  } catch (error) {
    console.error("Linear API Error:", error);
    throw error;
  }
}

// Fetch time entries by developer user IDs from Toggl Reports API
async function fetchTogglTimeEntriesByDevelopers(): Promise<TogglTimeEntry[]> {
  try {
    const workspaceId = "2404074";
    const apiToken = process.env.TOGGL_API_TOKEN;

    if (!apiToken) {
      throw new Error("TOGGL_API_TOKEN environment variable is not set");
    }

    // Get active developer IDs from database
    const developers = await prisma.togglDeveloper.findMany({
      where: { isActive: true },
      select: { togglId: true },
    });

    if (developers.length === 0) {
      console.warn("No active Toggl developers found in database");
      return [];
    }

    const userIds = developers.map((d) => d.togglId);

    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split('T')[0];
    console.warn("Fetching Toggl time entries from", startDate, "to", endDate);


    console.warn(
      "Fetching Toggl time entries for user IDs:",
      userIds,
      "from",
      startDate,
      "to",
      endDate
    );

    let allData: TogglReportEntry[] = [];
    let firstRowNumber = 1;
    let hasMoreData = true;
    const pageSize = 1000;

    while (hasMoreData) {
      const response = await fetch(
        `https://api.track.toggl.com/reports/api/v3/workspace/${workspaceId}/search/time_entries`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${Buffer.from(
              `${apiToken}:api_token`
            ).toString("base64")}`,
          },
          body: JSON.stringify({
            user_ids: userIds,
            start_date: startDate,
            end_date: endDate,
            first_row_number: firstRowNumber,
            page_size: pageSize,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Toggl Reports API error (${response.status}): ${errorText}`
        );
      }

      const data = await response.json() as TogglReportEntry[];

      if (data && data.length > 0) {
        allData = [...allData, ...data];

        // Check if we got a full page - if not, we're done
        if (data.length < pageSize) {
          hasMoreData = false;
        } else {
          firstRowNumber += pageSize;
        }
      } else {
        hasMoreData = false;
      }

      console.warn("Fetched Toggl data length:", data.length);
    }

    // Flatten the nested time entries
    const flattenedData = allData.flatMap((entry) =>
      entry.time_entries
        ? entry.time_entries.map((timeEntry) => ({
            id: timeEntry.id,
            start: timeEntry.start,
            stop: timeEntry.stop,
            duration: timeEntry.seconds,
            description: entry.description,
            task_id: entry.task_id,
            project_id: entry.project_id,
            user_id: entry.user_id,
          }))
        : []
    );

    return flattenedData;
  } catch (error) {
    console.error("Toggl Reports API Error:", error);
    throw error;
  }
}

// Fetch issues from Linear
async function fetchLinearIssues(teamId: string): Promise<LinearIssue[]> {
  try {
    const apiKey = process.env.LINEAR_API_KEY;
    if (!apiKey) {
      throw new Error("LINEAR_API_KEY environment variable is not set");
    }

    let allIssues: LinearIssue[] = [];
    let hasNextPage = true;
    let endCursor: string | null = null;

    // Get the start of 2025 in ISO format
    const startOfYear = "2025-01-01T00:00:00Z";

    while (hasNextPage) {
      const response = await fetch("https://api.linear.app/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${apiKey}`,
        },
        body: JSON.stringify({
          query: `
            query($after: String, $startOfYear: DateTimeOrDuration!) {
              team(id: "${teamId}") {
                issues(first: 100, after: $after, filter: { createdAt: { gte: $startOfYear }, state: { name: { eq: "Done"} } }) {
                  nodes {
                    id
                    number
                    identifier
                    title
                    description
                    createdAt
                    startedAt
                    completedAt
                    estimate
                    project {
                      name
                    }
                    assignee {
                      id
                      name
                      displayName
                    }
                    delegate {
                      id
                      name
                    }
                    labels {
                      nodes {
                        id
                        name
                        color
                      }
                    }
                  }
                  pageInfo {
                    hasNextPage
                    endCursor
                  }
                }
              }
            }
          `,
          variables: { after: endCursor, startOfYear },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Linear API error (${response.status}): ${errorText}`);
      }

      const data = await response.json() as LinearIssuesResponse;

      if (data.errors) {
        throw new Error(`Linear GraphQL errors: ${JSON.stringify(data.errors)}`);
      }

      const issues = data.data.team.issues.nodes;
      allIssues = [...allIssues, ...issues];

      const pageInfo = data.data.team.issues.pageInfo;
      hasNextPage = pageInfo.hasNextPage;
      endCursor = pageInfo.endCursor;
    }

    return allIssues;
  } catch (error) {
    console.error("Linear API Error:", error);
    throw error;
  }
}
