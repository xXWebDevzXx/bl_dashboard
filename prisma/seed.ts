import { config } from "dotenv";
import { prisma } from "@/lib/prisma/client";
import { seedDatabase, type SyncResponse } from "@/lib/seed-db";

// Load environment variables from .env and .env.local files
// Don't override existing environment variables (Docker sets DATABASE_URL)
config({ path: ".env" });
config({ path: ".env.local" });

async function main() {
  console.log("Starting seed...");

  // Fetch data from the sync API
  console.log("Fetching data from sync API...");
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
