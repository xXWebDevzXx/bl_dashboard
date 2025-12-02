<<<<<<< HEAD
import 'dotenv/config';
import { PrismaClient } from "../app/generated/prisma/client";
=======
import { PrismaClient } from "../app/generated/prisma/client";
import { config } from "dotenv";

// Load environment variables from .env and .env.local files
config({ path: ".env" });
config({ path: ".env.local", override: true });
>>>>>>> b771a4d (Toggl time with linear task)

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

<<<<<<< HEAD
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

=======
>>>>>>> b771a4d (Toggl time with linear task)
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
<<<<<<< HEAD
  issues: {
    nodes: LinearIssue[];
  };
=======
>>>>>>> b771a4d (Toggl time with linear task)
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

<<<<<<< HEAD
=======
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

>>>>>>> b771a4d (Toggl time with linear task)
interface SyncResponse {
  success: boolean;
  data: Array<{
    linearProject: LinearProject;
    togglProject: TogglProject;
    developmentTask: TogglTask;
  }>;
  developmentTaskIds: number[];
  timeEntries: TogglTimeEntry[];
<<<<<<< HEAD
=======
  linearIssues: LinearIssue[];
  labels: LinearLabel[];
>>>>>>> b771a4d (Toggl time with linear task)
  summary: {
    totalLinearProjects: number;
    matchedProjects: number;
    projectsWithDevelopmentTask: number;
    totalTimeEntries: number;
    totalDuration: number;
<<<<<<< HEAD
=======
    totalIssues: number;
    totalLabels: number;
>>>>>>> b771a4d (Toggl time with linear task)
  };
}

async function main() {
  console.log('Starting seed...');

<<<<<<< HEAD
  // Call the sync API route handler directly to avoid HTTP timeout issues
  console.log('Syncing data from Linear and Toggl (this may take several minutes)...');

  const { GET } = await import('../app/api/sync-projects/route');
  const response = await GET();
=======
  // Fetch data from the sync API
  console.log('Fetching data from sync API...');
  const response = await fetch('http://localhost:3000/api/sync-projects');

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

>>>>>>> b771a4d (Toggl time with linear task)
  const syncData: SyncResponse = await response.json();

  if (!syncData.success) {
    throw new Error('Sync API returned unsuccessful response');
  }

<<<<<<< HEAD
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
=======
  console.log(`Found ${syncData.linearIssues.length} Linear issues`);
  console.log(`Found ${syncData.labels.length} unique labels`);
  console.log(`Found ${syncData.timeEntries.length} time entries`);

  // Step 1: Seed all unique labels
  console.log('\n=== Step 1: Seeding Labels ===');
  const labelMap = new Map<string, string>(); // Map linear label ID to prisma ID

  for (const label of syncData.labels) {
    const prismaLabel = await prisma.linearLabel.upsert({
      where: { name: label.name },
      update: {
        updatedAt: Math.floor(Date.now() / 1000),
      },
      create: {
        name: label.name,
        createdAt: Math.floor(Date.now() / 1000),
        updatedAt: Math.floor(Date.now() / 1000),
      },
    });
    labelMap.set(label.id, prismaLabel.id);
    console.log(`✓ Upserted label: ${label.name}`);
  }

  // Step 2: Seed Linear issues as LinearTask
  console.log('\n=== Step 2: Seeding Linear Issues ===');
  for (const issue of syncData.linearIssues) {
    // Truncate title if it's too long (max 255 characters)
    const taskName = issue.title.length > 255
      ? issue.title.substring(0, 252) + '...'
      : issue.title;

    // Create or update the LinearTask using identifier as taskId
    const linearTask = await prisma.linearTask.upsert({
      where: { taskId: issue.identifier },
      update: {
        name: taskName,
        estimatedTime: issue.estimate || 0,
        delegateId: issue.delegate?.id || null,
        delegateName: issue.delegate?.name || null,
        updatedAt: Math.floor(Date.now() / 1000),
      },
      create: {
        taskId: issue.identifier,
        name: taskName,
        estimatedTime: issue.estimate || 0,
        delegateId: issue.delegate?.id || null,
        delegateName: issue.delegate?.name || null,
>>>>>>> b771a4d (Toggl time with linear task)
        createdAt: Math.floor(Date.now() / 1000),
        updatedAt: Math.floor(Date.now() / 1000),
      },
    });

<<<<<<< HEAD
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
=======
    console.log(`✓ Upserted LinearTask: ${issue.identifier} - ${issue.title}`);

    // Step 3: Connect labels to this task
    // First, remove existing label connections for this task
    await prisma.linearTaskLabel.deleteMany({
      where: { linearTaskId: linearTask.id },
    });

    // Then create new connections
    for (const label of issue.labels.nodes) {
      const prismaLabelId = labelMap.get(label.id);
      if (prismaLabelId) {
        await prisma.linearTaskLabel.create({
          data: {
            linearTaskId: linearTask.id,
            linearLabelId: prismaLabelId,
          },
        });
      }
    }

    if (issue.labels.nodes.length > 0) {
      console.log(`  ✓ Connected ${issue.labels.nodes.length} labels`);
    }
  }

  // Step 4: Connect Toggl time entries to Linear tasks
  console.log('\n=== Step 3: Connecting Toggl Time Entries ===');

  // Create a map of Linear identifiers
  const issueIdentifierMap = new Map<string, string>();
  for (const issue of syncData.linearIssues) {
    issueIdentifierMap.set(issue.identifier, issue.identifier);
  }

  // Regex to extract Linear issue identifier from description (e.g., BLE-123)
  const linearIdRegex = /([A-Z]+-\d+)/;

  // Create a TogglTime entry for EACH time entry
  let createdCount = 0;
  let skippedCount = 0;
  let notFoundCount = 0;

  for (const entry of syncData.timeEntries) {
    // Skip entries with invalid durations
    if (!entry.duration || isNaN(entry.duration) || entry.duration < 0) {
      skippedCount++;
      continue;
    }

    // Extract Linear issue identifier from description
    const match = entry.description.match(linearIdRegex);
    if (!match) {
      skippedCount++;
      continue;
    }

    const identifier = match[1];
    const linearTaskId = issueIdentifierMap.get(identifier);

    if (!linearTaskId) {
      notFoundCount++;
      continue;
    }

    // Check if this time entry already exists
    const existing = await prisma.togglTime.findUnique({
      where: { togglEntryId: entry.id },
    });

    if (!existing) {
      // Create a new TogglTime entry for this specific time entry
      await prisma.togglTime.create({
        data: {
          togglEntryId: entry.id,
          linearTasksId: linearTaskId,
          duration: entry.duration,
          start: entry.start,
          stop: entry.stop,
          description: entry.description,
          createdAt: Math.floor(Date.now() / 1000),
          updatedAt: Math.floor(Date.now() / 1000),
        },
      });
      createdCount++;

      if (createdCount % 100 === 0) {
        console.log(`  Created ${createdCount} time entries...`);
      }
    }
  }

  console.log(`\n✓ Created ${createdCount} new time entries`);
  console.log(`⚠ Skipped ${skippedCount} entries (no duration or no Linear ID)`);
  console.log(`⚠ ${notFoundCount} entries couldn't be linked (Linear task not found)`);

  console.log('\n=== Seed Summary ===');
  console.log(`Linear Issues: ${syncData.linearIssues.length}`);
  console.log(`Labels: ${syncData.labels.length}`);
  console.log(`Total Time Entries from Toggl: ${syncData.timeEntries.length}`);
  console.log(`Time Entries Created in DB: ${createdCount}`);
>>>>>>> b771a4d (Toggl time with linear task)
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });