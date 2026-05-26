import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getMessContext } from "@/lib/mess-context";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { zodFirstError } from "@/lib/validation";

const AutoGenerateSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const messContext = await getMessContext();
  if (!messContext || !messContext.canManage) {
    return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
  }

  const raw = await req.json();
  const parsed = AutoGenerateSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: zodFirstError(parsed) }, { status: 400 });
  }

  const { startDate, endDate } = parsed.data;

  // Normalize dates to UTC midnight
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const startUTC = new Date(Date.UTC(start.getFullYear(), start.getMonth(), start.getDate()));
  const endUTC = new Date(Date.UTC(end.getFullYear(), end.getMonth(), end.getDate()));

  if (startUTC > endUTC) {
    return NextResponse.json({ error: "Start date must be before end date" }, { status: 400 });
  }

  // Generate an array of dates
  const datesToProcess: Date[] = [];
  let current = new Date(startUTC);
  while (current <= endUTC) {
    datesToProcess.push(new Date(current));
    current.setUTCDate(current.getUTCDate() + 1);
  }

  // Get all active members with their default meals
  const activeMembers = await prisma.member.findMany({
    where: { messId: messContext.messId, isActive: true },
  });

  if (activeMembers.length === 0) {
    return NextResponse.json({ message: "No active members found." });
  }

  let generatedCount = 0;

  // Get existing meals in this date range to avoid overwriting manual changes
  const existingMeals = await prisma.mealCount.findMany({
    where: {
      messId: messContext.messId,
      date: {
        gte: startUTC,
        lte: endUTC,
      },
    },
    select: {
      memberId: true,
      date: true,
    },
  });

  // Create a fast lookup Set: "memberId_YYYY-MM-DD"
  const existingSet = new Set(
    existingMeals.map(
      (m) => `${m.memberId}_${m.date.toISOString().split("T")[0]}`
    )
  );

  const newMealsData = [];

  for (const date of datesToProcess) {
    const dateStr = date.toISOString().split("T")[0];

    for (const member of activeMembers) {
      const key = `${member.id}_${dateStr}`;
      
      // Only generate if no meal record exists for this member on this date
      if (!existingSet.has(key)) {
        const total = member.defaultBreakfast + member.defaultLunch + member.defaultDinner;
        
        newMealsData.push({
          memberId: member.id,
          messId: messContext.messId,
          date: date,
          breakfast: member.defaultBreakfast,
          lunch: member.defaultLunch,
          dinner: member.defaultDinner,
          total: total,
        });
      }
    }
  }

  if (newMealsData.length > 0) {
    const result = await prisma.mealCount.createMany({
      data: newMealsData,
    });
    generatedCount = result.count;
  }

  return NextResponse.json({ 
    message: `Successfully generated ${generatedCount} meal entries.`,
    count: generatedCount
  });
}
