import { auth0 } from "@/lib/auth0";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const session = await auth0.getSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const domain = process.env.AUTH0_DOMAIN;
    const clientId = process.env.AUTH0_CLIENT_ID;

    if (!domain || !clientId) {
      return NextResponse.json(
        { error: "Auth0 configuration missing" },
        { status: 500 }
      );
    }

    // Use Auth0's Authentication API to trigger password reset
    // This endpoint sends a password reset email to the user
    const response = await fetch(`https://${domain}/dbconnections/change_password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        email: session.user.email,
        connection: "Username-Password-Authentication", // Default Auth0 database connection
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Auth0 password reset error:", errorText);
      return NextResponse.json(
        { error: "Failed to send password reset email" },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Password reset email sent successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

