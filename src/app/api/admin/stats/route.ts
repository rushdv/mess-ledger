export const dynamic = "force-dynamic";
import { getSession } from "@/lib/session";
import { NextResponse } from "next/server";


import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();

    if (!session || session.user?.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalUsers,
      totalMesses,
      newUsers,
      newMesses,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.mess.count(),
      prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.mess.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    ]);

    // Calculate active messes based on the last 30 days having activity
    const activeMessIds = await prisma.monthlyReport.findMany({
      where: { calculatedAt: { gte: thirtyDaysAgo } },
      select: { messId: true },
      distinct: ['messId']
    });

    const activeMesses = activeMessIds.length;
    const inactiveMesses = totalMesses - activeMesses;

    return NextResponse.json({
      totalUsers,
      totalMesses,
      activeMesses,
      inactiveMesses,
      newUsers,
      newMesses,
    });
  } catch (error) {
    console.error("[ADMIN_STATS_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
