import { auth0 } from "@/lib/auth0";
import { prisma } from "@/lib/prisma/client";
import { NextResponse } from "next/server";

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
      scope: "delete:users",
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

// Delete user from Auth0
async function deleteAuth0User(
  userId: string,
  accessToken: string
): Promise<void> {
  const domain = process.env.AUTH0_DOMAIN;

  const response = await fetch(`https://${domain}/api/v2/users/${userId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Failed to delete Auth0 user:", error);
    throw new Error("Failed to delete user from Auth0");
  }
}

export async function DELETE() {
  try {
    const session = await auth0.getSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const auth0Id = session.user.sub;

    // Soft delete from database (set deletedAt timestamp)
    const currentTimestamp = Math.floor(Date.now() / 1000);

    try {
      await prisma.user.update({
        where: { auth0Id },
        data: {
          deletedAt: currentTimestamp,
          updatedAt: currentTimestamp,
        },
      });
    } catch (dbError) {
      console.error("Failed to soft delete user from database:", dbError);
      // Continue to delete from Auth0 even if DB update fails
    }

    // Delete from Auth0
    try {
      const accessToken = await getManagementApiToken();
      await deleteAuth0User(auth0Id, accessToken);
    } catch (auth0Error) {
      console.error("Failed to delete user from Auth0:", auth0Error);
      // Even if Auth0 deletion fails, continue - the soft delete from DB prevents access
    }

    return NextResponse.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}
