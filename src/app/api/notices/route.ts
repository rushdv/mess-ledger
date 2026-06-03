import { getSession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";


import { getMessContext } from "@/lib/mess-context";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const NoticeSchema = z.object({
  content: z.string().min(1, "Content is required"),
  expiresAt: z.string().min(1).optional(),
});

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const messContext = await getMessContext();
  if (!messContext) return NextResponse.json({ error: "No mess selected" }, { status: 400 });

  // Only return active notices or all if no expiresAt
  const notices = await prisma.notice.findMany({
    where: {
      messId: messContext.messId,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } }
      ]
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(notices);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const messContext = await getMessContext();
  if (!messContext || !messContext.canManage) {
    return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
  }

  const raw = await req.json();
  const parsed = NoticeSchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  const { content, expiresAt } = parsed.data;

  const notice = await prisma.notice.create({
    data: {
      messId: messContext.messId,
      authorId: session.user.id,
      content,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
  });

  return NextResponse.json(notice, { status: 201 });
}
