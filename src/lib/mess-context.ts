import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export interface MessContext {
  messId: string;
  messName: string;
  messCode: string;
  userId: string;
  userRole: string; // ADMIN | MODERATOR | MEMBER in this mess
  isMessAdmin: boolean;
  isMessModerator: boolean;
  canManage: boolean; // true for ADMIN and MODERATOR
}

/**
 * Get the current mess context for the logged-in user
 * Reads from cookie "selectedMessId" or returns first mess if not set
 */
export async function getMessContext(): Promise<MessContext | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }

  const cookieStore = cookies();
  const selectedMessId = cookieStore.get("selectedMessId")?.value;

  // Find user's mess memberships
  const messMembers = await prisma.messMember.findMany({
    where: {
      userId: session.user.id,
      isActive: true,
    },
    include: {
      mess: true,
    },
    orderBy: {
      joinedAt: "desc",
    },
  });

  if (messMembers.length === 0) {
    return null;
  }

  // Use selected mess or first mess
  let messMember = messMembers.find((mm) => mm.messId === selectedMessId);
  if (!messMember) {
    messMember = messMembers[0];
  }

  return {
    messId: messMember.messId,
    messName: messMember.mess.name,
    messCode: messMember.mess.code,
    userId: session.user.id,
    userRole: messMember.role,
    isMessAdmin: messMember.role === "ADMIN",
    isMessModerator: messMember.role === "MODERATOR",
    canManage: messMember.role === "ADMIN" || messMember.role === "MODERATOR",
  };
}

/**
 * Get all messes the user is a member of
 */
export async function getUserMesses() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return [];
  }

  const messMembers = await prisma.messMember.findMany({
    where: {
      userId: session.user.id,
      isActive: true,
    },
    include: {
      mess: true,
    },
    orderBy: {
      joinedAt: "desc",
    },
  });

  return messMembers.map((mm) => ({
    id: mm.mess.id,
    name: mm.mess.name,
    code: mm.mess.code,
    description: mm.mess.description,
    role: mm.role,
    joinedAt: mm.joinedAt,
  }));
}
