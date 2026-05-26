// This route is no longer used. Authentication is handled by NextAuth at /api/auth/[...nextauth]
// Kept as a stub to avoid 404 errors from any cached references.
import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export function POST() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
