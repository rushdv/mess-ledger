import { getSession } from "@/lib/session";
import { NextResponse } from "next/server";


import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getSession();

    if (!session || session.user?.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.adminAuditLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          admin: {
            select: { name: true, email: true }
          }
        },
      }),
      prisma.adminAuditLog.count(),
    ]);

    const formattedLogs = logs.map((l) => ({
      id: l.id,
      action: l.action,
      details: l.details || "-",
      adminName: l.admin.name || "Unknown Admin",
      adminEmail: l.admin.email,
      timestamp: l.createdAt,
    }));

    return NextResponse.json({
      logs: formattedLogs,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error("[ADMIN_AUDIT_LOGS_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch audit logs" },
      { status: 500 }
    );
  }
}
