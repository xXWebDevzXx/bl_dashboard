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
  const backgroundColor: [number, number, number] = [22, 27, 34]; // #161B22
  const cardBackground: [number, number, number] = [22, 27, 34]; // #161B22
  const innerCardBackground: [number, number, number] = [13, 17, 23]; // #0D1117
  const borderColor: [number, number, number] = [39, 39, 42]; // zinc-800/60 (approximate)
  const accentColor: [number, number, number] = [5, 150, 105]; // #059669 (emerald)
  const cyanColor: [number, number, number] = [34, 211, 238]; // #22d3ee (cyan)
  const textColor: [number, number, number] = [255, 255, 255];
  const lightTextColor: [number, number, number] = [156, 163, 175]; // gray-400
  const margin = 20;
  const cardPadding = 12;

  // Helper function to draw a card with border
  const drawCard = (
    x: number,
    y: number,
    width: number,
    height: number,
    fill: boolean = true
  ) => {
    // Card background
    if (fill) {
      doc.setFillColor(cardBackground[0], cardBackground[1], cardBackground[2]);
      doc.roundedRect(x, y, width, height, 2, 2, "F");
    }
    // Border
    doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
    doc.setLineWidth(0.5);
    doc.roundedRect(x, y, width, height, 2, 2);
  };

  // Helper function to add a new page if needed
  const checkPageBreak = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - 30) {
      doc.addPage();
      // Set background color for the new page
      doc.setFillColor(
        backgroundColor[0],
        backgroundColor[1],
        backgroundColor[2]
      );
      doc.rect(0, 0, pageWidth, pageHeight, "F");
      yPosition = 20;
      return true;
    }
    return false;
  };

  // Set page background
  doc.setFillColor(backgroundColor[0], backgroundColor[1], backgroundColor[2]);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // Header Card
  const headerHeight = 50;
  drawCard(margin, yPosition, pageWidth - 2 * margin, headerHeight);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("Dashboard Report", margin + cardPadding, yPosition + 18);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
  doc.text(
    `Generated on ${data.metadata.generatedDate}`,
    margin + cardPadding,
    yPosition + 28
  );
  yPosition += headerHeight + 15;

  // Summary Metrics Section - Card Layout
  checkPageBreak(80);
  const summaryCardHeight = 75;
  drawCard(margin, yPosition, pageWidth - 2 * margin, summaryCardHeight);

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text("Summary Metrics", margin + cardPadding, yPosition + 12);

  const metricsStartY = yPosition + 20;
  let currentMetricY = metricsStartY;

  // Draw metric cards
  const metricWidth = (pageWidth - 2 * margin - 2 * cardPadding) / 2 - 5;
  const metricHeight = 20;

  // Metric 1: Total Issues
  doc.setFillColor(
    innerCardBackground[0],
    innerCardBackground[1],
    innerCardBackground[2]
  );
  doc.roundedRect(
    margin + cardPadding,
    currentMetricY,
    metricWidth,
    metricHeight,
    2,
    2,
    "F"
  );
  doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  doc.roundedRect(
    margin + cardPadding,
    currentMetricY,
    metricWidth,
    metricHeight,
    2,
    2
  );
  doc.setFontSize(9);
  doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
  doc.setFont("helvetica", "normal");
  doc.text(
    "Total Issues (Last Year)",
    margin + cardPadding + 4,
    currentMetricY + 6
  );
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text(
    data.stats.linearTasksCount.toString(),
    margin + cardPadding + 4,
    currentMetricY + 15
  );

  // Metric 2: AI Issues vs Non-AI
  doc.setFillColor(
    innerCardBackground[0],
    innerCardBackground[1],
    innerCardBackground[2]
  );
  doc.roundedRect(
    margin + cardPadding + metricWidth + 10,
    currentMetricY,
    metricWidth,
    metricHeight,
    2,
    2,
    "F"
  );
  doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  doc.roundedRect(
    margin + cardPadding + metricWidth + 10,
    currentMetricY,
    metricWidth,
    metricHeight,
    2,
    2
  );
  doc.setFontSize(9);
  doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
  doc.setFont("helvetica", "normal");
  doc.text(
    "AI Issues vs Non-AI",
    margin + cardPadding + metricWidth + 14,
    currentMetricY + 6
  );
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.text(
    `${data.stats.linearTasksWithTogglTimePercentage.toFixed(2)}%`,
    margin + cardPadding + metricWidth + 14,
    currentMetricY + 15
  );

  currentMetricY += metricHeight + 8;

  // Metric 3: Average Time
  doc.setFillColor(
    innerCardBackground[0],
    innerCardBackground[1],
    innerCardBackground[2]
  );
  doc.roundedRect(
    margin + cardPadding,
    currentMetricY,
    metricWidth,
    metricHeight,
    2,
    2,
    "F"
  );
  doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  doc.roundedRect(
    margin + cardPadding,
    currentMetricY,
    metricWidth,
    metricHeight,
    2,
    2
  );
  doc.setFontSize(9);
  doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
  doc.setFont("helvetica", "normal");
  doc.text(
    "Average Time per Issue",
    margin + cardPadding + 4,
    currentMetricY + 6
  );
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text(
    `${data.stats.averageTogglTimeHours.toFixed(2)} hrs`,
    margin + cardPadding + 4,
    currentMetricY + 15
  );

  // Metric 4: AI-Assisted Issues
  doc.setFillColor(
    innerCardBackground[0],
    innerCardBackground[1],
    innerCardBackground[2]
  );
  doc.roundedRect(
    margin + cardPadding + metricWidth + 10,
    currentMetricY,
    metricWidth,
    metricHeight,
    2,
    2,
    "F"
  );
  doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  doc.roundedRect(
    margin + cardPadding + metricWidth + 10,
    currentMetricY,
    metricWidth,
    metricHeight,
    2,
    2
  );
  doc.setFontSize(9);
  doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
  doc.setFont("helvetica", "normal");
  doc.text(
    "AI-Assisted Issues",
    margin + cardPadding + metricWidth + 14,
    currentMetricY + 6
  );
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.text(
    `${data.stats.linearTasksWithDelegatePercentage.toFixed(2)}%`,
    margin + cardPadding + metricWidth + 14,
    currentMetricY + 15
  );

  yPosition += summaryCardHeight + 15;

  // Estimation Accuracy Section - Card Layout
  checkPageBreak(100);
  // We'll calculate the actual height after drawing the table
  const accuracyCardStartY = yPosition;
  drawCard(margin, yPosition, pageWidth - 2 * margin, 1); // Temporary height, will redraw

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text("Estimation Accuracy", margin + cardPadding, yPosition + 12);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
  doc.text(
    "Estimated vs Actual hours per issue",
    margin + cardPadding,
    yPosition + 20
  );

  const accuracyStartY = yPosition + 28;
  const accuracyMetricWidth =
    (pageWidth - 2 * margin - 2 * cardPadding) / 2 - 5;
  const accuracyMetricHeight = 25;

  // AI Tasks Accuracy Card
  doc.setFillColor(
    innerCardBackground[0],
    innerCardBackground[1],
    innerCardBackground[2]
  );
  doc.roundedRect(
    margin + cardPadding,
    accuracyStartY,
    accuracyMetricWidth,
    accuracyMetricHeight,
    2,
    2,
    "F"
  );
  doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  doc.roundedRect(
    margin + cardPadding,
    accuracyStartY,
    accuracyMetricWidth,
    accuracyMetricHeight,
    2,
    2
  );
  doc.setFontSize(8);
  doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
  doc.setFont("helvetica", "normal");
  doc.text("AI Issues Accuracy", margin + cardPadding + 4, accuracyStartY + 6);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.text(
    `${data.estimationAccuracy.aiTasks.accuracyPercentage.toFixed(1)}%`,
    margin + cardPadding + 4,
    accuracyStartY + 16
  );
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
  doc.text(
    `${data.estimationAccuracy.aiTasks.taskCount} issues`,
    margin + cardPadding + 4,
    accuracyStartY + 22
  );

  // Non-AI Tasks Accuracy Card
  doc.setFillColor(
    innerCardBackground[0],
    innerCardBackground[1],
    innerCardBackground[2]
  );
  doc.roundedRect(
    margin + cardPadding + accuracyMetricWidth + 10,
    accuracyStartY,
    accuracyMetricWidth,
    accuracyMetricHeight,
    2,
    2,
    "F"
  );
  doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  doc.roundedRect(
    margin + cardPadding + accuracyMetricWidth + 10,
    accuracyStartY,
    accuracyMetricWidth,
    accuracyMetricHeight,
    2,
    2
  );
  doc.setFontSize(8);
  doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
  doc.setFont("helvetica", "normal");
  doc.text(
    "Non-AI Issues Accuracy",
    margin + cardPadding + accuracyMetricWidth + 14,
    accuracyStartY + 6
  );
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(cyanColor[0], cyanColor[1], cyanColor[2]);
  doc.text(
    `${data.estimationAccuracy.nonAiTasks.accuracyPercentage.toFixed(1)}%`,
    margin + cardPadding + accuracyMetricWidth + 14,
    accuracyStartY + 16
  );
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
  doc.text(
    `${data.estimationAccuracy.nonAiTasks.taskCount} issues`,
    margin + cardPadding + accuracyMetricWidth + 14,
    accuracyStartY + 22
  );

  // Detailed table below
  const tableStartY = accuracyStartY + accuracyMetricHeight + 8;
  autoTable(doc, {
    startY: tableStartY,
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
    theme: "plain",
    headStyles: {
      fillColor: [
        innerCardBackground[0],
        innerCardBackground[1],
        innerCardBackground[2],
      ],
      textColor: textColor,
      fontStyle: "bold",
      lineColor: borderColor,
      lineWidth: 0.5,
    },
    bodyStyles: {
      textColor: textColor,
      lineColor: borderColor,
      lineWidth: 0.3,
    },
    alternateRowStyles: {
      fillColor: [
        innerCardBackground[0],
        innerCardBackground[1],
        innerCardBackground[2],
      ],
    },
    styles: {
      cellPadding: 3,
      fontSize: 7,
    },
    margin: { left: margin + cardPadding, right: margin + cardPadding, top: 0 },
  });

  // Redraw the accuracy card with correct height (border only to avoid covering content)
  const accuracyCardEndY = (doc.lastAutoTable?.finalY ?? yPosition) + 5;
  const accuracyCardHeight = accuracyCardEndY - accuracyCardStartY;
  drawCard(
    margin,
    accuracyCardStartY,
    pageWidth - 2 * margin,
    accuracyCardHeight,
    false
  );

  yPosition = accuracyCardEndY + 15;

  // Task Distribution Section - Card Layout
  checkPageBreak(60);
  const distributionCardStartY = yPosition;
  drawCard(margin, yPosition, pageWidth - 2 * margin, 1); // Temporary height, will redraw

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text("Task Distribution by Label", margin + cardPadding, yPosition + 12);
  yPosition += 20;

  const distributionBody = data.taskDistribution.labelTaskCounts.map((item) => [
    item.label,
    item.count.toString(),
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [["Label", "Task Count"]],
    body: distributionBody,
    theme: "plain",
    headStyles: {
      fillColor: [
        innerCardBackground[0],
        innerCardBackground[1],
        innerCardBackground[2],
      ],
      textColor: textColor,
      fontStyle: "bold",
      lineColor: borderColor,
      lineWidth: 0.5,
    },
    bodyStyles: {
      textColor: textColor,
      lineColor: borderColor,
      lineWidth: 0.3,
    },
    alternateRowStyles: {
      fillColor: [
        innerCardBackground[0],
        innerCardBackground[1],
        innerCardBackground[2],
      ],
    },
    styles: {
      cellPadding: 4,
      fontSize: 8,
    },
    margin: { left: margin + cardPadding, right: margin + cardPadding, top: 0 },
  });

  // Redraw the distribution card with correct height (border only to avoid covering content)
  const distributionCardEndY = (doc.lastAutoTable?.finalY ?? yPosition) + 5;
  const distributionCardHeight = distributionCardEndY - distributionCardStartY;
  drawCard(
    margin,
    distributionCardStartY,
    pageWidth - 2 * margin,
    distributionCardHeight,
    false
  );

  yPosition = distributionCardEndY + 15;

  // Time Chart Data Section - Card Layout
  checkPageBreak(80);
  const last30Days = data.timeChartData.slice(-30);
  const timeChartCardStartY = yPosition;
  drawCard(margin, yPosition, pageWidth - 2 * margin, 1); // Temporary height, will redraw

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text(
    "Time Chart Data (Last 30 Days)",
    margin + cardPadding,
    yPosition + 12
  );
  yPosition += 20;

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
    theme: "plain",
    headStyles: {
      fillColor: [
        innerCardBackground[0],
        innerCardBackground[1],
        innerCardBackground[2],
      ],
      textColor: textColor,
      fontStyle: "bold",
      lineColor: borderColor,
      lineWidth: 0.5,
    },
    bodyStyles: {
      textColor: textColor,
      lineColor: borderColor,
      lineWidth: 0.3,
      fontSize: 7,
    },
    alternateRowStyles: {
      fillColor: [
        innerCardBackground[0],
        innerCardBackground[1],
        innerCardBackground[2],
      ],
    },
    styles: {
      cellPadding: 2,
      fontSize: 7,
    },
    margin: { left: margin + cardPadding, right: margin + cardPadding, top: 0 },
  });

  // Redraw the time chart card with correct height (border only to avoid covering content)
  const timeChartCardEndY = (doc.lastAutoTable?.finalY ?? yPosition) + 5;
  const timeChartCardHeight = timeChartCardEndY - timeChartCardStartY;
  drawCard(
    margin,
    timeChartCardStartY,
    pageWidth - 2 * margin,
    timeChartCardHeight,
    false
  );

  yPosition = timeChartCardEndY + 15;

  // Distribution Statistics Section (Boxplot Data)
  checkPageBreak(120);
  const boxplotCardStartY = yPosition;
  drawCard(margin, yPosition, pageWidth - 2 * margin, 1); // Temporary height

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text("Distribution Statistics", margin + cardPadding, yPosition + 12);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
  doc.text(
    "Statistical distribution of metrics (AI vs Non-AI)",
    margin + cardPadding,
    yPosition + 20
  );

  yPosition += 28;

  // Helper to format boxplot table rows
  const formatBoxplotRows = (
    metricName: string,
    unit: string,
    aiStats: typeof data.boxplotStats.actualTime.ai,
    nonAiStats: typeof data.boxplotStats.actualTime.nonAi
  ) => [
    [
      `${metricName} - AI`,
      aiStats.n.toString(),
      `${aiStats.median.toFixed(unit === "hours" ? 2 : 1)} ${unit}`,
      `${aiStats.q1.toFixed(unit === "hours" ? 2 : 1)} - ${aiStats.q3.toFixed(unit === "hours" ? 2 : 1)} ${unit}`,
      `${aiStats.mean.toFixed(unit === "hours" ? 2 : 1)} ${unit}`,
      `${aiStats.p95.toFixed(unit === "hours" ? 2 : 1)} ${unit}`,
    ],
    [
      `${metricName} - Non-AI`,
      nonAiStats.n.toString(),
      `${nonAiStats.median.toFixed(unit === "hours" ? 2 : 1)} ${unit}`,
      `${nonAiStats.q1.toFixed(unit === "hours" ? 2 : 1)} - ${nonAiStats.q3.toFixed(unit === "hours" ? 2 : 1)} ${unit}`,
      `${nonAiStats.mean.toFixed(unit === "hours" ? 2 : 1)} ${unit}`,
      `${nonAiStats.p95.toFixed(unit === "hours" ? 2 : 1)} ${unit}`,
    ],
  ];

  const boxplotBody = [
    ...formatBoxplotRows(
      "Actual Time",
      "hrs",
      data.boxplotStats.actualTime.ai,
      data.boxplotStats.actualTime.nonAi
    ),
    ...formatBoxplotRows(
      "Accuracy",
      "%",
      data.boxplotStats.accuracy.ai,
      data.boxplotStats.accuracy.nonAi
    ),
    ...formatBoxplotRows(
      "Lead Time",
      "days",
      data.boxplotStats.leadTime.ai,
      data.boxplotStats.leadTime.nonAi
    ),
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [["Metric", "Count (n)", "Median", "IQR (Q1-Q3)", "Mean", "P95"]],
    body: boxplotBody,
    theme: "plain",
    headStyles: {
      fillColor: [
        innerCardBackground[0],
        innerCardBackground[1],
        innerCardBackground[2],
      ],
      textColor: textColor,
      fontStyle: "bold",
      lineColor: borderColor,
      lineWidth: 0.5,
    },
    bodyStyles: {
      textColor: textColor,
      lineColor: borderColor,
      lineWidth: 0.3,
      fontSize: 7,
    },
    alternateRowStyles: {
      fillColor: [
        innerCardBackground[0],
        innerCardBackground[1],
        innerCardBackground[2],
      ],
    },
    styles: {
      cellPadding: 3,
      fontSize: 7,
    },
    margin: { left: margin + cardPadding, right: margin + cardPadding, top: 0 },
  });

  // Redraw the boxplot card with correct height
  const boxplotCardEndY = (doc.lastAutoTable?.finalY ?? yPosition) + 5;
  const boxplotCardHeight = boxplotCardEndY - boxplotCardStartY;
  drawCard(
    margin,
    boxplotCardStartY,
    pageWidth - 2 * margin,
    boxplotCardHeight,
    false
  );

  // Footer on each page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    // Draw footer background
    doc.setFillColor(
      backgroundColor[0],
      backgroundColor[1],
      backgroundColor[2]
    );
    doc.rect(0, pageHeight - 15, pageWidth, 15, "F");
    doc.setFontSize(8);
    doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
    doc.setFont("helvetica", "normal");
    doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 8, {
      align: "center",
    });
  }

  return doc;
}
