import { auth0 } from "@/lib/auth0";
import { getReportData } from "@/lib/report-data";
import { generateExcel } from "@/lib/report-excel";
import { generatePDF } from "@/lib/report-pdf";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth0.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get format from query parameter
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get("format");

    if (!format || (format !== "pdf" && format !== "excel")) {
      return NextResponse.json(
        { error: "Invalid format. Use 'pdf' or 'excel'" },
        { status: 400 }
      );
    }

    // Fetch all dashboard data
    const reportData = await getReportData();

    if (format === "pdf") {
      // Generate PDF
      const doc = generatePDF(reportData);
      const pdfBlob = doc.output("blob");

      // Convert blob to buffer for Next.js response
      const arrayBuffer = await pdfBlob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Return PDF file
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="dashboard-report-${
            new Date().toISOString().split("T")[0]
          }.pdf"`,
        },
      });
    } else if (format === "excel") {
      // Generate Excel
      const excelBuffer = await generateExcel(reportData);

      // Return Excel file
      return new NextResponse(excelBuffer, {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="dashboard-report-${
            new Date().toISOString().split("T")[0]
          }.xlsx"`,
        },
      });
    }

    return NextResponse.json({ error: "Invalid format" }, { status: 400 });
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
