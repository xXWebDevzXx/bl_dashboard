import { NextResponse } from "next/server";

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

interface LinearIssue {
  id: string;
  number: number;
  identifier: string;
  title: string;
  description: string | null;
  createdAt: string;
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
    // Step 1: Fetch projects from Linear
    console.log("Step 1: Fetching Linear projects...");
    const { projects: linearProjects, teamId } = await fetchLinearProjects();
    console.log(`✓ Found ${linearProjects.length} Linear projects`);

    // Step 2: Fetch all Toggl projects
    console.log("Step 2: Fetching Toggl projects...");
    const togglProjects = await fetchTogglProjects();
    console.log(`✓ Found ${togglProjects.length} Toggl projects`);

    // Step 3: Match Linear projects with Toggl projects and find development tasks
    console.log("Step 3: Matching projects and finding development tasks...");
    const results: ProjectWithTask[] = [];
    const developmentTaskIds: number[] = [];

    for (const linearProject of linearProjects) {
      // Find matching Toggl project by name
      const togglProject = togglProjects.find((tp) => {
        return tp.name.toLowerCase().includes(linearProject.name.toLowerCase());
      });

      if (togglProject) {
        try {
          // Fetch tasks for this Toggl project
          const tasks = await fetchTogglProjectTasks(togglProject.id);

          // Find the development task
          const developmentTask = tasks.find(
            (task) => task.name.toLowerCase() === "development"
          );

          results.push({
            linearProject,
            togglProject,
            developmentTask: developmentTask || null,
          });

          // Collect development task ID if found
          if (developmentTask) {
            developmentTaskIds.push(developmentTask.id);
          }
        } catch (error) {
          console.error(
            `Error fetching tasks for project ${togglProject.name}:`,
            error
          );
          // Continue with other projects
        }
      }
    }

    console.log(
      `✓ Matched ${results.length} projects, found ${developmentTaskIds.length} development tasks`
    );

    // Step 4: Fetch time entries for all development tasks
    let timeEntries: TogglTimeEntry[] = [];
    if (developmentTaskIds.length > 0) {
      console.log("Step 4: Fetching time entries...");
      try {
        timeEntries = await fetchTogglTimeEntries(developmentTaskIds);
        console.log(`✓ Found ${timeEntries.length} time entries`);
      } catch (error) {
        console.error("Error fetching time entries:", error);
        // Continue without time entries
      }
    }

    // Calculate total duration
    const totalDuration = timeEntries.reduce(
      (sum, entry) => sum + entry.duration,
      0
    );

    // Step 5: Fetch Linear issues with labels
    console.log("Step 5: Fetching Linear issues with labels...");
    const linearIssues = await fetchLinearIssues(teamId);
    console.log(`✓ Found ${linearIssues.length} Linear issues`);

    // Step 6: Extract unique labels from all issues
    console.log("Step 6: Extracting unique labels...");
    const labelsMap = new Map<string, LinearLabel>();
    for (const issue of linearIssues) {
      for (const label of issue.labels.nodes) {
        if (!labelsMap.has(label.id)) {
          labelsMap.set(label.id, label);
        }
      }
    }
    const uniqueLabels = Array.from(labelsMap.values());
    console.log(`✓ Found ${uniqueLabels.length} unique labels`);

    const response: SyncResult = {
      success: true,
      data: results,
      developmentTaskIds,
      timeEntries,
      linearIssues,
      labels: uniqueLabels,
      summary: {
        totalLinearProjects: linearProjects.length,
        matchedProjects: results.length,
        projectsWithDevelopmentTask: developmentTaskIds.length,
        totalTimeEntries: timeEntries.length,
        totalDuration,
        totalIssues: linearIssues.length,
        totalLabels: uniqueLabels.length,
      },
    };

    console.log("✓ Sync completed successfully");
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

    const data = await response.json();

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

async function fetchTogglProjects(): Promise<TogglProject[]> {
  try {
    const workspaceId = "2404074";
    const apiToken = process.env.TOGGL_API_TOKEN;

    if (!apiToken) {
      throw new Error("TOGGL_API_TOKEN environment variable is not set");
    }

    const authString = `${apiToken}:api_token`;
    const base64Auth = Buffer.from(authString).toString("base64");

    let allProjects: TogglProject[] = [];
    let page = 1;
    const perPage = 200; // Max per page
    let hasMore = true;

    while (hasMore) {
      const url = `https://api.track.toggl.com/api/v9/workspaces/${workspaceId}/projects?page=${page}&per_page=${perPage}`;

      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${base64Auth}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Toggl API error (${response.status}): ${errorText}`);
      }

      const projects = await response.json();

      if (projects.length === 0) {
        hasMore = false;
      } else {
        allProjects = [...allProjects, ...projects];
        // If we got fewer than perPage, we're on the last page
        if (projects.length < perPage) {
          hasMore = false;
        } else {
          page++;
        }
      }
    }

    return allProjects;
  } catch (error) {
    console.error("Toggl API Error:", error);
    throw error;
  }
}

// Fetch tasks for a specific Toggl project
async function fetchTogglProjectTasks(projectId: number): Promise<TogglTask[]> {
  const workspaceId = "2404074";
  const response = await fetch(
    `https://api.track.toggl.com/api/v9/workspaces/${workspaceId}/projects/${projectId}/tasks`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(
          `${process.env.TOGGL_API_TOKEN}:api_token`
        ).toString("base64")}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Toggl Tasks API error: ${response.statusText}`);
  }

  return await response.json();
}

// Fetch time entries for development tasks from Toggl Reports API
async function fetchTogglTimeEntries(
  taskIds: number[]
): Promise<TogglTimeEntry[]> {
  try {
    const workspaceId = "2404074";
    const apiToken = process.env.TOGGL_API_TOKEN;

    if (!apiToken) {
      throw new Error("TOGGL_API_TOKEN environment variable is not set");
    }

    // Get current year date range (you can modify these as needed)
    const startDate = "2025-01-01";
    const endDate = "2025-12-31";

    let allData: any[] = [];
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
            task_ids: taskIds,
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

      const data = await response.json();

      if (data && data.length > 0) {
        allData = [...allData, ...data];
        console.log(
          `  Fetched ${data.length} time entry groups (total: ${allData.length})`
        );

        // Check if we got a full page - if not, we're done
        if (data.length < pageSize) {
          hasMoreData = false;
        } else {
          firstRowNumber += pageSize;
        }
      } else {
        hasMoreData = false;
      }
    }

    // Flatten the nested time entries structure
    const flattenedEntries: TogglTimeEntry[] = [];
    for (const entry of allData) {
      if (entry.time_entries && Array.isArray(entry.time_entries)) {
        for (const timeEntry of entry.time_entries) {
          flattenedEntries.push({
            id: timeEntry.id,
            start: timeEntry.start,
            stop: timeEntry.stop,
            duration: timeEntry.seconds, // Map seconds to duration
            description: entry.description,
            task_id: entry.task_id,
            project_id: entry.project_id,
            user_id: entry.user_id,
          });
        }
      }
    }

    return flattenedEntries;
  } catch (error) {
    console.error("Toggl Reports API Error:", error);
    throw error;
  }
}

// Fetch Linear issues with labels
async function fetchLinearIssues(teamId: string): Promise<LinearIssue[]> {
  try {
    const apiKey = process.env.LINEAR_API_KEY;

    if (!apiKey) {
      throw new Error("LINEAR_API_KEY environment variable is not set");
    }

    // Calculate date 6 months ago
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const dateFilter = sixMonthsAgo.toISOString();

    let allIssues: LinearIssue[] = [];
    let hasNextPage = true;
    let endCursor: string | null = null;

    while (hasNextPage) {
      const response = await fetch("https://api.linear.app/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${apiKey}`,
        },
        body: JSON.stringify({
          query: `
            query($after: String) {
              issues(
                first: 100,
                after: $after,
                filter: {
                  updatedAt: { gte: "${dateFilter}" }
                  team: { id: { eq: "${teamId}" } }
                  state: { name: { eq: "Done" } }
                }
              ) {
                nodes {
                  id
                  number
                  identifier
                  title
                  description
                  createdAt
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
          `,
          variables: {
            after: endCursor,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Linear API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();

      if (data.errors) {
        throw new Error(
          `Linear GraphQL errors: ${JSON.stringify(data.errors)}`
        );
      }

      const issues = data.data.issues.nodes;
      allIssues = [...allIssues, ...issues];

      hasNextPage = data.data.issues.pageInfo.hasNextPage;
      endCursor = data.data.issues.pageInfo.endCursor;

      if (hasNextPage) {
        console.log(`  Fetched ${allIssues.length} issues so far...`);
      }
    }

    return allIssues;
  } catch (error) {
    console.error("Linear Issues API Error:", error);
    throw error;
  }
}
