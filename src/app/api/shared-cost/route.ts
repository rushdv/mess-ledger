import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getMessContext } from "@/lib/mess-context";
import { prisma } from "@/lib/prisma";
import { SharedCostPostSchema, zodFirstError } from "@/lib/validation";

// GET /api/shared-cost?month=5&year=2026
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

  const entries = await prisma.sharedCost.findMany({
    where: { messId: messContext.messId, month, year },
    include: {
      members: {
        include: {
          member: {
            include: { user: { select: { name: true, email: true } } },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(entries);
}

// POST /api/shared-cost — add shared cost (admin only)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
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
  const parsed = SharedCostPostSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: zodFirstError(parsed) }, { status: 400 });
  }

  const { month, year, amount, description, memberIds, date } = parsed.data;
  const entryDate = date ? new Date(date) : new Date();

  const entry = await prisma.sharedCost.create({
    data: {
      messId: messContext.messId,
      month,
      year,
      amount,
      description: description ?? null,
      date: entryDate,
      addedBy: session.user.id,
      members: {
        create: memberIds.map((memberId) => ({ memberId })),
      },
    },
    include: {
      members: {
        include: {
          member: {
            include: { user: { select: { name: true, email: true } } },
          },
        },
      },
    },
  });

  return NextResponse.json(entry, { status: 201 });
}

// DELETE /api/shared-cost?id=xxx (admin or moderator)
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
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

  const result = await prisma.sharedCost.deleteMany({
    where: { id, messId: messContext.messId },
  });

  if (result.count === 0) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
