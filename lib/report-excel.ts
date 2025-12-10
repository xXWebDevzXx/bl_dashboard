import ExcelJS from "exceljs";
import type { ReportData } from "./report-data";

export async function generateExcel(data: ReportData): Promise<ExcelJS.Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Dashboard Report Generator";
  workbook.created = new Date();

  // Colors matching dashboard theme
  const primaryColor = "161B22"; // #161B22
  const accentColor = "059669"; // #059669 (emerald)
  const lightGray = "9CA3AF"; // gray-400

  // Summary Sheet
  const summarySheet = workbook.addWorksheet("Summary");
  summarySheet.columns = [{ width: 30 }, { width: 20 }];

  // Header
  const summaryHeader = summarySheet.getRow(1);
  summaryHeader.height = 30;
  summaryHeader.getCell(1).value = "Dashboard Report";
  summaryHeader.getCell(1).font = {
    size: 18,
    bold: true,
    color: { argb: "FFFFFFFF" },
  };
  summaryHeader.getCell(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: primaryColor },
  };
  summaryHeader.getCell(1).alignment = {
    vertical: "middle",
    horizontal: "left",
  };
  summarySheet.mergeCells(1, 1, 1, 2);

  const dateRow = summarySheet.getRow(2);
  dateRow.getCell(1).value = `Generated on ${data.metadata.generatedDate}`;
  dateRow.getCell(1).font = { size: 10, color: { argb: lightGray } };
  dateRow.height = 20;

  // Summary Metrics
  let currentRow = 4;
  summarySheet.getRow(currentRow).getCell(1).value = "Summary Metrics";
  summarySheet.getRow(currentRow).getCell(1).font = { size: 14, bold: true };
  currentRow++;

  const metricsData = [
    ["Metric", "Value"],
    ["Total Issues (Last Year)", data.stats.linearTasksCount],
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
  ];

  metricsData.forEach((row, index) => {
    const sheetRow = summarySheet.getRow(currentRow);
    sheetRow.getCell(1).value = row[0];
    sheetRow.getCell(2).value = row[1];

    if (index === 0) {
      // Header row
      sheetRow.getCell(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: accentColor },
      };
      sheetRow.getCell(2).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: accentColor },
      };
      sheetRow.getCell(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
      sheetRow.getCell(2).font = { bold: true, color: { argb: "FFFFFFFF" } };
    } else {
      // Data rows with alternating colors
      if (index % 2 === 0) {
        sheetRow.getCell(1).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "F3F4F6" },
        };
        sheetRow.getCell(2).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "F3F4F6" },
        };
      }
    }
    currentRow++;
  });

  // Time Chart Data Sheet
  const timeChartSheet = workbook.addWorksheet("Time Chart Data");
  timeChartSheet.columns = [
    { width: 15 },
    { width: 18 },
    { width: 20 },
    { width: 15 },
  ];

  currentRow = 1;
  const timeChartHeader = timeChartSheet.getRow(currentRow);
  timeChartHeader.getCell(1).value = "Date";
  timeChartHeader.getCell(2).value = "AI Tasks (hrs)";
  timeChartHeader.getCell(3).value = "Non-AI Tasks (hrs)";
  timeChartHeader.getCell(4).value = "Total (hrs)";

  [1, 2, 3, 4].forEach((col) => {
    timeChartHeader.getCell(col).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: accentColor },
    };
    timeChartHeader.getCell(col).font = {
      bold: true,
      color: { argb: "FFFFFFFF" },
    };
    timeChartHeader.getCell(col).alignment = {
      vertical: "middle",
      horizontal: "center",
    };
  });

  currentRow++;
  data.timeChartData.forEach((item, index) => {
    const row = timeChartSheet.getRow(currentRow);
    row.getCell(1).value = new Date(item.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    row.getCell(2).value = item.aiTasksHours;
    row.getCell(3).value = item.nonAiTasksHours;
    row.getCell(4).value = {
      formula: `B${currentRow}+C${currentRow}`,
    };
    row.getCell(4).numFmt = "0.00";

    // Format numbers
    row.getCell(2).numFmt = "0.00";
    row.getCell(3).numFmt = "0.00";

    // Alternating row colors
    if (index % 2 === 0) {
      [1, 2, 3, 4].forEach((col) => {
        row.getCell(col).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "F3F4F6" },
        };
      });
    }

    currentRow++;
  });

  // Note: ExcelJS chart API is complex and may require additional setup
  // Charts can be added manually by users in Excel, or we can add them programmatically
  // For now, we'll skip programmatic chart creation as it requires more complex setup
  // The data is available in the sheet for users to create charts manually

  // Estimation Accuracy Sheet
  const estimationSheet = workbook.addWorksheet("Estimation Accuracy");
  estimationSheet.columns = [
    { width: 20 },
    { width: 20 },
    { width: 20 },
    { width: 15 },
    { width: 15 },
  ];

  currentRow = 1;
  const estimationHeader = estimationSheet.getRow(currentRow);
  estimationHeader.getCell(1).value = "Category";
  estimationHeader.getCell(2).value = "Avg Estimated (hrs)";
  estimationHeader.getCell(3).value = "Avg Actual (hrs)";
  estimationHeader.getCell(4).value = "Accuracy %";
  estimationHeader.getCell(5).value = "Task Count";

  [1, 2, 3, 4, 5].forEach((col) => {
    estimationHeader.getCell(col).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: accentColor },
    };
    estimationHeader.getCell(col).font = {
      bold: true,
      color: { argb: "FFFFFFFF" },
    };
    estimationHeader.getCell(col).alignment = {
      vertical: "middle",
      horizontal: "center",
    };
  });

  const estimationData = [
    {
      category: "AI Tasks",
      data: data.estimationAccuracy.aiTasks,
    },
    {
      category: "Non-AI Tasks",
      data: data.estimationAccuracy.nonAiTasks,
    },
    {
      category: "Overall",
      data: data.estimationAccuracy.overall,
    },
  ];

  currentRow++;
  estimationData.forEach((item, index) => {
    const row = estimationSheet.getRow(currentRow);
    row.getCell(1).value = item.category;
    row.getCell(2).value = item.data.averageEstimated;
    row.getCell(3).value = item.data.averageActual;
    row.getCell(4).value = item.data.accuracyPercentage;
    row.getCell(5).value = (
      "taskCount" in item.data ? item.data.taskCount : "-"
    ) as string | number;

    // Format numbers
    row.getCell(2).numFmt = "0.00";
    row.getCell(3).numFmt = "0.00";
    row.getCell(4).numFmt = "0.0";

    // Alternating row colors
    if (index % 2 === 0) {
      [1, 2, 3, 4, 5].forEach((col) => {
        row.getCell(col).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "F3F4F6" },
        };
      });
    }

    currentRow++;
  });

  // Task Distribution Sheet
  const distributionSheet = workbook.addWorksheet("Task Distribution");
  distributionSheet.columns = [{ width: 30 }, { width: 15 }];

  currentRow = 1;
  const distributionHeader = distributionSheet.getRow(currentRow);
  distributionHeader.getCell(1).value = "Label";
  distributionHeader.getCell(2).value = "Task Count";

  [1, 2].forEach((col) => {
    distributionHeader.getCell(col).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: accentColor },
    };
    distributionHeader.getCell(col).font = {
      bold: true,
      color: { argb: "FFFFFFFF" },
    };
    distributionHeader.getCell(col).alignment = {
      vertical: "middle",
      horizontal: "center",
    };
  });

  currentRow++;
  data.taskDistribution.labelTaskCounts.forEach((item, index) => {
    const row = distributionSheet.getRow(currentRow);
    row.getCell(1).value = item.label;
    row.getCell(2).value = item.count;

    // Alternating row colors
    if (index % 2 === 0) {
      [1, 2].forEach((col) => {
        row.getCell(col).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "F3F4F6" },
        };
      });
    }

    currentRow++;
  });

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer as ExcelJS.Buffer;
}
