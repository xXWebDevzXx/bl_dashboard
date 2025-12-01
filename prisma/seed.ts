import 'dotenv/config';
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

interface LinearLabel {
  id: string;
  name: string;
}

interface LinearIssue {
  id: string;
  title: string;
  identifier: string;
  state: {
    name: string;
  };
  labels: {
    nodes: LinearLabel[];
  };
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
  issues: {
    nodes: LinearIssue[];
  };
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

  // Call the sync API route handler directly to avoid HTTP timeout issues
  console.log('Syncing data from Linear and Toggl (this may take several minutes)...');

  const { GET } = await import('../app/api/sync-projects/route');
  const response = await GET();
  const syncData: SyncResponse = await response.json();

  if (!syncData.success) {
    throw new Error('Sync API returned unsuccessful response');
  }

  console.log(`Found ${syncData.timeEntries.length} time entry groups`);

  // Flatten the nested time_entries structure from Toggl Reports API v3
  const flattenedEntries: Array<{ task_id: number; seconds: number }> = [];
  for (const group of syncData.timeEntries as any[]) {
    if (group.time_entries && Array.isArray(group.time_entries)) {
      for (const entry of group.time_entries) {
        flattenedEntries.push({
          task_id: group.task_id,
          seconds: entry.seconds || 0,
        });
      }
    }
  }

  console.log(`Flattened to ${flattenedEntries.length} individual time entries`);

  // Build a map of Toggl task IDs to their time entries
  const togglTaskTimeMap = new Map<number, { totalSeconds: number; entryCount: number }>();

  for (const entry of flattenedEntries) {
    const existing = togglTaskTimeMap.get(entry.task_id) || { totalSeconds: 0, entryCount: 0 };
    togglTaskTimeMap.set(entry.task_id, {
      totalSeconds: existing.totalSeconds + entry.seconds,
      entryCount: existing.entryCount + 1,
    });
  }

  // Create a list of Linear issues to process
  interface IssueToProcess {
    issue: LinearIssue;
    projectName: string;
    developmentTaskId: number | null;
  }

  const issuesToProcess: IssueToProcess[] = [];

  for (const match of syncData.data) {
    if (match.linearProject.issues && match.linearProject.issues.nodes.length > 0) {
      for (const issue of match.linearProject.issues.nodes) {
        issuesToProcess.push({
          issue,
          projectName: match.linearProject.name,
          developmentTaskId: match.developmentTask?.id || null,
        });
      }
    }
  }

  console.log(`Processing ${issuesToProcess.length} Linear issues`);

  let processedCount = 0;
  let withTimeCount = 0;

  // Insert data into database - one LinearTask per Linear issue
  for (const item of issuesToProcess) {
    const { issue, projectName, developmentTaskId } = item;

    // Truncate title to fit database column (max 50 chars)
    const truncatedTitle = issue.title.length > 50
      ? issue.title.substring(0, 47) + '...'
      : issue.title;

    // Create or update the Linear task (issue)
    const linearTask = await prisma.linearTask.upsert({
      where: { id: issue.id },
      update: {
        name: truncatedTitle,
        estimatedTime: 0,
        updatedAt: Math.floor(Date.now() / 1000),
      },
      create: {
        id: issue.id,
        name: truncatedTitle,
        estimatedTime: 0,
        createdAt: Math.floor(Date.now() / 1000),
        updatedAt: Math.floor(Date.now() / 1000),
      },
    });

    console.log(`✓ Upserted LinearTask: ${issue.identifier} - ${linearTask.name} (from ${projectName})`);
    processedCount++;

    // Handle labels for this issue
    if (issue.labels && issue.labels.nodes.length > 0) {
      for (const label of issue.labels.nodes) {
        // Truncate label name to fit database column (max 50 chars)
        const truncatedLabelName = label.name.length > 50
          ? label.name.substring(0, 47) + '...'
          : label.name;

        // Create or update the LinearLabel
        await prisma.linearLabel.upsert({
          where: { id: label.id },
          update: {
            name: truncatedLabelName,
            updatedAt: Math.floor(Date.now() / 1000),
          },
          create: {
            id: label.id,
            name: truncatedLabelName,
            createdAt: Math.floor(Date.now() / 1000),
            updatedAt: Math.floor(Date.now() / 1000),
          },
        });

        // Create the LinearTaskLabel relationship (if it doesn't exist)
        const existingRelation = await prisma.linearTaskLabel.findUnique({
          where: {
            linearTaskId_linearLabelId: {
              linearTaskId: linearTask.id,
              linearLabelId: label.id,
            },
          },
        });

        if (!existingRelation) {
          await prisma.linearTaskLabel.create({
            data: {
              linearTaskId: linearTask.id,
              linearLabelId: label.id,
            },
          });
        }
      }
      console.log(`  ✓ Attached ${issue.labels.nodes.length} label(s)`);
    }

    // If this project has a development task with time entries, attach them
    if (developmentTaskId && togglTaskTimeMap.has(developmentTaskId)) {
      const timeData = togglTaskTimeMap.get(developmentTaskId)!;

      // Find existing TogglTime entry or create new one
      const existingTogglTime = await prisma.togglTime.findFirst({
        where: { linearTasksId: linearTask.id }
      });

      if (existingTogglTime) {
        await prisma.togglTime.update({
          where: { id: existingTogglTime.id },
          data: {
            estimate: timeData.totalSeconds,
            updatedAt: Math.floor(Date.now() / 1000),
          },
        });
      } else {
        await prisma.togglTime.create({
          data: {
            linearTasksId: linearTask.id,
            estimate: timeData.totalSeconds,
            createdAt: Math.floor(Date.now() / 1000),
            updatedAt: Math.floor(Date.now() / 1000),
          },
        });
      }

      const hours = (timeData.totalSeconds / 3600).toFixed(2);
      console.log(`  ✓ Attached TogglTime: ${hours} hours (${timeData.entryCount} entries)`);
      withTimeCount++;
    }
  }

  console.log('\n=== Seed Summary ===');
  console.log(`Linear Issues Processed: ${processedCount}`);
  console.log(`Issues with Time Data: ${withTimeCount}`);
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