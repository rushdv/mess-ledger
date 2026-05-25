import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

// POST /api/mess/select - Select a mess (set cookie)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messId } = await req.json();

    if (!messId) {
      return NextResponse.json({ error: "Mess ID is required" }, { status: 400 });
    }

    // Verify user is a member of this mess
    const messMember = await prisma.messMember.findUnique({
      where: {
        userId_messId: {
          userId: session.user.id,
          messId,
        },
      },
    });

    if (!messMember || !messMember.isActive) {
      return NextResponse.json(
        { error: "You are not a member of this mess" },
        { status: 403 }
      );
    }

    // Set cookie
    cookies().set("selectedMessId", messId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error selecting mess:", error);
    return NextResponse.json({ error: "Failed to select mess" }, { status: 500 });
  }
}
