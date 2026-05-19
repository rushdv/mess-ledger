import { prisma } from "@/lib/prisma";

export interface MemberSummary {
  memberId: string;
  memberName: string;
  totalMeals: number;
  mealCost: number;
  utilityShare: number;
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
  totalCost: number;
  mealRate: number;
  utilityPerHead: number;
  memberSummaries: MemberSummary[];
}

export async function calculateMonthly(
  month: number,
  year: number
): Promise<MonthlyCalculation> {
  // Get all active members
  const members = await prisma.member.findMany({
    where: { isActive: true },
    include: { user: true },
  });

  // Get meal counts for the month
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const mealCounts = await prisma.mealCount.findMany({
    where: {
      date: { gte: startDate, lte: endDate },
    },
  });

  // Get bazar costs for the month
  const bazarCosts = await prisma.bazarCost.findMany({
    where: { month, year },
  });

  // Get utility costs for the month
  const utilityCosts = await prisma.utilityCost.findMany({
    where: { month, year },
  });

  // Get payments for the month
  const payments = await prisma.payment.findMany({
    where: { month, year },
  });

  // Totals
  const totalBazarCost = bazarCosts.reduce((sum, b) => sum + b.amount, 0);
  const totalUtility = utilityCosts.reduce((sum, u) => sum + u.amount, 0);
  const totalCost = totalBazarCost + totalUtility;

  // Total meals across all members
  const totalMeals = mealCounts.reduce((sum, mc) => sum + mc.total, 0);

  // Meal rate = total bazar cost / total meals (avoid division by zero)
  const mealRate = totalMeals > 0 ? totalBazarCost / totalMeals : 0;

  // Utility per head
  const activeCount = members.length;
  const utilityPerHead = activeCount > 0 ? totalUtility / activeCount : 0;

  // Per-member summaries
  const memberSummaries: MemberSummary[] = members.map((member) => {
    const memberMeals = mealCounts
      .filter((mc) => mc.memberId === member.id)
      .reduce((sum, mc) => sum + mc.total, 0);

    const mealCost = memberMeals * mealRate;
    const utilityShare = utilityPerHead;
    const memberTotalCost = mealCost + utilityShare;

    const totalPaid = payments
      .filter((p) => p.memberId === member.id)
      .reduce((sum, p) => sum + p.amount, 0);

    const due = memberTotalCost - totalPaid;

    return {
      memberId: member.id,
      memberName: member.user.name ?? member.user.email,
      totalMeals: memberMeals,
      mealCost,
      utilityShare,
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
    totalCost,
    mealRate,
    utilityPerHead,
    memberSummaries,
  };
}

// Save/update the monthly report in DB
export async function saveMonthlyReport(calc: MonthlyCalculation) {
  const report = await prisma.monthlyReport.upsert({
    where: { month_year: { month: calc.month, year: calc.year } },
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
          totalCost: s.totalCost,
          totalPaid: s.totalPaid,
          due: s.due,
        })),
      },
    },
    create: {
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
          totalCost: s.totalCost,
          totalPaid: s.totalPaid,
          due: s.due,
        })),
      },
    },
  });

  return report;
}
