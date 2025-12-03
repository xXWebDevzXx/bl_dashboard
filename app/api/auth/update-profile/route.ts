import { auth0 } from "@/lib/auth0";
import { prisma } from "@/lib/prisma/client";
import { NextRequest, NextResponse } from "next/server";

// Get Auth0 Management API access token
async function getManagementApiToken(): Promise<string> {
  const domain = process.env.AUTH0_DOMAIN;
  const clientId = process.env.AUTH0_CLIENT_ID;
  const clientSecret = process.env.AUTH0_CLIENT_SECRET;

  if (!domain || !clientId || !clientSecret) {
    throw new Error("Auth0 configuration missing");
  }

  const response = await fetch(`https://${domain}/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      audience: `https://${domain}/api/v2/`,
      grant_type: "client_credentials",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Failed to get Management API token:", error);
    throw new Error("Failed to authenticate with Auth0");
  }

  const data = await response.json();
  return data.access_token;
}

// Update user in Auth0
async function updateAuth0User(
  userId: string,
  name: string,
  accessToken: string
): Promise<void> {
  const domain = process.env.AUTH0_DOMAIN;

  const response = await fetch(`https://${domain}/api/v2/users/${userId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      name,
      nickname: name,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Failed to update Auth0 user:", error);
    throw new Error("Failed to update profile in Auth0");
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth0.getSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { name } = await request.json();

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (name.length > 100) {
      return NextResponse.json(
        { error: "Name must be less than 100 characters" },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();
    const auth0Id = session.user.sub;

    // Update Auth0 user
    try {
      const accessToken = await getManagementApiToken();
      await updateAuth0User(auth0Id, trimmedName, accessToken);
    } catch (auth0Error) {
      console.error("Auth0 update failed:", auth0Error);
      // Continue to update local database even if Auth0 fails
      // The next sync will update Auth0 from the session
    }

    // Update local database
    const currentTimestamp = Math.floor(Date.now() / 1000);

    const updatedUser = await prisma.user.update({
      where: { auth0Id },
      data: {
        username: trimmedName,
        updatedAt: currentTimestamp,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        name: trimmedName,
        email: updatedUser.email,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
