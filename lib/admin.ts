import { auth0 } from "@/lib/auth0";
import { prisma } from "@/lib/prisma/client";

/**
 * Checks if the current user is an admin
 * @returns The user object if admin, null otherwise
 */
export async function getAdminUser() {
  try {
    const session = await auth0.getSession();

    if (!session?.user) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { auth0Id: session.user.sub },
    });

    if (!user || (user.deletedAt && user.deletedAt > 0)) {
      return null;
    }

    // Check if user has admin role
    // Note: Prisma enum values are compared as strings
    if (user.role === "admin") {
      return user;
    }

    return null;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return null;
  }
}

/**
 * Checks if the current user is an admin (throws error if not)
 * @throws Error if user is not admin
 */
export async function requireAdmin() {
  const adminUser = await getAdminUser();

  if (!adminUser) {
    throw new Error("Unauthorized: Admin access required");
  }

  return adminUser;
}
