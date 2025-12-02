import { config } from "dotenv";
import { PrismaClient } from "../app/generated/prisma/client";

// Load environment variables from .env and .env.local files
config({ path: ".env" });
config({ path: ".env.local", override: true });

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

interface SyncResponse {
  success: boolean;
  data: Array<{
    linearProject: LinearProject;
    togglProject: TogglProject;
    developmentTask: TogglTask;
  }>;
  developmentTaskIds: number[];
  timeEntries: TogglTimeEntry[];
  linearIssues: LinearIssue[];
  labels: LinearLabel[];
  summary: {
    totalLinearProjects: number;
    matchedProjects: number;
    projectsWithDevelopmentTask: number;
    totalTimeEntries: number;
    totalDuration: number;
    totalIssues: number;
    totalLabels: number;
  };
}

async function main() {
  console.log("Starting seed...");

  // Fetch data from the sync API
  console.log("Fetching data from sync API...");
  const response = await fetch("http://localhost:3000/api/sync-projects");

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  const syncData: SyncResponse = await response.json();

  if (!syncData.success) {
    throw new Error("Sync API returned unsuccessful response");
  }

  console.log(`Found ${syncData.linearIssues.length} Linear issues`);
  console.log(`Found ${syncData.labels.length} unique labels`);
  console.log(`Found ${syncData.timeEntries.length} time entries`);

  // Step 1: Seed all unique labels
  console.log("\n=== Step 1: Seeding Labels ===");
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
  console.log("\n=== Step 2: Seeding Linear Issues ===");
  for (const issue of syncData.linearIssues) {
    // Truncate title if it's too long (max 255 characters)
    const taskName =
      issue.title.length > 255
        ? issue.title.substring(0, 252) + "..."
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
        createdAt: Math.floor(Date.now() / 1000),
        updatedAt: Math.floor(Date.now() / 1000),
      },
    });

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
  console.log("\n=== Step 3: Connecting Toggl Time Entries ===");

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
  console.log(
    `⚠ Skipped ${skippedCount} entries (no duration or no Linear ID)`
  );
  console.log(
    `⚠ ${notFoundCount} entries couldn't be linked (Linear task not found)`
  );

  console.log("\n=== Seed Summary ===");
  console.log(`Linear Issues: ${syncData.linearIssues.length}`);
  console.log(`Labels: ${syncData.labels.length}`);
  console.log(`Total Time Entries from Toggl: ${syncData.timeEntries.length}`);
  console.log(`Time Entries Created in DB: ${createdCount}`);
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
