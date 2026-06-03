export const dynamic = "force-dynamic";
import { getSession } from "@/lib/session";
import { NextResponse } from "next/server";


import { prisma } from "@/lib/prisma";

// GET /api/mess - Get all messes for current user
export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const messMembers = await prisma.messMember.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
      },
      include: {
        mess: true,
      },
      orderBy: {
        joinedAt: "desc",
      },
    });

    const messes = messMembers.map((mm) => ({
      id: mm.mess.id,
      name: mm.mess.name,
      code: mm.mess.code,
      description: mm.mess.description,
      role: mm.role,
      joinedAt: mm.joinedAt,
    }));

    return NextResponse.json(messes);
  } catch (error) {
    console.error("Error fetching messes:", error);
    return NextResponse.json({ error: "Failed to fetch messes" }, { status: 500 });
  }
}
