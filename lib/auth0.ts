import { Auth0Client } from "@auth0/nextjs-auth0/server";

// Determine if we're in production (HTTPS)
// Check for Vercel deployment or explicit production URL
const isProduction: boolean =
  process.env.NODE_ENV === "production" ||
  Boolean(process.env.APP_BASE_URL?.startsWith("https://")) ||
  Boolean(process.env.VERCEL); // Vercel sets this automatically

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
      sameSite: isProduction ? "none" : "lax", // "none" for serverless environments in production
      secure: isProduction, // Secure cookies in production (HTTPS required)
      domain: undefined, // Don't set a specific domain
      path: "/", // Ensure cookie is available for all paths
    },
  },

  // Transaction cookie configuration - critical for OAuth state parameter
  // This cookie stores the state parameter during OAuth flow
  // In Vercel/serverless, we need to ensure cookies are properly set and accessible
  transactionCookie: {
    sameSite: isProduction ? "none" : "lax", // "none" required for cross-site in production
    secure: isProduction, // Must be true in production (HTTPS required)
    domain: undefined, // Don't set a specific domain (let browser handle it)
    path: "/", // Ensure cookie is available for all paths
  },

  // Authorization parameters
  authorizationParameters: {
    scope: "openid profile email offline_access",
  },
});
