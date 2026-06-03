export const dynamic = "force-dynamic";
import { getSession } from "@/lib/session";
import { NextResponse } from "next/server";


import { getMessContext } from "@/lib/mess-context";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const messContext = await getMessContext();
  if (!messContext) return NextResponse.json({ error: "No mess selected" }, { status: 400 });

  const memberFilter = messContext.canManage
    ? {}
    : { memberId: messContext.memberId ?? "__no_member__" };

  const [paymentCount, expenseCount] = await Promise.all([
    prisma.paymentRequest.count({
      where: {
        messId: messContext.messId,
        status: "PENDING",
        ...memberFilter,
      },
    }),
    prisma.expenseRequest.count({
      where: {
        messId: messContext.messId,
        status: "PENDING",
        ...memberFilter,
      },
    }),
  ]);

  return NextResponse.json({
    payments: paymentCount,
    expenses: expenseCount,
    total: paymentCount + expenseCount,
  });
}
