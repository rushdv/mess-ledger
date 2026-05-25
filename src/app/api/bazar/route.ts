import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getMessContext } from "@/lib/mess-context";
import { prisma } from "@/lib/prisma";

// GET /api/bazar?month=5&year=2026
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

  const entries = await prisma.bazarCost.findMany({
    where: { messId: messContext.messId, month, year },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(entries);
}

// POST /api/bazar — add bazar entry (admin only)
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
  const { month, year, amount, description, date } = body;

  if (!month || !year || !amount) {
    return NextResponse.json(
      { error: "month, year, and amount are required" },
      { status: 400 }
    );
  }

  // Use provided date or default to now
  const entryDate = date ? new Date(date) : new Date();

  const entry = await prisma.bazarCost.create({
    data: {
      messId: messContext.messId,
      month,
      year,
      amount: parseFloat(amount),
      description: description ?? null,
      date: entryDate,
      addedBy: session.user.id,
    },
  });

  return NextResponse.json(entry, { status: 201 });
}

// DELETE /api/bazar?id=xxx (admin only)
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

  await prisma.bazarCost.delete({ where: { id, messId: messContext.messId } });
  return NextResponse.json({ success: true });
}
