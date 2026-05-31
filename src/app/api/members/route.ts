import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getMessContext } from "@/lib/mess-context";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const messContext = await getMessContext();
  if (!messContext) {
    return NextResponse.json({ error: "No mess selected" }, { status: 400 });
  }

  const members = await prisma.member.findMany({
    where: { messId: messContext.messId },
    include: {
      user: {
        select: { id: true, name: true, email: true, role: true },
      },
    },
    orderBy: { joinedAt: "asc" },
  });

  const memberIds = members.map((m) => m.userId);
  const messMembers = await prisma.messMember.findMany({
    where: {
      messId: messContext.messId,
      userId: { in: memberIds },
    },
    select: { userId: true, role: true },
  });

  const roleMap = new Map(messMembers.map((mm) => [mm.userId, mm.role]));

  const membersWithRole = members.map((member) => ({
    ...member,
    messRole: roleMap.get(member.userId) || "MEMBER",
  }));

  return NextResponse.json(membersWithRole);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const messContext = await getMessContext();
  if (!messContext) {
    return NextResponse.json({ error: "No mess selected" }, { status: 400 });
  }

  if (!messContext.canManage) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { name, email, phone, password } = body;

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: "name, email, and password are required" },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters long" },
      { status: 400 }
    );
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json(
      { error: "Invalid email format" },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already exists" }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 12);

  const member = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name,
        email,
        password: hashed,
        role: "MEMBER",
      },
    });

    const memberRecord = await tx.member.create({
      data: {
        userId: user.id,
        messId: messContext.messId,
        phone: phone ?? null,
      },
      include: { user: true },
    });

    await tx.messMember.create({
      data: {
        userId: user.id,
        messId: messContext.messId,
        role: "MEMBER",
      },
    });

    return memberRecord;
  });

  return NextResponse.json(member, { status: 201 });
}
