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
            { code: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [messes, total] = await Promise.all([
      prisma.mess.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { members: true },
          },
          messMembers: {
            where: { role: "ADMIN" },
            include: { user: true },
            take: 1
          }
        },
      }),
      prisma.mess.count({ where: whereClause }),
    ]);

    const formattedMesses = messes.map((m) => ({
      id: m.id,
      name: m.name,
      code: m.code,
      createdAt: m.createdAt,
      totalMembers: m._count.members,
      ownerName: m.messMembers[0]?.user.name || "Unknown",
      ownerEmail: m.messMembers[0]?.user.email || "Unknown",
      status: "Active" // This could be derived from recent activity in a real app
    }));

    return NextResponse.json({
      messes: formattedMesses,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error("[ADMIN_MESSES_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch messes" },
      { status: 500 }
    );
  }
}
