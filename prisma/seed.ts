import { PrismaClient } from "../app/generated/prisma/client";

const prisma = new PrismaClient();

interface TogglTimeEntry {
  id: number;
  start: string;
  stop: string;
  duration: number;
  description: string;
  task_id: number;
  project_id: number;
  user_id: number;
}

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
}

interface TogglTask {
  id: number;
  name: string;
  project_id: number;
}

interface SyncResponse {
  success: boolean;
  data: Array<{
    linearProject: LinearProject;
    togglProject: TogglProject;
    developmentTask: TogglTask;
  }>;
  developmentTaskIds: number[];
  timeEntries: TogglTimeEntry[];
  summary: {
    totalLinearProjects: number;
    matchedProjects: number;
    projectsWithDevelopmentTask: number;
    totalTimeEntries: number;
    totalDuration: number;
  };
}

async function main() {
  console.log('Starting seed...');

  // Fetch data from the sync API
  console.log('Fetching data from sync API...');
  const response = await fetch('http://localhost:3000/api/sync-projects');
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  const syncData: SyncResponse = await response.json();

  if (!syncData.success) {
    throw new Error('Sync API returned unsuccessful response');
  }

  console.log(`Found ${syncData.timeEntries.length} time entries`);

  // Group time entries by Linear project
  const projectMap = new Map<string, { 
    linearProject: LinearProject; 
    timeEntries: TogglTimeEntry[] 
  }>();

  // Build the map
  for (const match of syncData.data) {
    if (match.developmentTask) {
      const entries = syncData.timeEntries.filter(
        entry => entry.task_id === match.developmentTask.id
      );
      
      if (entries.length > 0) {
        projectMap.set(match.linearProject.id, {
          linearProject: match.linearProject,
          timeEntries: entries,
        });
      }
    }
  }

  console.log(`Processing ${projectMap.size} Linear projects with time entries`);

  // Insert data into database
  for (const [linearProjectId, data] of projectMap) {
    const { linearProject, timeEntries } = data;

    // Create or find the Linear task
    const linearTask = await prisma.linearTask.upsert({
      where: { id: linearProjectId },
      update: {
        name: linearProject.name,
        estimatedTime: 0, // You can calculate this from targetDate/startDate if needed
        updatedAt: Math.floor(Date.now() / 1000),
      },
      create: {
        id: linearProjectId,
        name: linearProject.name,
        estimatedTime: 0,
        createdAt: Math.floor(Date.now() / 1000),
        updatedAt: Math.floor(Date.now() / 1000),
      },
    });

    console.log(`✓ Upserted LinearTask: ${linearTask.name}`);

    // Calculate total duration for this project
    const totalDuration = timeEntries.reduce((sum, entry) => sum + entry.duration, 0);

    // Create or update TogglTime entry
    const togglTime = await prisma.togglTime.upsert({
      where: { 
        linearTasksId: linearTask.id 
      },
      update: {
        estimate: totalDuration,
        updatedAt: Math.floor(Date.now() / 1000),
      },
      create: {
        linearTasksId: linearTask.id,
        estimate: totalDuration,
        createdAt: Math.floor(Date.now() / 1000),
        updatedAt: Math.floor(Date.now() / 1000),
      },
    });

    const hours = (totalDuration / 3600).toFixed(2);
    console.log(`✓ Upserted TogglTime: ${hours} hours (${timeEntries.length} entries)`);
  }

  console.log('\n=== Seed Summary ===');
  console.log(`Linear Projects: ${projectMap.size}`);
  console.log(`Total Time Entries: ${syncData.timeEntries.length}`);
  console.log(`Total Duration: ${(syncData.summary.totalDuration / 3600).toFixed(2)} hours`);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });