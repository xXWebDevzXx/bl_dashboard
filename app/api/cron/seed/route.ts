import { NextRequest, NextResponse } from "next/server";
import { seedDatabase, type SyncResponse } from "@/lib/seed-db";

/**
 * POST /api/cron/seed
 * 
 * Cron job endpoint for seeding the database with data from APIs.
 * 
 * Authentication: Requires CRON_SECRET environment variable to be set.
 * The request must include the secret in the Authorization header or as a query parameter.
 * 
 * Usage:
 * - Vercel Cron: Set up in vercel.json with this endpoint
 * - External Cron: Call this endpoint with ?secret=YOUR_SECRET
 * - Manual: POST with Authorization: Bearer YOUR_SECRET header
 */
export async function POST(request: NextRequest) {
  try {
    // Check if this is a Vercel cron request (has x-vercel-cron header)
    const isVercelCron = request.headers.get("x-vercel-cron") === "1";
    
    // Verify authentication (unless it's a Vercel cron request)
    if (!isVercelCron) {
      const cronSecret = process.env.CRON_SECRET;
      if (!cronSecret) {
        console.error("CRON_SECRET environment variable is not set");
        return NextResponse.json(
          { 
            error: "Cron secret not configured",
            message: "Please set CRON_SECRET environment variable in your .env.local file"
          },
          { status: 500 }
        );
      }

      // Check for secret in Authorization header or query parameter
      const authHeader = request.headers.get("authorization");
      const url = new URL(request.url);
      const querySecret = url.searchParams.get("secret");

      const providedSecret =
        authHeader?.replace("Bearer ", "") || querySecret;

      if (!providedSecret) {
        return NextResponse.json(
          { 
            error: "Unauthorized",
            message: "No secret provided. Include ?secret=YOUR_SECRET in the URL or Authorization header"
          },
          { status: 401 }
        );
      }

      if (providedSecret !== cronSecret) {
        console.error("Secret mismatch - provided secret does not match CRON_SECRET");
        return NextResponse.json(
          { 
            error: "Unauthorized",
            message: "Invalid secret. Make sure CRON_SECRET in .env.local matches the secret you're providing"
          },
          { status: 401 }
        );
      }
    }

    console.warn("Starting cron seed job...");
    const startTime = Date.now();

    // Fetch data from the sync API
    // Use APP_BASE_URL if set, otherwise use the request origin, or default to localhost
    let apiBaseUrl = process.env.APP_BASE_URL;
    if (!apiBaseUrl) {
      const origin = request.headers.get("origin") || request.nextUrl.origin;
      if (origin && origin !== "null") {
        apiBaseUrl = origin;
      } else if (process.env.VERCEL_URL) {
        apiBaseUrl = `https://${process.env.VERCEL_URL}`;
      } else {
        apiBaseUrl = "http://localhost:3000";
      }
    }
    
    console.warn(`Fetching data from sync API at ${apiBaseUrl}/api/sync-projects...`);
    const response = await fetch(`${apiBaseUrl}/api/sync-projects`, {
      // Add cache control to ensure fresh data
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const syncData: SyncResponse = await response.json();

    if (!syncData.success) {
      throw new Error("Sync API returned unsuccessful response");
    }

    // Seed the database
    const seedResult = await seedDatabase(syncData, false);

    const duration = Date.now() - startTime;

    console.warn(`Cron seed job completed in ${duration}ms`);
    console.warn(`Created: ${seedResult.issues.created} issues, ${seedResult.labels.created} labels, ${seedResult.timeEntries.created} time entries`);

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      duration: `${duration}ms`,
      result: seedResult,
    });
  } catch (error) {
    console.error("Error in cron seed job:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cron/seed
 * 
 * Allows triggering the seed job via GET request (useful for testing and external cron services)
 */
export async function GET(request: NextRequest) {
  // Convert GET to POST logic
  return POST(request);
}

