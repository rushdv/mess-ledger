import { NextResponse } from "next/server";
import { getMessContext } from "@/lib/mess-context";

// GET /api/mess/context - Get current mess context
export async function GET() {
  try {
    const messContext = await getMessContext();
    
    if (!messContext) {
      return NextResponse.json(
        { error: "No mess selected" },
        { status: 400 }
      );
    }

    return NextResponse.json(messContext);
  } catch (error) {
    console.error("Error getting mess context:", error);
    return NextResponse.json(
      { error: "Failed to get mess context" },
      { status: 500 }
    );
  }
}
