import { config } from "dotenv";
import { prisma } from "@/lib/prisma/client";
import { seedDatabase, type SyncResponse } from "@/lib/seed-db";

// Load environment variables from .env and .env.local files
// Don't override existing environment variables (Docker sets DATABASE_URL)
config({ path: ".env" });
config({ path: ".env.local" });

interface TogglWorkspaceUser {
  id: number;
  email: string;
  fullname: string;
  role: string;
  inactive: boolean;
  is_active: boolean;
}

// Developer emails to seed
const DEVELOPER_EMAILS = [
  "yb@blacklemon.dk",
  "sf@blacklemon.dk",
  "rasmus.olsen@obsidianagency.com",
  "co@blacklemon.dk",
  "dl@blacklemon.dk",
  "fj@blacklemon.dk",
  "ik@blacklemon.dk",
  "lju@blacklemon.dk",
  "ms@blacklemon.dk",
  "mm@blacklemon.dk",
  "nb@blacklemon.dk",
  "rbt@blacklemon.dk",
];

// Fetch all workspace users from Toggl API
async function fetchTogglWorkspaceUsers(): Promise<TogglWorkspaceUser[]> {
  const workspaceId = "2404074";
  const apiToken = process.env.TOGGL_API_TOKEN;

  if (!apiToken) {
    return [];
  }

  try {
    const response = await fetch(
      `https://api.track.toggl.com/api/v9/workspaces/${workspaceId}/users`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(`${apiToken}:api_token`).toString("base64")}`,
        },
      }
    );

    if (!response.ok) {
      console.warn("Failed to fetch Toggl users, will use placeholder values");
      return [];
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.warn("Error fetching Toggl users, will use placeholder values:", error);
    return [];
  }
}

// Extract name from email (e.g., "yb@blacklemon.dk" -> "yb")
function extractNameFromEmail(email: string): string {
  const localPart = email.split("@")[0];
  // Capitalize first letter
  return localPart.charAt(0).toUpperCase() + localPart.slice(1);
}

// Seed Toggl developers
async function seedTogglDevelopers() {
  console.log("\n=== Seeding Toggl Developers ===");

  const togglUsers = await fetchTogglWorkspaceUsers();
  const togglUserMap = new Map<string, TogglWorkspaceUser>();
  for (const user of togglUsers) {
    togglUserMap.set(user.email.toLowerCase(), user);
  }

  let createdCount = 0;
  let skippedCount = 0;
  let placeholderTogglId = -1; // Start with -1 for placeholder IDs

  for (const email of DEVELOPER_EMAILS) {
    // Check if developer already exists
    const existing = await prisma.togglDeveloper.findUnique({
      where: { email },
    });

    if (existing) {
      skippedCount++;
      console.warn(`  ⏭ Skipped ${email} (already exists)`);
      continue;
    }

    const now = Math.floor(Date.now() / 1000);
    const togglUser = togglUserMap.get(email.toLowerCase());

    if (togglUser) {
      // Use data from Toggl API
      try {
        await prisma.togglDeveloper.create({
          data: {
            togglId: togglUser.id,
            name: togglUser.fullname,
            email: togglUser.email,
            isActive: true,
            createdAt: now,
            updatedAt: now,
          },
        });
        createdCount++;
        console.warn(`  ✓ Created ${email} (from Toggl: ${togglUser.fullname})`);
      } catch (error) {
        console.warn(`  ✗ Failed to create ${email}: ${error}`);
      }
    } else {
      // Create with placeholder data
      try {
        await prisma.togglDeveloper.create({
          data: {
            togglId: placeholderTogglId,
            name: extractNameFromEmail(email),
            email: email,
            isActive: true,
            createdAt: now,
            updatedAt: now,
          },
        });
        createdCount++;
        placeholderTogglId--; // Decrement for next placeholder
        console.warn(`  ✓ Created ${email} (placeholder - update togglId later)`);
      } catch (error) {
        console.warn(`  ✗ Failed to create ${email}: ${error}`);
      }
    }
  }

  console.warn(`\n✓ Created ${createdCount} developers`);
  console.warn(`⚠ Skipped ${skippedCount} developers (already exist)`);
}

async function main() {
  console.log("Starting seed...");

  // Seed Toggl developers first
  await seedTogglDevelopers();

  // Fetch data from the sync API
  console.log("\nFetching data from sync API...");
  const apiBaseUrl = process.env.APP_BASE_URL || "http://localhost:3000";
  const response = await fetch(`${apiBaseUrl}/api/sync-projects`);

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  const syncData: SyncResponse = await response.json();

  // Use the shared seeding function
  await seedDatabase(syncData, true);
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
