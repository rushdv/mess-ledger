import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getMessContext } from "@/lib/mess-context";
import { prisma } from "@/lib/prisma";

// GET /api/payments?month=5&year=2026
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

  const payments = await prisma.payment.findMany({
    where: { messId: messContext.messId, month, year },
    include: {
      member: {
        include: { user: { select: { name: true, email: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(payments);
}

// POST /api/payments — record a payment (admin only)
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

  const body = await req.json();
  const { memberId, month, year, amount, note, date } = body;

  if (!memberId || !month || !year || !amount) {
    return NextResponse.json(
      { error: "memberId, month, year, and amount are required" },
      { status: 400 }
    );
  }

  const paymentDate = date ? new Date(date) : new Date();

  const payment = await prisma.payment.create({
    data: {
      memberId,
      messId: messContext.messId,
      month,
      year,
      amount: parseFloat(amount),
      note: note ?? null,
      date: paymentDate,
      addedBy: session.user.id,
    },
    include: {
      member: {
        include: { user: { select: { name: true, email: true } } },
      },
    },
  });

  return NextResponse.json(payment, { status: 201 });
}

// DELETE /api/payments?id=xxx (admin only)
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const messContext = await getMessContext();
  if (!messContext || !messContext.isMessAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  await prisma.payment.delete({ where: { id, messId: messContext.messId } });
  return NextResponse.json({ success: true });
}
