import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/meals?month=5&year=2026
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const month = parseInt(searchParams.get("month") ?? String(new Date().getMonth() + 1));
  const year = parseInt(searchParams.get("year") ?? String(new Date().getFullYear()));

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const meals = await prisma.mealCount.findMany({
    where: { date: { gte: startDate, lte: endDate } },
    include: {
      member: {
        include: { user: { select: { name: true, email: true } } },
      },
    },
    orderBy: [{ date: "asc" }, { memberId: "asc" }],
  });

  return NextResponse.json(meals);
}

// POST /api/meals — add or update meal count for a day
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { memberId, date, breakfast = 0, lunch = 0, dinner = 0 } = body;

  if (!memberId || !date) {
    return NextResponse.json(
      { error: "memberId and date are required" },
      { status: 400 }
    );
  }

  // Members can only update their own meals; admins can update anyone's
  if (session.user.role !== "ADMIN") {
    const member = await prisma.member.findUnique({
      where: { id: memberId },
      select: { userId: true },
    });
    if (member?.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const parsedDate = new Date(date);
  parsedDate.setHours(0, 0, 0, 0);

  const total = breakfast + lunch + dinner;

  const mealCount = await prisma.mealCount.upsert({
    where: { memberId_date: { memberId, date: parsedDate } },
    update: { breakfast, lunch, dinner, total },
    create: { memberId, date: parsedDate, breakfast, lunch, dinner, total },
  });

  return NextResponse.json(mealCount);
}
