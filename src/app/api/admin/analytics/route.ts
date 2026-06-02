import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    // We'll generate simple mock analytics data based on the real user/mess counts
    // In a real production scenario, this would aggregate actual historical data
    
    const [totalUsers, totalMesses] = await Promise.all([
      prisma.user.count(),
      prisma.mess.count()
    ]);

    // Generate 6 months of mock trend data ending this month
    const growthData = [];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonth = new Date().getMonth();
    
    // Reverse engineer some reasonable historical data
    let currentUserCount = Math.max(10, totalUsers - 50);
    let currentMessCount = Math.max(5, totalMesses - 20);

    for (let i = 5; i >= 0; i--) {
      const mIdx = (currentMonth - i + 12) % 12;
      
      // Gradually increase to match current totals
      const userInc = Math.floor(Math.random() * 10) + 2;
      const messInc = Math.floor(Math.random() * 5) + 1;
      
      if (i === 0) {
        currentUserCount = totalUsers;
        currentMessCount = totalMesses;
      } else {
        currentUserCount += userInc;
        currentMessCount += messInc;
      }

      growthData.push({
        name: months[mIdx],
        users: currentUserCount,
        messes: currentMessCount,
      });
    }

    // Determine active/inactive messes roughly
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activeMessIds = await prisma.monthlyReport.findMany({
      where: { calculatedAt: { gte: thirtyDaysAgo } },
      select: { messId: true },
      distinct: ['messId']
    });

    const activeMesses = activeMessIds.length;
    const inactiveMesses = Math.max(0, totalMesses - activeMesses);

    const activityData = [
      { name: "Active", value: activeMesses, fill: "hsl(var(--primary))" },
      { name: "Inactive", value: inactiveMesses, fill: "hsl(var(--muted))" },
    ];

    return NextResponse.json({
      growthData,
      activityData
    });
  } catch (error) {
    console.error("[ADMIN_ANALYTICS_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
