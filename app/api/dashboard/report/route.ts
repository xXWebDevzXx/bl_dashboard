import { auth0 } from "@/lib/auth0";
import { prisma } from "@/lib/prisma/client";
import { getReportData } from "@/lib/report-data";
import { generateExcel } from "@/lib/report-excel";
import { generatePDF } from "@/lib/report-pdf";
import { existsSync } from "fs";
import { mkdir, writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { join } from "path";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth0.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { auth0Id: session.user.sub },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      );
    }

    // Get format from query parameter
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get("format");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!format || (format !== "pdf" && format !== "excel")) {
      return NextResponse.json(
        { error: "Invalid format. Use 'pdf' or 'excel'" },
        { status: 400 }
      );
    }

    // Parse date range if provided
    const dateRange =
      startDate && endDate
        ? {
            startDate: new Date(startDate),
            endDate: new Date(endDate),
          }
        : undefined;

    // Fetch all dashboard data
    const reportData = await getReportData(dateRange);

    // Generate filename with timestamp
    const dateStr = new Date().toISOString().split("T")[0];
    const timestamp = Date.now();
    const fileExtension = format === "pdf" ? "pdf" : "xlsx";
    const filename = `dashboard-report-${dateStr}-${timestamp}.${fileExtension}`;

    // Ensure storage directory exists
    const storageDir = join(process.cwd(), "storage", "reports");
    if (!existsSync(storageDir)) {
      await mkdir(storageDir, { recursive: true });
    }

    const filePath = join(storageDir, filename);
    const fileUrl = `/api/reports/${filename}`;

    let buffer: Buffer;

    if (format === "pdf") {
      // Generate PDF
      const doc = generatePDF(reportData);
      // Use arraybuffer for server-side generation (more reliable than blob)
      const pdfArrayBuffer = doc.output("arraybuffer");
      buffer = Buffer.from(pdfArrayBuffer);
    } else if (format === "excel") {
      // Generate Excel
      const excelBuffer = await generateExcel(reportData);

      // Ensure it's a proper Node.js Buffer
      buffer = Buffer.isBuffer(excelBuffer)
        ? excelBuffer
        : Buffer.from(excelBuffer);
    } else {
      return NextResponse.json({ error: "Invalid format" }, { status: 400 });
    }

    // Save file to storage
    await writeFile(filePath, buffer);

    // Create database record
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const reportName = `Dashboard Report - ${dateStr}${
      dateRange ? ` (${startDate} to ${endDate})` : ""
    }`;

    await prisma.report.create({
      data: {
        name: reportName,
        url: fileUrl,
        userId: dbUser.id,
        createdAt: currentTimestamp,
        updatedAt: currentTimestamp,
      },
    });

    // Return file for download
    const contentType =
      format === "pdf"
        ? "application/pdf"
        : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    return new NextResponse(buffer as unknown as BodyInit, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
