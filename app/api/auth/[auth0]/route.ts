import { auth0 } from "@/lib/auth0";
import { NextRequest } from "next/server";

// This dynamic route handles all Auth0 routes: login, callback, logout, etc.
// Export both GET and POST to handle all Auth0 flows

export async function GET(req: NextRequest) {
  return await auth0.middleware(req);
}

export async function POST(req: NextRequest) {
  return await auth0.middleware(req);
}
