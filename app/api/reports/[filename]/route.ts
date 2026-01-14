import { auth0 } from "@/lib/auth0";
import { existsSync } from "fs";
import { readFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { join } from "path";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    // Check authentication
    const session = await auth0.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { filename } = await params;

    // Validate filename to prevent directory traversal
    if (
      filename.includes("..") ||
      filename.includes("/") ||
      filename.includes("\\")
    ) {
      return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
    }

    // Construct file path
    // Use /tmp in production (serverless environments have read-only filesystems except /tmp)
    const isProduction = process.env.NODE_ENV === "production";
    const storageDir = isProduction
      ? join("/tmp", "storage", "reports")
      : join(process.cwd(), "storage", "reports");
    const filePath = join(storageDir, filename);

    // Check if file exists
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Read file
    const fileBuffer = await readFile(filePath);

    // Determine content type based on file extension
    const extension = filename.split(".").pop()?.toLowerCase();
    let contentType = "application/octet-stream";
    if (extension === "pdf") {
      contentType = "application/pdf";
    } else if (extension === "xlsx") {
      contentType =
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    }

    // Return file
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error serving report:", error);
    return NextResponse.json(
      { error: "Failed to serve report" },
      { status: 500 }
    );
  }
}
