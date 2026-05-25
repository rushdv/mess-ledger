import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/mess/join - Join an existing mess by code
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }

    // Find mess by code
    const mess = await prisma.mess.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!mess) {
      return NextResponse.json({ error: "Mess not found" }, { status: 404 });
    }

    // Check if already a member
    const existing = await prisma.messMember.findUnique({
      where: {
        userId_messId: {
          userId: session.user.id,
          messId: mess.id,
        },
      },
    });

    if (existing) {
      if (existing.isActive) {
        return NextResponse.json(
          { error: "You are already a member of this mess" },
          { status: 400 }
        );
      } else {
        // Reactivate membership
        await prisma.messMember.update({
          where: { id: existing.id },
          data: { isActive: true },
        });
        return NextResponse.json(mess);
      }
    }

    // Add as member
    await prisma.messMember.create({
      data: {
        userId: session.user.id,
        messId: mess.id,
        role: "MEMBER",
      },
    });

    // Create Member record
    await prisma.member.create({
      data: {
        userId: session.user.id,
        messId: mess.id,
      },
    });

    return NextResponse.json(mess);
  } catch (error) {
    console.error("Error joining mess:", error);
    return NextResponse.json({ error: "Failed to join mess" }, { status: 500 });
  }
}
