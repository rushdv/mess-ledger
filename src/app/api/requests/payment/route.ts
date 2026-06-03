import { getSession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";


import { getMessContext } from "@/lib/mess-context";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const PaymentRequestSchema = z.object({
  amount: z.number().positive(),
  trxId: z.string().optional(),
  note: z.string().optional(),
  date: z.string().datetime().optional(),
});

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const messContext = await getMessContext();
  if (!messContext) return NextResponse.json({ error: "No mess selected" }, { status: 400 });

  // Admins see all, Members see their own
  let requests;
  if (messContext.isMessAdmin) {
    requests = await prisma.paymentRequest.findMany({
      where: { messId: messContext.messId },
      include: {
        member: { include: { user: { select: { name: true, email: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });
  } else {
    requests = await prisma.paymentRequest.findMany({
      where: { messId: messContext.messId, memberId: messContext.memberId || "" },
      include: {
        member: { include: { user: { select: { name: true, email: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  return NextResponse.json(requests);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const messContext = await getMessContext();
  if (!messContext || !messContext.memberId) {
    return NextResponse.json({ error: "Invalid mess context" }, { status: 400 });
  }

  const raw = await req.json();
  const parsed = PaymentRequestSchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  const { amount, trxId, note, date } = parsed.data;

  const request = await prisma.paymentRequest.create({
    data: {
      messId: messContext.messId,
      memberId: messContext.memberId,
      amount,
      trxId: trxId || null,
      note: note || null,
      date: date ? new Date(date) : new Date(),
    },
  });

  return NextResponse.json(request, { status: 201 });
}
