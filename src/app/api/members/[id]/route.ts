import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getMessContext } from "@/lib/mess-context";
import { prisma } from "@/lib/prisma";

// PATCH /api/members/:id — update member (admin can update all, user can update own defaults)
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

  const dataToUpdate: any = {};

  // Only admin can change phone or active status
  if (isAdmin) {
    if (phone !== undefined) dataToUpdate.phone = phone;
    if (isActive !== undefined) dataToUpdate.isActive = isActive;
  }

  // Self or admin can change default meals
  if (defaultBreakfast !== undefined) dataToUpdate.defaultBreakfast = defaultBreakfast;
  if (defaultLunch !== undefined) dataToUpdate.defaultLunch = defaultLunch;
  if (defaultDinner !== undefined) dataToUpdate.defaultDinner = defaultDinner;

  const member = await prisma.member.update({
    where: { id: params.id },
    data: dataToUpdate,
    include: { user: true },
  });

  return NextResponse.json(member);
}

// DELETE /api/members/:id — deactivate member (admin only)
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

  const member = await prisma.member.update({
    where: { id: params.id, messId: messContext.messId },
    data: { isActive: false },
  });

  return NextResponse.json(member);
}
