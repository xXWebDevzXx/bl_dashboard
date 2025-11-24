import { auth0 } from './auth0';
import { syncUserToDatabase } from './auth0-sync';

/**
 * Ensures the current authenticated user is synced to the database.
 * Call this from Server Components or API routes (Node.js runtime).
 * 
 * This is a workaround since we can't use Prisma in Edge Middleware
 * where Auth0's callback happens.
 */
export async function ensureUserSynced() {
  try {
    const session = await auth0.getSession();
    
    if (!session?.user) {
      return null;
    }

    // Sync user to database (will create if new, update if exists)
    const user = await syncUserToDatabase(session.user);
    return user;
  } catch (error) {
    console.error('Error ensuring user is synced:', error);
    return null;
  }
}

