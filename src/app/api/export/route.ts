import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getMessContext } from "@/lib/mess-context";
import { calculateMonthly } from "@/lib/calculations";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const messContext = await getMessContext();
  if (!messContext) return NextResponse.json({ error: "No mess selected" }, { status: 400 });

  const { searchParams } = new URL(req.url);
  const month = parseInt(searchParams.get("month") ?? String(new Date().getMonth() + 1));
  const year = parseInt(searchParams.get("year") ?? String(new Date().getFullYear()));

  // Get calculated data
  const calc = await calculateMonthly(month, year, messContext.messId);

  // Get detailed transactions
  const [bazar, utility, payments, individual, shared] = await Promise.all([
    prisma.bazarCost.findMany({ where: { messId: messContext.messId, month, year }, orderBy: { date: 'asc' } }),
    prisma.utilityCost.findMany({ where: { messId: messContext.messId, month, year }, orderBy: { date: 'asc' } }),
    prisma.payment.findMany({ where: { messId: messContext.messId, month, year }, include: { member: { include: { user: true } } }, orderBy: { date: 'asc' } }),
    prisma.individualCost.findMany({ where: { messId: messContext.messId, month, year }, include: { member: { include: { user: true } } }, orderBy: { date: 'asc' } }),
    prisma.sharedCost.findMany({ where: { messId: messContext.messId, month, year }, include: { members: { include: { member: { include: { user: true } } } } }, orderBy: { date: 'asc' } })
  ]);

  // Create workbook
  const wb = XLSX.utils.book_new();

  // 1. Summary Sheet
  const summaryData = calc.memberSummaries.map((s) => ({
    Member: s.memberName,
    "Total Meals": s.totalMeals,
    "Meal Cost": s.mealCost,
    "Utility Share": s.utilityShare,
    "Individual Cost": s.individualCost,
    "Shared Cost": s.sharedCost,
    "Total Cost": s.totalCost,
    "Total Paid": s.totalPaid,
    "Due (Owes)": s.due > 0 ? s.due : 0,
    "Advance": s.due < 0 ? Math.abs(s.due) : 0,
  }));
  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, "Member Summary");

  // 2. Bazar Sheet
  const bazarData = bazar.map((b) => ({
    Date: b.date.toISOString().split("T")[0],
    Description: b.description || "",
    Amount: b.amount,
  }));
  const wsBazar = XLSX.utils.json_to_sheet(bazarData);
  XLSX.utils.book_append_sheet(wb, wsBazar, "Bazar Costs");

  // 3. Utility Sheet
  const utilityData = utility.map((u) => ({
    Date: u.date.toISOString().split("T")[0],
    Type: u.type,
    Description: u.description || "",
    Amount: u.amount,
  }));
  const wsUtility = XLSX.utils.json_to_sheet(utilityData);
  XLSX.utils.book_append_sheet(wb, wsUtility, "Utility Costs");

  // 4. Payments Sheet
  const paymentData = payments.map((p) => ({
    Date: p.date.toISOString().split("T")[0],
    Member: p.member.user.name || p.member.user.email,
    Note: p.note || "",
    Amount: p.amount,
  }));
  const wsPayments = XLSX.utils.json_to_sheet(paymentData);
  XLSX.utils.book_append_sheet(wb, wsPayments, "Payments");

  // 5. Individual Costs Sheet
  const indData = individual.map((i) => ({
    Date: i.date.toISOString().split("T")[0],
    Member: i.member.user.name || i.member.user.email,
    Description: i.description || "",
    Amount: i.amount,
  }));
  const wsInd = XLSX.utils.json_to_sheet(indData);
  XLSX.utils.book_append_sheet(wb, wsInd, "Individual Costs");

  // 6. Shared Costs Sheet
  const sharedData = shared.map((s) => ({
    Date: s.date.toISOString().split("T")[0],
    Description: s.description || "",
    Amount: s.amount,
    "Shared Between": s.members.map(m => m.member.user.name || m.member.user.email).join(", ")
  }));
  const wsShared = XLSX.utils.json_to_sheet(sharedData);
  XLSX.utils.book_append_sheet(wb, wsShared, "Shared Costs");

  // Generate buffer
  const excelBuffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  // Return as downloadable file
  return new NextResponse(excelBuffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="MessLedger_${year}_${month}.xlsx"`,
    },
  });
}
