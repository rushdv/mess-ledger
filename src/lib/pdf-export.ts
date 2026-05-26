import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getMonthName } from "./utils";
import { notoBengaliBase64 } from "@/lib/fonts/noto-sans-bengali";

// Helper function to format currency without special symbols
function formatCurrencyForPDF(amount: number): string {
  return `Tk ${amount.toFixed(2)}`;
}

interface MemberSummary {
  memberId: string;
  memberName: string;
  totalMeals: number;
  mealCost: number;
  utilityShare: number;
  individualCost: number;
  sharedCost: number;
  totalCost: number;
  totalPaid: number;
  due: number;
}

interface ReportData {
  month: number;
  year: number;
  totalMeals: number;
  totalBazarCost: number;
  totalUtility: number;
  totalIndividual: number;
  totalShared: number;
  totalCost: number;
  totalCollected: number;
  messBalance: number;
  mealRate: number;
  utilityPerHead: number;
  memberSummaries: MemberSummary[];
}

export function exportReportToPDF(report: ReportData, messName: string) {
  const doc = new jsPDF();
  
  // Register Noto Sans Bengali font to support Bangla Unicode characters
  doc.addFileToVFS("NotoSansBengali.ttf", notoBengaliBase64);
  doc.addFont("NotoSansBengali.ttf", "NotoSansBengali", "normal");
  doc.setFont("NotoSansBengali");
  
  // Title
  doc.setFontSize(20);
  doc.text(`${messName}`, 105, 15, { align: "center" });
  
  doc.setFontSize(16);
  doc.text(`Monthly Report - ${getMonthName(report.month)} ${report.year}`, 105, 25, { align: "center" });
  
  // Summary Section
  doc.setFontSize(12);
  doc.text("Summary", 14, 35);
  
  doc.setFontSize(10);
  
  const summaryData = [
    ["Total Meals", report.totalMeals.toString()],
    ["Meal Rate", formatCurrencyForPDF(report.mealRate) + "/meal"],
    ["Bazar Cost", formatCurrencyForPDF(report.totalBazarCost)],
    ["Utility Cost", formatCurrencyForPDF(report.totalUtility)],
    ["Individual Costs", formatCurrencyForPDF(report.totalIndividual || 0)],
    ["Shared Costs", formatCurrencyForPDF(report.totalShared || 0)],
    ["Total Cost", formatCurrencyForPDF(report.totalCost)],
    ["Total Collected", formatCurrencyForPDF(report.totalCollected)],
    ["Mess Balance", formatCurrencyForPDF(report.messBalance)],
  ];
  
  autoTable(doc, {
    startY: 40,
    head: [["Item", "Amount"]],
    body: summaryData,
    theme: "grid",
    headStyles: { font: "NotoSansBengali", fillColor: [59, 130, 246], fontSize: 10 },
    styles: { font: "NotoSansBengali", fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 60, halign: "right" },
    },
  });
  
  // Member Summary Table
  const finalY = (doc as any).lastAutoTable.finalY || 40;
  
  doc.setFontSize(12);
  doc.text("Member Summary", 14, finalY + 10);
  
  const memberData = report.memberSummaries.map((s) => [
    s.memberName,
    s.totalMeals.toString(),
    formatCurrencyForPDF(s.mealCost),
    formatCurrencyForPDF(s.utilityShare),
    formatCurrencyForPDF(s.individualCost),
    formatCurrencyForPDF(s.sharedCost),
    formatCurrencyForPDF(s.totalCost),
    formatCurrencyForPDF(s.totalPaid),
    formatCurrencyForPDF(Math.abs(s.due)),
    s.due > 0 ? "Owes" : "Advance",
  ]);
  
  // Add totals row
  memberData.push([
    "TOTAL",
    report.totalMeals.toString(),
    formatCurrencyForPDF(report.totalBazarCost),
    formatCurrencyForPDF(report.totalUtility),
    formatCurrencyForPDF(report.totalIndividual || 0),
    formatCurrencyForPDF(report.totalShared || 0),
    formatCurrencyForPDF(report.totalCost),
    formatCurrencyForPDF(report.totalCollected),
    "",
    "",
  ]);
  
  autoTable(doc, {
    startY: finalY + 15,
    head: [["Member", "Meals", "Meal Cost", "Utility", "Individual", "Shared", "Total", "Paid", "Due", "Status"]],
    body: memberData,
    theme: "striped",
    headStyles: { font: "NotoSansBengali", fillColor: [59, 130, 246], fontSize: 8 },
    styles: { font: "NotoSansBengali", fontSize: 7 },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 15, halign: "right" },
      2: { cellWidth: 20, halign: "right" },
      3: { cellWidth: 20, halign: "right" },
      4: { cellWidth: 20, halign: "right" },
      5: { cellWidth: 20, halign: "right" },
      6: { cellWidth: 20, halign: "right" },
      7: { cellWidth: 20, halign: "right" },
      8: { cellWidth: 20, halign: "right" },
      9: { cellWidth: 15, halign: "center" },
    },
    didParseCell: (data) => {
      // Highlight totals row
      if (data.row.index === memberData.length - 1) {
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.fillColor = [240, 240, 240];
      }
      
      // Color code due status
      if (data.column.index === 9 && data.row.index < memberData.length - 1) {
        if (data.cell.text[0] === "Owes") {
          data.cell.styles.textColor = [220, 38, 38]; // red
        } else if (data.cell.text[0] === "Advance") {
          data.cell.styles.textColor = [34, 197, 94]; // green
        }
      }
    },
  });
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Generated on ${new Date().toLocaleDateString()} | Page ${i} of ${pageCount}`,
      105,
      290,
      { align: "center" }
    );
  }
  
  // Save
  const fileName = `${messName.replace(/\s+/g, "_")}_Report_${getMonthName(report.month)}_${report.year}.pdf`;
  doc.save(fileName);
}
