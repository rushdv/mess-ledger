import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, code, description } = body;

    if (!name || !code) {
      return NextResponse.json(
        { error: "Name and code are required" },
        { status: 400 }
      );
    }

    const existing = await prisma.mess.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (existing) {
      return NextResponse.json(
        { error: "This code is already taken" },
        { status: 400 }
      );
    }

    const mess = await prisma.$transaction(async (tx) => {
      const createdMess = await tx.mess.create({
        data: {
          name,
          code: code.toUpperCase(),
          description: description || null,
          createdBy: session.user.id,
        },
      });

      await tx.messMember.create({
        data: {
          userId: session.user.id,
          messId: createdMess.id,
          role: "ADMIN",
        },
      });

      await tx.member.create({
        data: {
          userId: session.user.id,
          messId: createdMess.id,
        },
      });

      return createdMess;
    });

    return NextResponse.json(mess);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create mess" }, { status: 500 });
  }
}
