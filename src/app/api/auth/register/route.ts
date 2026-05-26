import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create the user
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: "MEMBER",
      },
    });

    // Auto-join first available mess or demo mess if exists
    const demoMess = await prisma.mess.findFirst({
      where: { code: "DEMO2024" },
    });

    if (demoMess) {
      // Create MessMember junction record
      await prisma.messMember.create({
        data: {
          userId: user.id,
          messId: demoMess.id,
          role: "MEMBER",
        },
      });

      // Create Member record
      await prisma.member.create({
        data: {
          userId: user.id,
          messId: demoMess.id,
        },
      });
      console.log(`Auto-joined new user ${email} to demo mess DEMO2024`);
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error during registration" },
      { status: 500 }
    );
  }
}
