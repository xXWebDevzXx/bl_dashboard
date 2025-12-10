import { Auth0Client } from "@auth0/nextjs-auth0/server";

const isProduction = process.env.NODE_ENV === "production";

// Vercel provides VERCEL_URL for preview deployments
// It doesn't include the protocol, so we need to add it
const getBaseUrl = () => {
  if (process.env.NODE_ENV === "production") {
    return "https://bl-dashboard-three.vercel.app";
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  if (process.env.APP_BASE_URL) {
    return process.env.APP_BASE_URL;
  }
  return "http://localhost:3000";
};

export const auth0 = new Auth0Client({
  appBaseUrl: getBaseUrl(),
  domain: process.env.AUTH0_DOMAIN!,
  clientId: process.env.AUTH0_CLIENT_ID!,
  clientSecret: process.env.AUTH0_CLIENT_SECRET!,
  secret: process.env.AUTH0_SECRET!,

  routes: {
    login: "/api/auth/login",
    callback: "/api/auth/callback",
    logout: "/api/auth/logout",
  },

  session: {
    rolling: true,
    inactivityDuration: 24 * 60 * 60,
    absoluteDuration: 7 * 24 * 60 * 60,
    cookie: {
      sameSite: "lax",
      secure: isProduction,
    },
  },

  transactionCookie: {
    sameSite: "lax",
    secure: isProduction,
  },

  authorizationParameters: {
    scope: "openid profile email offline_access",
  },
});
