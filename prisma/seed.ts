import { prisma } from "@/lib/prisma/client";
import { seedDatabase, type SyncResponse } from "@/lib/seed-db";
import * as bcrypt from "bcryptjs";
import { config } from "dotenv";

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

const ADMIN_EMAILS = ["admin@obsidianagency.com"];
const ADMIN_DEFAULT_PASSWORD = "Admin123!";

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
          Authorization: `Basic ${Buffer.from(`${apiToken}:api_token`).toString(
            "base64"
          )}`,
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
    console.warn(
      "Error fetching Toggl users, will use placeholder values:",
      error
    );
    return [];
  }
}

// Extract name from email (e.g., "yb@blacklemon.dk" -> "yb")
function extractNameFromEmail(email: string): string {
  const localPart = email.split("@")[0];
  // Capitalize first letter
  return localPart.charAt(0).toUpperCase() + localPart.slice(1);
}

// Create user in Auth0
async function createAuth0User(
  email: string,
  password: string
): Promise<{ user_id: string } | null> {
  const domain = process.env.AUTH0_DOMAIN;
  const clientId = process.env.AUTH0_CLIENT_ID;
  const clientSecret = process.env.AUTH0_CLIENT_SECRET;

  if (!domain || !clientId || !clientSecret) {
    console.warn(
      "  ⚠ Auth0 configuration missing, skipping Auth0 user creation"
    );
    return null;
  }

  try {
    // Get Management API token
    const tokenResponse = await fetch(`https://${domain}/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        audience: `https://${domain}/api/v2/`,
        grant_type: "client_credentials",
        scope: "create:users read:users update:users",
      }),
    });

    if (!tokenResponse.ok) {
      console.warn("  ⚠ Failed to get Auth0 Management API token");
      return null;
    }

    const { access_token } = await tokenResponse.json();

    // Check if user already exists in Auth0
    const searchResponse = await fetch(
      `https://${domain}/api/v2/users-by-email?email=${encodeURIComponent(
        email
      )}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (searchResponse.ok) {
      const existingUsers = await searchResponse.json();
      if (existingUsers.length > 0) {
        const existingUser = existingUsers[0];

        // Update email_verified if not already verified
        if (!existingUser.email_verified) {
          const updateResponse = await fetch(
            `https://${domain}/api/v2/users/${encodeURIComponent(
              existingUser.user_id
            )}`,
            {
              method: "PATCH",
              headers: {
                Authorization: `Bearer ${access_token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ email_verified: true }),
            }
          );

          if (updateResponse.ok) {
            console.warn(`  ✓ Verified Auth0 user email: ${email}`);
          } else {
            console.warn(`  ⚠ Failed to verify Auth0 user email: ${email}`);
          }
        }

        console.warn(`  ⏭ Auth0 user already exists: ${email}`);
        return { user_id: existingUser.user_id };
      }
    }

    // Create user in Auth0
    const createResponse = await fetch(`https://${domain}/api/v2/users`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        connection: "Username-Password-Authentication",
        email_verified: true,
      }),
    });

    if (!createResponse.ok) {
      const error = await createResponse.text();
      console.warn(`  ⚠ Failed to create Auth0 user: ${error}`);
      return null;
    }

    const auth0User = await createResponse.json();
    console.warn(`  ✓ Created Auth0 user: ${email}`);
    return { user_id: auth0User.user_id };
  } catch (error) {
    console.warn(`  ⚠ Error creating Auth0 user: ${error}`);
    return null;
  }
}

// Seed admin users
async function seedAdminUsers() {
  console.log("\n=== Seeding Admin Users ===");

  let createdCount = 0;
  let skippedCount = 0;

  for (const email of ADMIN_EMAILS) {
    // Always sync with Auth0 first (create or verify email)
    const auth0User = await createAuth0User(email, ADMIN_DEFAULT_PASSWORD);

    // Check if admin user already exists in database
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      // Update auth0Id if missing
      if (!existing.auth0Id && auth0User?.user_id) {
        await prisma.user.update({
          where: { email },
          data: { auth0Id: auth0User.user_id },
        });
        console.warn(`  ✓ Linked Auth0 ID for existing user: ${email}`);
      }
      skippedCount++;
      console.warn(`  ⏭ Skipped ${email} (already exists in database)`);
      continue;
    }

    const now = Math.floor(Date.now() / 1000);
    const username = email.split("@")[0].slice(0, 20); // Extract username from email, max 20 chars
    const hashedPassword = await bcrypt.hash(ADMIN_DEFAULT_PASSWORD, 10);

    try {
      await prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          auth0Id: auth0User?.user_id,
          role: "admin",
          isVerified: true,
          verifiedAt: now,
          createdAt: now,
          updatedAt: now,
        },
      });
      createdCount++;
      console.warn(
        `  ✓ Created admin user: ${email} (password: ${ADMIN_DEFAULT_PASSWORD})`
      );
    } catch (error) {
      console.warn(`  ✗ Failed to create admin ${email}: ${error}`);
    }
  }

  console.warn(`\n✓ Created ${createdCount} admin users`);
  console.warn(`⚠ Skipped ${skippedCount} admin users (already exist)`);
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
        console.warn(
          `  ✓ Created ${email} (from Toggl: ${togglUser.fullname})`
        );
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
        console.warn(
          `  ✓ Created ${email} (placeholder - update togglId later)`
        );
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

  // Seed admin users first
  await seedAdminUsers();

  // Seed Toggl developers
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
