import { PrismaClient } from "@/app/generated/prisma/client";

const prisma = new PrismaClient();

interface Auth0User {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  nickname?: string;
  [key: string]: string | boolean | undefined;
}

/**
 * Syncs Auth0 user to Prisma database
 * Creates new user if doesn't exist, updates if exists
 * Validates email domain restriction
 */
export async function syncUserToDatabase(auth0User: Auth0User) {
  try {
    const { sub: auth0Id, email, email_verified, name, nickname } = auth0User;

    if (!email) {
      throw new Error("User email is required");
    }

    // Validate email domain
    // if (!email.endsWith("@obsidianagency.com")) {
    //   throw new Error("Invalid email domain. Only @obsidianagency.com emails are allowed.");
    // }

    const currentTimestamp = Math.floor(Date.now() / 1000);

    // Check if user exists by auth0Id
    let user = await prisma.user.findUnique({
      where: { auth0Id },
    });

    if (user) {
      // Check if user is soft deleted
      if (user.deletedAt && user.deletedAt > 0) {
        const error = new Error("ACCOUNT_DELETED") as Error & { accountDeleted: boolean };
        error.accountDeleted = true;
        throw error;
      }

      // Prepare update data
      const updateData: {
        email: string;
        username: string;
        updatedAt: number;
        isVerified?: boolean;
        verifiedAt?: number;
        verificationToken?: null;
      } = {
        email,
        username: nickname || name || email.split("@")[0],
        updatedAt: currentTimestamp,
      };

      // If email is verified in Auth0 and not yet marked as verified in DB
      if (email_verified && !user.isVerified) {
        updateData.isVerified = true;
        updateData.verifiedAt = currentTimestamp;
        updateData.verificationToken = null; // Clear verification token
      }

      // Update existing user
      user = await prisma.user.update({
        where: { auth0Id },
        data: updateData,
      });
    } else {
      // Check if user exists by email (legacy user)
      const existingUserByEmail = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUserByEmail) {
        // Check if existing user is soft deleted
        if (existingUserByEmail.deletedAt && existingUserByEmail.deletedAt > 0) {
          const error = new Error("ACCOUNT_DELETED") as Error & { accountDeleted: boolean };
          error.accountDeleted = true;
          throw error;
        }

        // Link Auth0 account to existing user
        const linkData: {
          auth0Id: string;
          username: string;
          updatedAt: number;
          isVerified?: boolean;
          verifiedAt?: number;
          verificationToken?: null;
        } = {
          auth0Id,
          username: nickname || name || existingUserByEmail.username,
          updatedAt: currentTimestamp,
        };

        // Sync verification status if verified in Auth0
        if (email_verified && !existingUserByEmail.isVerified) {
          linkData.isVerified = true;
          linkData.verifiedAt = currentTimestamp;
          linkData.verificationToken = null;
        }

        user = await prisma.user.update({
          where: { email },
          data: linkData,
        });
      } else {
        // Create new user
        user = await prisma.user.create({
          data: {
            auth0Id,
            email,
            username: nickname || name || email.split("@")[0],
            role: "user",
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
            deletedAt: 0,
            // Set verification status based on Auth0
            isVerified: email_verified || false,
            verifiedAt: email_verified ? currentTimestamp : 0,
          },
        });
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
