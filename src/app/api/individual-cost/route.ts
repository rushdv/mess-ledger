import { getSession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";


import { getMessContext } from "@/lib/mess-context";
import { prisma } from "@/lib/prisma";
import { IndividualCostPostSchema, zodFirstError } from "@/lib/validation";

// GET /api/individual-cost?month=5&year=2026
export async function GET(req: NextRequest) {
  const session = await getSession();
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

  const entries = await prisma.individualCost.findMany({
    where: { messId: messContext.messId, month, year },
    include: {
      member: {
        include: { user: { select: { name: true, email: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(entries);
}

// POST /api/individual-cost — add individual cost entry (admin only)
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const messContext = await getMessContext();
  if (!messContext) {
    return NextResponse.json({ error: "No mess selected" }, { status: 400 });
  }

  if (!messContext.canManage) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const raw = await req.json();
  const parsed = IndividualCostPostSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: zodFirstError(parsed) }, { status: 400 });
  }

  const data = parsed.data;

  if (data.bulk === true) {
    const entryDate = data.date ? new Date(data.date) : new Date();
    const createdEntries = await prisma.$transaction(
      data.entries.map((e) =>
        prisma.individualCost.create({
          data: {
            memberId: e.memberId,
            messId: messContext.messId,
            month: data.month,
            year: data.year,
            amount: e.amount,
            description: e.description || data.description || null,
            date: entryDate,
            addedBy: session.user.id,
          },
        })
      )
    );
    return NextResponse.json({ success: true, count: createdEntries.length }, { status: 201 });
  }

  // Single entry
  const entryDate = data.date ? new Date(data.date) : new Date();
  const entry = await prisma.individualCost.create({
    data: {
      memberId: data.memberId,
      messId: messContext.messId,
      month: data.month,
      year: data.year,
      amount: data.amount,
      description: data.description ?? null,
      date: entryDate,
      addedBy: session.user.id,
    },
    include: {
      member: {
        include: { user: { select: { name: true, email: true } } },
      },
    },
  });

  return NextResponse.json(entry, { status: 201 });
}

// DELETE /api/individual-cost?id=xxx (admin or moderator)
export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const messContext = await getMessContext();
  if (!messContext || !messContext.canManage) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const result = await prisma.individualCost.deleteMany({
    where: { id, messId: messContext.messId },
  });

  if (result.count === 0) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
