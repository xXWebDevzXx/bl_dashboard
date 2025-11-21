import { Auth0Client } from '@auth0/nextjs-auth0/server';

// Export Auth0 client with custom routes under /api/auth
export const auth0 = new Auth0Client({
  // Explicitly set the app base URL for proper redirects
  appBaseUrl: process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_APP_BASE_URL || 'http://localhost:3000',
  routes: {
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    callback: '/api/auth/callback',
  },
});

