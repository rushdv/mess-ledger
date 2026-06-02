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

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    
    const skip = (page - 1) * limit;

    const whereClause = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { messMembers: { where: { role: "ADMIN" } } },
          },
        },
      }),
      prisma.user.count({ where: whereClause }),
    ]);

    const formattedUsers = users.map((u) => ({
      id: u.id,
      name: u.name || "Unknown",
      email: u.email,
      totalMessesCreated: u._count.messMembers,
      registrationDate: u.createdAt,
      role: u.role,
      status: "Active"
    }));

    return NextResponse.json({
      users: formattedUsers,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error("[ADMIN_USERS_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
