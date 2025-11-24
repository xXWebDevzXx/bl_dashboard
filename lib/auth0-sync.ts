import { PrismaClient } from "@/app/generated/prisma/client";

const prisma = new PrismaClient();

interface Auth0User {
  sub: string;
  email?: string;
  name?: string;
  nickname?: string;
  [key: string]: any;
}

/**
 * Syncs Auth0 user to Prisma database
 * Creates new user if doesn't exist, updates if exists
 * Validates email domain restriction
 */
export async function syncUserToDatabase(auth0User: Auth0User) {
  try {
    const { sub: auth0Id, email, name, nickname } = auth0User;

    if (!email) {
      throw new Error("User email is required");
    }

    // Validate email domain
    if (!email.endsWith("@obsidianagency.com")) {
      throw new Error("Invalid email domain. Only @obsidianagency.com emails are allowed.");
    }

    // Check if user exists by auth0Id
    let user = await prisma.user.findUnique({
      where: { auth0Id },
    });

    if (user) {
      // Update existing user
      user = await prisma.user.update({
        where: { auth0Id },
        data: {
          email,
          username: nickname || name || email.split("@")[0],
          updatedAt: Math.floor(Date.now() / 1000),
        },
      });
      console.log(`Updated user in database: ${email}`);
    } else {
      // Check if user exists by email (legacy user)
      const existingUserByEmail = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUserByEmail) {
        // Link Auth0 account to existing user
        user = await prisma.user.update({
          where: { email },
          data: {
            auth0Id,
            username: nickname || name || existingUserByEmail.username,
            updatedAt: Math.floor(Date.now() / 1000),
          },
        });
        console.log(`Linked Auth0 account to existing user: ${email}`);
      } else {
        // Create new user
        user = await prisma.user.create({
          data: {
            auth0Id,
            email,
            username: nickname || name || email.split("@")[0],
            role: "user",
            createdAt: Math.floor(Date.now() / 1000),
            updatedAt: Math.floor(Date.now() / 1000),
          },
        });
        console.log(`Created new user in database: ${email}`);
      }
    }

    return user;
  } catch (error) {
    console.error("Error syncing user to database:", error);
    throw error;
  }
}

/**
 * Gets user from database by Auth0 ID
 */
export async function getUserByAuth0Id(auth0Id: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { auth0Id },
      include: {
        reports: true,
      },
    });
    return user;
  } catch (error) {
    console.error("Error fetching user by Auth0 ID:", error);
    return null;
  }
}

