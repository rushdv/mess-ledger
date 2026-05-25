import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getMessContext } from "@/lib/mess-context";
import { prisma } from "@/lib/prisma";

// PATCH /api/members/:id — update member (admin only)
export async function PATCH(
  req: NextRequest,
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

  const body = await req.json();
  const { phone, isActive } = body;

  const member = await prisma.member.update({
    where: { id: params.id, messId: messContext.messId },
    data: {
      ...(phone !== undefined && { phone }),
      ...(isActive !== undefined && { isActive }),
    },
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
