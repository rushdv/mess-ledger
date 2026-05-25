import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/shared-cost?month=5&year=2026
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const month = parseInt(searchParams.get("month") ?? String(new Date().getMonth() + 1));
  const year = parseInt(searchParams.get("year") ?? String(new Date().getFullYear()));

  const entries = await prisma.sharedCost.findMany({
    where: { month, year },
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
// body: { month, year, amount, description?, memberIds: string[] }
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { month, year, amount, description, memberIds } = body;

  if (!month || !year || !amount || !memberIds || memberIds.length === 0) {
    return NextResponse.json(
      { error: "month, year, amount, and memberIds are required" },
      { status: 400 }
    );
  }

  const entry = await prisma.sharedCost.create({
    data: {
      month,
      year,
      amount: parseFloat(amount),
      description: description ?? null,
      addedBy: session.user.id,
      members: {
        create: (memberIds as string[]).map((memberId) => ({ memberId })),
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

// DELETE /api/shared-cost?id=xxx (admin only)
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  await prisma.sharedCost.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
