import { NextResponse } from 'next/server';

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
  summary: {
    totalLinearProjects: number;
    matchedProjects: number;
    projectsWithDevelopmentTask: number;
    totalTimeEntries: number;
    totalDuration: number; // in seconds
  };
}

export async function GET() {
  try {
    // Step 1: Fetch projects from Linear
    console.log('Step 1: Fetching Linear projects...');
    const linearProjects = await fetchLinearProjects();
    console.log(`✓ Found ${linearProjects.length} Linear projects`);

    
    
    // Step 2: Fetch all Toggl projects
    console.log('Step 2: Fetching Toggl projects...');
    const togglProjects = await fetchTogglProjects();
    console.log(`✓ Found ${togglProjects.length} Toggl projects`);

    
    
    // Step 3: Match Linear projects with Toggl projects and find development tasks
    console.log('Step 3: Matching projects and finding development tasks...');
    const results: ProjectWithTask[] = [];
    const developmentTaskIds: number[] = [];

    console.dir(linearProjects, { depth: null, maxArrayLength: null });
    console.dir(togglProjects, { depth: null, maxArrayLength: null });
    
    for (const linearProject of linearProjects) {
      // Find matching Toggl project by name
      const togglProject = togglProjects.find(
        (tp) => {
          return tp.name.toLowerCase().includes(linearProject.name.toLowerCase())
        }
      );

      console.log("Toggl project: ", togglProject?.name);
      
      if (togglProject) {
        try {
          // Fetch tasks for this Toggl project

          console.log(togglProject.id);
          const tasks = await fetchTogglProjectTasks(togglProject.id);
          
          console.log("Tasks: ", tasks);
          // Find the development task
          const developmentTask = tasks.find(
            (task) => task.name.toLowerCase() === 'development'
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
          console.error(`Error fetching tasks for project ${togglProject.name}:`, error);
          // Continue with other projects
        }
      }
    }
    
    console.log(`✓ Matched ${results.length} projects, found ${developmentTaskIds.length} development tasks`);
    
    // Step 4: Fetch time entries for all development tasks
    let timeEntries: TogglTimeEntry[] = [];
    if (developmentTaskIds.length > 0) {
      console.log('Step 4: Fetching time entries...');
      try {
        timeEntries = await fetchTogglTimeEntries(developmentTaskIds);
        console.log(`✓ Found ${timeEntries.length} time entries`);
      } catch (error) {
        console.error('Error fetching time entries:', error);
        // Continue without time entries
      }
    }

    // Calculate total duration
    const totalDuration = timeEntries.reduce((sum, entry) => sum + entry.duration, 0);
    
    const response: SyncResult = {
      success: true,
      data: results,
      developmentTaskIds,
      timeEntries,
      summary: {
        totalLinearProjects: linearProjects.length,
        matchedProjects: results.length,
        projectsWithDevelopmentTask: developmentTaskIds.length,
        totalTimeEntries: timeEntries.length,
        totalDuration,
      }
    };
    
    console.log('✓ Sync completed successfully');
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error syncing projects:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// Fetch projects from Linear
async function fetchLinearProjects(): Promise<LinearProject[]> {
  try {
    const apiKey = process.env.LINEAR_API_KEY;
    
    if (!apiKey) {
      throw new Error('LINEAR_API_KEY environment variable is not set');
    }

    const response = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${apiKey}`,
      },
      body: JSON.stringify({
        query: `
          query {
            team(id: "BLE") {
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

    return data.data.team.projects.nodes;
  } catch (error) {
    console.error('Linear API Error:', error);
    throw error;
  }
}

async function fetchTogglProjects(): Promise<TogglProject[]> {
  try {
    const workspaceId = '2404074';
    const apiToken = process.env.TOGGL_API_TOKEN;
    
    if (!apiToken) {
      throw new Error('TOGGL_API_TOKEN environment variable is not set');
    }

    const authString = `${apiToken}:api_token`;
    const base64Auth = Buffer.from(authString).toString('base64');

    let allProjects: TogglProject[] = [];
    let page = 1;
    const perPage = 200; // Max per page
    let hasMore = true;

    while (hasMore) {
      const url = `https://api.track.toggl.com/api/v9/workspaces/${workspaceId}/projects?page=${page}&per_page=${perPage}`;
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${base64Auth}`,
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
        console.log(`  Fetched page ${page}: ${projects.length} projects (total: ${allProjects.length})`);
        
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
    console.error('Toggl API Error:', error);
    throw error;
  }
}

// Fetch tasks for a specific Toggl project
async function fetchTogglProjectTasks(projectId: number): Promise<TogglTask[]> {
  const workspaceId = '2404074';
  const response = await fetch(
    `https://api.track.toggl.com/api/v9/workspaces/${workspaceId}/projects/${projectId}/tasks`,
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${process.env.TOGGL_API_TOKEN}:api_token`).toString('base64')}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Toggl Tasks API error: ${response.statusText}`);
  }

  return await response.json();
}

// Fetch time entries for development tasks from Toggl Reports API
async function fetchTogglTimeEntries(taskIds: number[]): Promise<TogglTimeEntry[]> {
  try {
    const workspaceId = '2404074';
    const apiToken = process.env.TOGGL_API_TOKEN;
    
    if (!apiToken) {
      throw new Error('TOGGL_API_TOKEN environment variable is not set');
    }
    
    // Get current year date range (you can modify these as needed)
    const startDate = '2025-01-01';
    const endDate = '2025-12-31';
    
    const response = await fetch(
      `https://api.track.toggl.com/reports/api/v3/workspace/${workspaceId}/search/time_entries`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${apiToken}:api_token`).toString('base64')}`,
        },
        body: JSON.stringify({
          task_ids: taskIds,
          start_date: startDate,
          end_date: endDate,
          page_size: 1000,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Toggl Reports API error (${response.status}): ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Toggl Reports API Error:', error);
    throw error;
  }
}