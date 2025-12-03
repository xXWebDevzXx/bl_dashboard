import { auth0 } from "@/lib/auth0";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("=== /api/auth/me endpoint called ===");
    const session = await auth0.getSession();

    console.log("Session exists?:", !!session);
    console.log("Session user:", session?.user?.email);

    if (!session) {
      console.log("No session found, returning 401");
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    console.log("Returning user data:", session.user.email);
    return NextResponse.json(session.user);
  } catch (error) {
    console.error("Me endpoint error:", error);
    return NextResponse.json({ error: "Failed to get user" }, { status: 500 });
  }
}
