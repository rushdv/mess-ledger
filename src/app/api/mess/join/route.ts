export const dynamic = "force-dynamic";
import { getSession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";


import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }

    const mess = await prisma.mess.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!mess) {
      return NextResponse.json({ error: "Mess not found" }, { status: 404 });
    }

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
        await prisma.$transaction(async (tx) => {
          await tx.messMember.update({
            where: { id: existing.id },
            data: { isActive: true },
          });
          await tx.member.updateMany({
            where: { userId: session.user.id, messId: mess.id },
            data: { isActive: true },
          });
        });
        return NextResponse.json(mess);
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.messMember.create({
        data: {
          userId: session.user.id,
          messId: mess.id,
          role: "MEMBER",
        },
      });

      await tx.member.create({
        data: {
          userId: session.user.id,
          messId: mess.id,
        },
      });
    });

    return NextResponse.json(mess);
  } catch (error) {
    return NextResponse.json({ error: "Failed to join mess" }, { status: 500 });
  }
}
