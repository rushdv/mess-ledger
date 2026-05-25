import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getMessContext } from "@/lib/mess-context";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// GET /api/members — list all members in current mess
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

  // Get MessMember roles for each member
  const memberIds = members.map((m) => m.userId);
  const messMembers = await prisma.messMember.findMany({
    where: {
      messId: messContext.messId,
      userId: { in: memberIds },
    },
    select: { userId: true, role: true },
  });

  const roleMap = new Map(messMembers.map((mm) => [mm.userId, mm.role]));

  // Add messRole to each member
  const membersWithRole = members.map((member) => ({
    ...member,
    messRole: roleMap.get(member.userId) || "MEMBER",
  }));

  return NextResponse.json(membersWithRole);
}

// POST /api/members — add a new member (admin only)
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

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already exists" }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      role: "MEMBER",
    },
  });

  // Create member in this mess
  const member = await prisma.member.create({
    data: {
      userId: user.id,
      messId: messContext.messId,
      phone: phone ?? null,
    },
    include: { user: true },
  });

  // Create MessMember
  await prisma.messMember.create({
    data: {
      userId: user.id,
      messId: messContext.messId,
      role: "MEMBER",
    },
  });

  return NextResponse.json(member, { status: 201 });
}
