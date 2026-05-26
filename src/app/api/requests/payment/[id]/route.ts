import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getMessContext } from "@/lib/mess-context";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const messContext = await getMessContext();
  if (!messContext || !messContext.canManage) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { status } = await req.json();
  if (status !== "APPROVED" && status !== "REJECTED") {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const request = await prisma.paymentRequest.findUnique({
    where: { id: params.id, messId: messContext.messId },
  });

  if (!request) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (request.status !== "PENDING") {
    return NextResponse.json({ error: "Request already processed" }, { status: 400 });
  }

  // Transaction: Update request status and create actual Payment if approved
  const result = await prisma.$transaction(async (tx) => {
    const updatedRequest = await tx.paymentRequest.update({
      where: { id: params.id },
      data: { status },
      include: {
        member: { include: { user: { select: { name: true, email: true } } } },
      },
    });

    if (status === "APPROVED") {
      const date = new Date(request.date);
      await tx.payment.create({
        data: {
          memberId: request.memberId,
          messId: request.messId,
          amount: request.amount,
          note: request.note ? `[TrxID: ${request.trxId || 'N/A'}] ${request.note}` : `[TrxID: ${request.trxId || 'N/A'}]`,
          month: date.getMonth() + 1,
          year: date.getFullYear(),
          date: date,
          addedBy: session.user.id,
        },
      });
    }

    return updatedRequest;
  });

  return NextResponse.json(result);
}
