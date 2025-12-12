import { prisma } from "@/lib/prisma/client";
import { getAdminUser } from "@/lib/admin";
import { NextResponse, NextRequest } from "next/server";

interface TogglWorkspaceUser {
  id: number;
  email: string;
  fullname: string;
  role: string;
  inactive: boolean;
  is_active: boolean;
}

// Fetch all workspace users from Toggl API
async function fetchTogglWorkspaceUsers(): Promise<TogglWorkspaceUser[]> {
  const workspaceId = "2404074";
  const apiToken = process.env.TOGGL_API_TOKEN;

  if (!apiToken) {
    throw new Error("TOGGL_API_TOKEN environment variable is not set");
  }

  const response = await fetch(
    `https://api.track.toggl.com/api/v9/workspaces/${workspaceId}/users`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${apiToken}:api_token`).toString("base64")}`,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Toggl API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data;
}

// GET - List all toggl developers from database
export async function GET(request: NextRequest) {
  try {
    const adminUser = await getAdminUser();
    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const includeTogglUsers = searchParams.get("includeTogglUsers") === "true";

    // Get developers from database
    const developers = await prisma.togglDeveloper.findMany({
      orderBy: { name: "asc" },
    });

    // Optionally include all Toggl workspace users for selection
    let togglUsers: TogglWorkspaceUser[] = [];
    if (includeTogglUsers) {
      try {
        togglUsers = await fetchTogglWorkspaceUsers();
      } catch (error) {
        console.error("Error fetching Toggl users:", error);
      }
    }

    return NextResponse.json({
      developers,
      togglUsers: includeTogglUsers ? togglUsers : undefined,
    });
  } catch (error) {
    console.error("Error fetching toggl developers:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// POST - Add a new toggl developer by email (looks up from Toggl API)
export async function POST(request: NextRequest) {
  try {
    const adminUser = await getAdminUser();
    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if developer already exists
    const existing = await prisma.togglDeveloper.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Developer with this email already exists" },
        { status: 400 }
      );
    }

    // Fetch all Toggl workspace users and find by email
    const togglUsers = await fetchTogglWorkspaceUsers();
    const togglUser = togglUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (!togglUser) {
      return NextResponse.json(
        { error: "No Toggl user found with this email in the workspace" },
        { status: 404 }
      );
    }

    // Create the developer record
    const now = Math.floor(Date.now() / 1000);
    const developer = await prisma.togglDeveloper.create({
      data: {
        togglId: togglUser.id,
        name: togglUser.fullname,
        email: togglUser.email,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    });

    return NextResponse.json({ developer }, { status: 201 });
  } catch (error) {
    console.error("Error creating toggl developer:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
