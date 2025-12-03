import { Auth0Client } from "@auth0/nextjs-auth0/server";

// Export Auth0 client with custom routes under /api/auth
export const auth0 = new Auth0Client({
  // Auth0 configuration - SDK reads from these env vars by default:
  // AUTH0_SECRET, AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, APP_BASE_URL

  // Explicitly set the configuration (Auth0Client uses these exact property names)
  appBaseUrl:
    process.env.APP_BASE_URL ||
    process.env.AUTH0_BASE_URL ||
    "http://localhost:3000",
  domain: process.env.AUTH0_DOMAIN!,
  clientId: process.env.AUTH0_CLIENT_ID!,
  clientSecret: process.env.AUTH0_CLIENT_SECRET!,
  secret: process.env.AUTH0_SECRET!,

  // Custom route configuration - specify /api/auth prefix
  routes: {
    login: "/api/auth/login",
    callback: "/api/auth/callback",
    logout: "/api/auth/logout",
  },

  // Session configuration - helps with cookie/state issues
  session: {
    rolling: true,
    inactivityDuration: 24 * 60 * 60, // 24 hours of inactivity before session expires
    absoluteDuration: 7 * 24 * 60 * 60, // 7 days absolute session duration
    cookie: {
      sameSite: "lax", // Helps with cross-site cookie issues
      domain: undefined, // Don't set a specific domain for localhost
    },
  },

  // Transaction cookie configuration - critical for OAuth state parameter
  transactionCookie: {
    sameSite: "lax",
    secure: false, // Set to false for localhost/development
    domain: undefined, // Don't set a specific domain for localhost
  },

  // Authorization parameters
  authorizationParameters: {
    scope: "openid profile email offline_access",
  },
});
