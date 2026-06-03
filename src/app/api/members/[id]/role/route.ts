export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getMessContext } from "@/lib/mess-context";
import { prisma } from "@/lib/prisma";

// PATCH /api/members/[id]/role - Update member role (ADMIN only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const messContext = await getMessContext();
    if (!messContext) {
      return NextResponse.json(
        { error: "No mess selected" },
        { status: 400 }
      );
    }

    // Only ADMIN can change roles (not MODERATOR)
    if (!messContext.isMessAdmin) {
      return NextResponse.json(
        { error: "Only mess admin can change member roles" },
        { status: 403 }
      );
    }

    const { role } = await req.json();

    if (!["ADMIN", "MODERATOR", "MEMBER"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be ADMIN, MODERATOR, or MEMBER" },
        { status: 400 }
      );
    }

    const memberId = params.id;

    // Get the member to find userId
    const member = await prisma.member.findUnique({
      where: { id: memberId },
      select: { userId: true, messId: true },
    });

    if (!member || member.messId !== messContext.messId) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Prevent admin from demoting themselves
    if (member.userId === messContext.userId && role !== "ADMIN") {
      return NextResponse.json(
        { error: "You cannot change your own admin role" },
        { status: 400 }
      );
    }

    // Update MessMember role
    await prisma.messMember.update({
      where: {
        userId_messId: {
          userId: member.userId,
          messId: messContext.messId,
        },
      },
      data: { role },
    });

    return NextResponse.json({ success: true, role });
  } catch (error) {
    console.error("Error updating member role:", error);
    return NextResponse.json(
      { error: "Failed to update member role" },
      { status: 500 }
    );
  }
}
