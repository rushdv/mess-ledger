export const dynamic = "force-dynamic";
import { getSession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";


import { getMessContext } from "@/lib/mess-context";
import { prisma } from "@/lib/prisma";
import { PaymentPostSchema, zodFirstError } from "@/lib/validation";

// GET /api/payments?month=5&year=2026
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

// POST /api/payments — record a payment (single or bulk, admin only)
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
  const parsed = PaymentPostSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: zodFirstError(parsed) }, { status: 400 });
  }

  const data = parsed.data;

  // ── Bulk payment entry ──
  if (data.bulk === true) {
    const paymentDate = data.date ? new Date(data.date) : new Date();

    const created = await prisma.$transaction(
      data.entries.map((e) =>
        prisma.payment.create({
          data: {
            memberId: e.memberId,
            messId: messContext.messId,
            month: data.month,
            year: data.year,
            amount: e.amount,
            note: e.note || data.note || null,
            date: paymentDate,
            addedBy: session.user.id,
          },
        })
      )
    );

    return NextResponse.json({ success: true, count: created.length }, { status: 201 });
  }

  // ── Single payment entry ──
  const paymentDate = data.date ? new Date(data.date) : new Date();

  const payment = await prisma.payment.create({
    data: {
      memberId: data.memberId,
      messId: messContext.messId,
      month: data.month,
      year: data.year,
      amount: data.amount,
      note: data.note ?? null,
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

// DELETE /api/payments?id=xxx (admin or moderator)
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

  // Use deleteMany so we can filter by both id AND messId (security check)
  const result = await prisma.payment.deleteMany({
    where: { id, messId: messContext.messId },
  });

  if (result.count === 0) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
