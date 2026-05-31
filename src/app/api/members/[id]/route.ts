import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getMessContext } from "@/lib/mess-context";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const messContext = await getMessContext();
  if (!messContext) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { phone, isActive, defaultBreakfast, defaultLunch, defaultDinner } = body;

  const targetMember = await prisma.member.findUnique({
    where: { id: params.id, messId: messContext.messId },
  });

  if (!targetMember) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  const isSelf = targetMember.userId === session.user.id;
  const isAdmin = messContext.isMessAdmin;

  if (!isSelf && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const dataToUpdate: Record<string, unknown> = {};

  if (isAdmin) {
    if (phone !== undefined) dataToUpdate.phone = phone;
    if (isActive !== undefined) dataToUpdate.isActive = isActive;
  }

  if (defaultBreakfast !== undefined) dataToUpdate.defaultBreakfast = defaultBreakfast;
  if (defaultLunch !== undefined) dataToUpdate.defaultLunch = defaultLunch;
  if (defaultDinner !== undefined) dataToUpdate.defaultDinner = defaultDinner;

  try {
    const member = await prisma.member.update({
      where: { id: params.id },
      data: dataToUpdate,
      include: { user: true },
    });

    return NextResponse.json(member);
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to update member" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const messContext = await getMessContext();
  if (!messContext || !messContext.isMessAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const member = await prisma.member.update({
      where: { id: params.id, messId: messContext.messId },
      data: { isActive: false },
    });

    return NextResponse.json(member);
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to deactivate member" }, { status: 500 });
  }
}
