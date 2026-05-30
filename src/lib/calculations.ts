import { prisma } from "@/lib/prisma";

export interface MemberSummary {
  memberId: string;
  memberName: string;
  totalMeals: number;
  mealCost: number;
  utilityShare: number;
  individualCost: number;
  sharedCost: number;
  totalCost: number;
  totalPaid: number;
  due: number; // positive = owes money, negative = has advance
}

export interface MonthlyCalculation {
  month: number;
  year: number;
  totalMeals: number;
  totalBazarCost: number;
  totalUtility: number;
  totalIndividual: number;
  totalShared: number;
  totalCost: number;
  totalCollected: number; // sum of all payments
  messBalance: number;    // totalCollected - totalCost (positive = surplus, negative = deficit)
  mealRate: number;
  utilityPerHead: number;
  memberSummaries: MemberSummary[];
}

export async function calculateMonthly(
  month: number,
  year: number,
  messId: string
): Promise<MonthlyCalculation> {
  // Full month date range (UTC) — include last millisecond to avoid off-by-one
  const startDate = new Date(Date.UTC(year, month - 1, 1));
  const endDate   = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

  // Fetch all active members PLUS any currently-inactive members who had
  // activity in this month (meals, payments, or individual costs).
  // This prevents report imbalances when a member is deactivated mid-month.
  const members = await prisma.member.findMany({
    where: {
      messId: messId,
      OR: [
        { isActive: true },
        {
          mealCounts: {
            some: { date: { gte: startDate, lte: endDate } },
          },
        },
        {
          payments: { some: { month, year } },
        },
        {
          individualCosts: { some: { month, year } },
        },
      ],
    },
    include: { user: true },
  });

  const mealCounts = await prisma.mealCount.findMany({
    where: {
      messId: messId,
      date: { gte: startDate, lte: endDate },
    },
  });

  // Get bazar costs for the month
  const bazarCosts = await prisma.bazarCost.findMany({
    where: { messId: messId, month, year },
  });

  // Get utility costs for the month
  const utilityCosts = await prisma.utilityCost.findMany({
    where: { messId: messId, month, year },
  });

  // Get payments for the month
  const payments = await prisma.payment.findMany({
    where: { messId: messId, month, year },
  });

  // Get individual costs for the month
  const individualCosts = await prisma.individualCost.findMany({
    where: { messId: messId, month, year },
  });

  // Get shared costs for the month (with member list)
  const sharedCosts = await prisma.sharedCost.findMany({
    where: { messId: messId, month, year },
    include: { members: true },
  });

  // Helper: round to 2 decimal places to eliminate floating-point drift
  const r2 = (n: number) => Math.round(n * 100) / 100;

  // Totals — use Number() to safely coerce Prisma Decimal → JS number
  const totalBazarCost  = r2(bazarCosts.reduce((sum, b) => sum + Number(b.amount), 0));
  const totalUtility    = r2(utilityCosts.reduce((sum, u) => sum + Number(u.amount), 0));
  const totalIndividual = r2(individualCosts.reduce((sum, c) => sum + Number(c.amount), 0));
  const totalShared     = r2(sharedCosts.reduce((sum, c) => sum + Number(c.amount), 0));
  const totalCost       = r2(totalBazarCost + totalUtility + totalIndividual + totalShared);
  const totalCollected  = r2(payments.reduce((sum, p) => sum + Number(p.amount), 0));
  const messBalance     = r2(totalCollected - totalCost);

  // Total meals across all members
  const totalMeals = mealCounts.reduce((sum, mc) => sum + mc.total, 0);

  // Meal rate = total bazar cost / total meals (avoid division by zero)
  const mealRate = totalMeals > 0 ? r2(totalBazarCost / totalMeals) : 0;

  // Utility per head — divide ONLY by currently-active members.
  // Inactive members who still appear for historical data should NOT
  // dilute the utility bill for active members.
  const activeOnlyCount = members.filter((m) => m.isActive).length;
  const utilityPerHead  = activeOnlyCount > 0 ? r2(totalUtility / activeOnlyCount) : 0;

  // Per-member summaries
  const memberSummaries: MemberSummary[] = members.map((member) => {
    const memberMeals = mealCounts
      .filter((mc) => mc.memberId === member.id)
      .reduce((sum, mc) => sum + mc.total, 0);

    const mealCost = r2(memberMeals * mealRate);

    // Inactive members who appear for historical reasons do NOT owe utility
    const utilityShare = member.isActive ? utilityPerHead : 0;

    const memberIndividualCost = r2(
      individualCosts
        .filter((c) => c.memberId === member.id)
        .reduce((sum, c) => sum + Number(c.amount), 0)
    );

    // Shared cost: split equally among the members listed in each entry
    const memberSharedCost = r2(
      sharedCosts.reduce((sum, sc) => {
        const memberIds = sc.members.map((m) => m.memberId);
        if (!memberIds.includes(member.id)) return sum;
        return sum + Number(sc.amount) / memberIds.length;
      }, 0)
    );

    const memberTotalCost = r2(mealCost + utilityShare + memberIndividualCost + memberSharedCost);

    const totalPaid = r2(
      payments
        .filter((p) => p.memberId === member.id)
        .reduce((sum, p) => sum + Number(p.amount), 0)
    );

    // positive due  = owes money
    // negative due  = has advance / overpaid
    const due = r2(memberTotalCost - totalPaid);

    return {
      memberId: member.id,
      memberName: member.user.name ?? member.user.email,
      totalMeals: memberMeals,
      mealCost,
      utilityShare,
      individualCost: memberIndividualCost,
      sharedCost: memberSharedCost,
      totalCost: memberTotalCost,
      totalPaid,
      due,
    };
  });

  return {
    month,
    year,
    totalMeals,
    totalBazarCost,
    totalUtility,
    totalIndividual,
    totalShared,
    totalCost,
    totalCollected,
    messBalance,
    mealRate,
    utilityPerHead,
    memberSummaries,
  };
}

// Save/update the monthly report in DB
export async function saveMonthlyReport(calc: MonthlyCalculation, messId: string) {
  const report = await prisma.monthlyReport.upsert({
    where: { messId_month_year: { messId: messId, month: calc.month, year: calc.year } },
    update: {
      totalMeals: calc.totalMeals,
      totalBazarCost: calc.totalBazarCost,
      totalUtility: calc.totalUtility,
      totalCost: calc.totalCost,
      mealRate: calc.mealRate,
      utilityPerHead: calc.utilityPerHead,
      calculatedAt: new Date(),
      memberSummaries: {
        deleteMany: {},
        create: calc.memberSummaries.map((s) => ({
          memberId: s.memberId,
          memberName: s.memberName,
          totalMeals: s.totalMeals,
          mealCost: s.mealCost,
          utilityShare: s.utilityShare,
          individualCost: s.individualCost,
          sharedCost: s.sharedCost,
          totalCost: s.totalCost,
          totalPaid: s.totalPaid,
          due: s.due,
        })),
      },
    },
    create: {
      messId: messId,
      month: calc.month,
      year: calc.year,
      totalMeals: calc.totalMeals,
      totalBazarCost: calc.totalBazarCost,
      totalUtility: calc.totalUtility,
      totalCost: calc.totalCost,
      mealRate: calc.mealRate,
      utilityPerHead: calc.utilityPerHead,
      memberSummaries: {
        create: calc.memberSummaries.map((s) => ({
          memberId: s.memberId,
          memberName: s.memberName,
          totalMeals: s.totalMeals,
          mealCost: s.mealCost,
          utilityShare: s.utilityShare,
          individualCost: s.individualCost,
          sharedCost: s.sharedCost,
          totalCost: s.totalCost,
          totalPaid: s.totalPaid,
          due: s.due,
        })),
      },
    },
  });

  return report;
}
