import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { ReportData } from "./report-data";

// Extend jsPDF type to include lastAutoTable property added by jspdf-autotable
interface ExtendedJsPDF extends jsPDF {
  lastAutoTable?: {
    finalY: number;
  };
}

export function generatePDF(data: ReportData): jsPDF {
  const doc = new jsPDF() as ExtendedJsPDF;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Colors matching dashboard theme
  const primaryColor: [number, number, number] = [22, 27, 34]; // #161B22
  const accentColor: [number, number, number] = [5, 150, 105]; // #059669 (emerald)
  const textColor: [number, number, number] = [255, 255, 255];
  const lightTextColor: [number, number, number] = [156, 163, 175]; // gray-400

  // Helper function to add a new page if needed
  const checkPageBreak = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - 20) {
      doc.addPage();
      yPosition = 20;
      return true;
    }
    return false;
  };

  // Header
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, 40, "F");
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("Dashboard Report", 20, 25);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
  doc.text(`Generated on ${data.metadata.generatedDate}`, 20, 35);
  yPosition = 50;

  // Summary Metrics Section
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text("Summary Metrics", 20, yPosition);
  yPosition += 10;

  // Summary metrics table
  autoTable(doc, {
    startY: yPosition,
    head: [["Metric", "Value"]],
    body: [
      ["Total Issues (Last Year)", data.stats.linearTasksCount.toString()],
      [
        "AI Issues vs Non-AI Issues",
        `${data.stats.linearTasksWithTogglTimePercentage.toFixed(2)}%`,
      ],
      [
        "Average Time per Issue",
        `${data.stats.averageTogglTimeHours.toFixed(2)} hrs`,
      ],
      [
        "AI-Assisted Issues",
        `${data.stats.linearTasksWithDelegatePercentage.toFixed(2)}%`,
      ],
    ],
    theme: "striped",
    headStyles: {
      fillColor: accentColor,
      textColor: textColor,
      fontStyle: "bold",
    },
    bodyStyles: {
      textColor: [0, 0, 0],
    },
    styles: {
      cellPadding: 5,
    },
    margin: { left: 20, right: 20 },
  });

  yPosition = (doc.lastAutoTable?.finalY ?? yPosition) + 15;

  // Estimation Accuracy Section
  checkPageBreak(60);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text("Estimation Accuracy", 20, yPosition);
  yPosition += 10;

  autoTable(doc, {
    startY: yPosition,
    head: [
      [
        "Category",
        "Avg Estimated (hrs)",
        "Avg Actual (hrs)",
        "Accuracy %",
        "Task Count",
      ],
    ],
    body: [
      [
        "AI Tasks",
        data.estimationAccuracy.aiTasks.averageEstimated.toFixed(2),
        data.estimationAccuracy.aiTasks.averageActual.toFixed(2),
        `${data.estimationAccuracy.aiTasks.accuracyPercentage.toFixed(1)}%`,
        data.estimationAccuracy.aiTasks.taskCount.toString(),
      ],
      [
        "Non-AI Tasks",
        data.estimationAccuracy.nonAiTasks.averageEstimated.toFixed(2),
        data.estimationAccuracy.nonAiTasks.averageActual.toFixed(2),
        `${data.estimationAccuracy.nonAiTasks.accuracyPercentage.toFixed(1)}%`,
        data.estimationAccuracy.nonAiTasks.taskCount.toString(),
      ],
      [
        "Overall",
        data.estimationAccuracy.overall.averageEstimated.toFixed(2),
        data.estimationAccuracy.overall.averageActual.toFixed(2),
        `${data.estimationAccuracy.overall.accuracyPercentage.toFixed(1)}%`,
        "-",
      ],
    ],
    theme: "striped",
    headStyles: {
      fillColor: accentColor,
      textColor: textColor,
      fontStyle: "bold",
    },
    bodyStyles: {
      textColor: [0, 0, 0],
    },
    styles: {
      cellPadding: 5,
    },
    margin: { left: 20, right: 20 },
  });

  yPosition = (doc.lastAutoTable?.finalY ?? yPosition) + 15;

  // Task Distribution Section
  checkPageBreak(40);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text("Task Distribution by Label", 20, yPosition);
  yPosition += 10;

  const distributionBody = data.taskDistribution.labelTaskCounts.map((item) => [
    item.label,
    item.count.toString(),
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [["Label", "Task Count"]],
    body: distributionBody,
    theme: "striped",
    headStyles: {
      fillColor: accentColor,
      textColor: textColor,
      fontStyle: "bold",
    },
    bodyStyles: {
      textColor: [0, 0, 0],
    },
    styles: {
      cellPadding: 5,
    },
    margin: { left: 20, right: 20 },
  });

  yPosition = (doc.lastAutoTable?.finalY ?? yPosition) + 15;

  // Time Chart Data Section
  checkPageBreak(50);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text("Time Chart Data (Last 30 Days)", 20, yPosition);
  yPosition += 10;

  // Get last 30 days of data
  const last30Days = data.timeChartData.slice(-30);
  const timeChartBody = last30Days.map((item) => [
    new Date(item.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    item.aiTasksHours.toFixed(2),
    item.nonAiTasksHours.toFixed(2),
    (item.aiTasksHours + item.nonAiTasksHours).toFixed(2),
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [["Date", "AI Tasks (hrs)", "Non-AI Tasks (hrs)", "Total (hrs)"]],
    body: timeChartBody,
    theme: "striped",
    headStyles: {
      fillColor: accentColor,
      textColor: textColor,
      fontStyle: "bold",
    },
    bodyStyles: {
      textColor: [0, 0, 0],
      fontSize: 8,
    },
    styles: {
      cellPadding: 3,
      fontSize: 8,
    },
    margin: { left: 20, right: 20 },
  });

  // Footer on each page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, {
      align: "center",
    });
  }

  return doc;
}
