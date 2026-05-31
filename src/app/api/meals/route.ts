import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getMessContext } from "@/lib/mess-context";
import { prisma } from "@/lib/prisma";
import { MealPostSchema, zodFirstError } from "@/lib/validation";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const messContext = await getMessContext();
  if (!messContext) {
    return NextResponse.json({ error: "No mess selected" }, { status: 400 });
  }

  const { searchParams } = new URL(req.url);
  const month = parseInt(searchParams.get("month") ?? String(new Date().getMonth() + 1));
  const year = parseInt(searchParams.get("year") ?? String(new Date().getFullYear()));

  const startDate = new Date(Date.UTC(year, month - 1, 1));
  const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

  const meals = await prisma.mealCount.findMany({
    where: { 
      messId: messContext.messId,
      date: { gte: startDate, lte: endDate } 
    },
    include: {
      member: {
        include: { user: { select: { name: true, email: true } } },
      },
    },
    orderBy: [{ date: "asc" }, { memberId: "asc" }],
  });

  return NextResponse.json(meals);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const messContext = await getMessContext();
  if (!messContext) {
    return NextResponse.json({ error: "No mess selected" }, { status: 400 });
  }

  const raw = await req.json();
  const parsed = MealPostSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: zodFirstError(parsed) }, { status: 400 });
  }

  const { memberId, date, breakfast, lunch, dinner } = parsed.data;

  if (!messContext.canManage) {
    const member = await prisma.member.findUnique({
      where: { id: memberId, messId: messContext.messId },
      select: { userId: true },
    });
    if (member?.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const rawDate = new Date(date);
  const parsedDate = new Date(Date.UTC(rawDate.getFullYear(), rawDate.getMonth(), rawDate.getDate()));

  const total = breakfast + lunch + dinner;

  const mealCount = await prisma.mealCount.upsert({
    where: { memberId_date: { memberId, date: parsedDate } },
    update: { breakfast, lunch, dinner, total },
    create: { 
      memberId, 
      messId: messContext.messId,
      date: parsedDate, 
      breakfast, 
      lunch, 
      dinner, 
      total 
    },
  });

  return NextResponse.json(mealCount);
}
