import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/mess/create - Create a new mess
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    console.log("=== Create Mess API ===");
    console.log("Session:", session);
    console.log("User ID:", session?.user?.id);
    
    if (!session?.user?.id) {
      console.log("ERROR: No user ID in session");
      return NextResponse.json({ error: "Unauthorized - No user ID" }, { status: 401 });
    }

    const body = await req.json();
    console.log("Request body:", body);
    
    const { name, code, description } = body;

    if (!name || !code) {
      console.log("ERROR: Missing name or code");
      return NextResponse.json(
        { error: "Name and code are required" },
        { status: 400 }
      );
    }

    // Check if code already exists
    const existing = await prisma.mess.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (existing) {
      console.log("ERROR: Code already exists:", code);
      return NextResponse.json(
        { error: "This code is already taken" },
        { status: 400 }
      );
    }

    console.log("Creating mess...");
    
    // Create mess
    const mess = await prisma.mess.create({
      data: {
        name,
        code: code.toUpperCase(),
        description: description || null,
        createdBy: session.user.id,
      },
    });

    console.log("Mess created:", mess.id);

    // Add creator as admin
    await prisma.messMember.create({
      data: {
        userId: session.user.id,
        messId: mess.id,
        role: "ADMIN",
      },
    });

    console.log("MessMember created");

    // Create Member record
    await prisma.member.create({
      data: {
        userId: session.user.id,
        messId: mess.id,
      },
    });

    console.log("Member record created");
    console.log("=== Success ===");

    return NextResponse.json(mess);
  } catch (error: any) {
    console.error("=== ERROR creating mess ===");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("Full error:", error);
    return NextResponse.json({ 
      error: "Failed to create mess", 
      details: error.message 
    }, { status: 500 });
  }
}
