import { prisma } from "@/lib/prisma/client";

// Types
export interface TogglTimeEntry {
  id: number;
  start: string;
  stop: string;
  duration: number;
  description: string;
  task_id: number;
  project_id: number;
  user_id: number;
}

export interface LinearProject {
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

export interface TogglProject {
  id: number;
  name: string;
  workspace_id: number;
  active: boolean;
}

export interface TogglTask {
  id: number;
  name: string;
  project_id: number;
}

export interface LinearIssue {
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

export interface LinearLabel {
  id: string;
  name: string;
  color: string;
}

export interface SyncResponse {
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

export interface SeedResult {
  success: boolean;
  labels: {
    total: number;
    created: number;
  };
  issues: {
    total: number;
    created: number;
  };
  timeEntries: {
    total: number;
    created: number;
    skipped: number;
    notFound: number;
  };
  summary: {
    linearIssues: number;
    labels: number;
    timeEntriesFromToggl: number;
    timeEntriesCreated: number;
  };
}

/**
 * Extracts the estimate time from labels.
 * Looks for labels like "Estimate: 1-2", "Estimate: 4-8", etc.
 * Returns the estimate string (e.g., "1-2") or empty string if no estimate label is found.
 */
function extractEstimateFromLabels(labels: LinearLabel[]): string {
  const estimateRegex = /^Estimate:\s*(.+)$/i;

  for (const label of labels) {
    const match = label.name.match(estimateRegex);
    if (match) {
      return match[1].trim();
    }
  }

  return "";
}

/**
 * Seeds the database with data from the sync API response.
 * This function is idempotent - it only creates new records and skips existing ones.
 */
export async function seedDatabase(
  syncData: SyncResponse,
  logProgress = false
): Promise<SeedResult> {
  if (!syncData.success) {
    throw new Error("Sync API returned unsuccessful response");
  }

  if (logProgress) {
    console.warn(`Found ${syncData.linearIssues.length} Linear issues`);
    console.warn(`Found ${syncData.labels.length} unique labels`);
    console.warn(`Found ${syncData.timeEntries.length} time entries`);
  }

  // Step 1: Seed all unique labels (insert only if new)
  if (logProgress) {
    console.warn("\n=== Step 1: Seeding Labels (insert only if new) ===");
  }
  const labelMap = new Map<string, string>(); // Map linear label ID to prisma ID
  let labelsCreated = 0;

  for (const label of syncData.labels) {
    const existingLabel = await prisma.linearLabel.findUnique({
      where: { name: label.name },
    });
    if (!existingLabel) {
      const prismaLabel = await prisma.linearLabel.create({
        data: {
          name: label.name,
          createdAt: Math.floor(Date.now() / 1000),
          updatedAt: Math.floor(Date.now() / 1000),
        },
      });
      labelMap.set(label.id, prismaLabel.id);
      labelsCreated++;
      if (logProgress) {
        console.warn(`✓ Created label: ${label.name}`);
      }
    } else {
      labelMap.set(label.id, existingLabel.id);
    }
  }

  // Step 2: Seed Linear issues as LinearTask (insert only if new)
  if (logProgress) {
    console.warn("\n=== Step 2: Seeding Linear Issues (insert only if new) ===");
  }
  let issuesCreated = 0;

  for (const issue of syncData.linearIssues) {
    // Truncate title if it's too long (max 255 characters)
    const taskName =
      issue.title.length > 255
        ? issue.title.substring(0, 252) + "..."
        : issue.title;

    // Extract estimate from labels
    const estimateValue = extractEstimateFromLabels(issue.labels.nodes);

    // Convert ISO date strings to Unix timestamps
    const startedAtTimestamp = issue.startedAt
      ? Math.floor(new Date(issue.startedAt).getTime() / 1000)
      : null;
    const completedAtTimestamp = issue.completedAt
      ? Math.floor(new Date(issue.completedAt).getTime() / 1000)
      : null;

    // Only create if not exists
    const existingTask = await prisma.linearTask.findUnique({
      where: { taskId: issue.identifier },
    });
    let linearTask;
    if (!existingTask) {
      linearTask = await prisma.linearTask.create({
        data: {
          taskId: issue.identifier,
          name: taskName,
          estimatedTime: estimateValue,
          delegateId: issue.delegate?.id || null,
          delegateName: issue.delegate?.name || null,
          projectName: issue.project?.name || null,
          startedAt: startedAtTimestamp,
          completedAt: completedAtTimestamp,
          createdAt: Math.floor(Date.now() / 1000),
          updatedAt: Math.floor(Date.now() / 1000),
        },
      });
      issuesCreated++;
      if (logProgress) {
        console.warn(`✓ Created LinearTask: ${issue.identifier} - ${issue.title}`);
      }
    } else {
      linearTask = existingTask;
    }

    // Step 3: Connect labels to this task (idempotent)
    // Remove existing label connections for this task only if new labels are present
    if (issue.labels.nodes.length > 0 && !existingTask) {
      for (const label of issue.labels.nodes) {
        const prismaLabelId = labelMap.get(label.id);
        if (prismaLabelId) {
          // Check if the relationship already exists
          const existingRelation = await prisma.linearTaskLabel.findUnique({
            where: {
              linearTaskId_linearLabelId: {
                linearTaskId: linearTask.id,
                linearLabelId: prismaLabelId,
              },
            },
          });

          if (!existingRelation) {
            await prisma.linearTaskLabel.create({
              data: {
                linearTaskId: linearTask.id,
                linearLabelId: prismaLabelId,
              },
            });
          }
        }
      }
      if (logProgress) {
        console.warn(`  ✓ Connected ${issue.labels.nodes.length} labels`);
      }
    }
  }

  // Step 4: Connect Toggl time entries to Linear tasks (idempotent)
  if (logProgress) {
    console.warn("\n=== Step 3: Connecting Toggl Time Entries (idempotent) ===");
  }

  // Create a map of Linear identifiers
  const issueIdentifierMap = new Map<string, string>();
  for (const issue of syncData.linearIssues) {
    issueIdentifierMap.set(issue.identifier, issue.identifier);
  }

  // Regex to extract Linear issue identifier from description (e.g., BLE-123)
  const linearIdRegex = /([A-Z]+-\d+)/;

  // Create a TogglTime entry for EACH time entry, skip if exists
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

      if (logProgress && createdCount % 100 === 0) {
        console.warn(`  Created ${createdCount} time entries...`);
      }
    } else {
      skippedCount++;
    }
  }

  if (logProgress) {
    console.warn(`\n✓ Created ${createdCount} new time entries`);
    console.warn(
      `⚠ Skipped ${skippedCount} entries (already exist, no duration, or no Linear ID)`
    );
    console.warn(
      `⚠ ${notFoundCount} entries couldn't be linked (Linear task not found)`
    );

    console.warn("\n=== Seed Summary ===");
    console.warn(`Linear Issues: ${syncData.linearIssues.length}`);
    console.warn(`Labels: ${syncData.labels.length}`);
    console.warn(`Total Time Entries from Toggl: ${syncData.timeEntries.length}`);
    console.warn(`Time Entries Created in DB: ${createdCount}`);
  }

  return {
    success: true,
    labels: {
      total: syncData.labels.length,
      created: labelsCreated,
    },
    issues: {
      total: syncData.linearIssues.length,
      created: issuesCreated,
    },
    timeEntries: {
      total: syncData.timeEntries.length,
      created: createdCount,
      skipped: skippedCount,
      notFound: notFoundCount,
    },
    summary: {
      linearIssues: syncData.linearIssues.length,
      labels: syncData.labels.length,
      timeEntriesFromToggl: syncData.timeEntries.length,
      timeEntriesCreated: createdCount,
    },
  };
}

