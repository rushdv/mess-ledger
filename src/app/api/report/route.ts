import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getMessContext } from "@/lib/mess-context";
import { calculateMonthly, saveMonthlyReport } from "@/lib/calculations";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const messContext = await getMessContext();
  if (!messContext) {
    return NextResponse.json({ error: "No mess selected" }, { status: 400 });
  }

  const { searchParams } = new URL(req.url);
  const month = parseInt(searchParams.get("month") ?? String(new Date().getMonth() + 1));
  const year = parseInt(searchParams.get("year") ?? String(new Date().getFullYear()));

  const calc = await calculateMonthly(month, year, messContext.messId);
  return NextResponse.json(calc);
}

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
  const { month, year } = body;

  if (!month || !year || typeof month !== "number" || typeof year !== "number") {
    return NextResponse.json(
      { error: "month and year are required and must be numbers" },
      { status: 400 }
    );
  }

  if (month < 1 || month > 12 || year < 2000 || year > 2100) {
    return NextResponse.json(
      { error: "month must be 1-12 and year must be 2000-2100" },
      { status: 400 }
    );
  }

  const calc = await calculateMonthly(month, year, messContext.messId);
  await saveMonthlyReport(calc, messContext.messId);

  return NextResponse.json(calc);
}
