import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getMessContext } from "@/lib/mess-context";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const messContext = await getMessContext();
  if (!messContext) return NextResponse.json({ error: "No mess selected" }, { status: 400 });

  // Only admins need to see the total pending count
  // Members only see their own pending requests if we want to show that too
  
  const [paymentCount, expenseCount] = await Promise.all([
    prisma.paymentRequest.count({
      where: {
        messId: messContext.messId,
        status: "PENDING",
        ...(messContext.canManage ? {} : { memberId: messContext.memberId || "" }),
      },
    }),
    prisma.expenseRequest.count({
      where: {
        messId: messContext.messId,
        status: "PENDING",
        ...(messContext.canManage ? {} : { memberId: messContext.memberId || "" }),
      },
    }),
  ]);

  return NextResponse.json({
    payments: paymentCount,
    expenses: expenseCount,
    total: paymentCount + expenseCount,
  });
}
