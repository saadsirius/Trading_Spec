import { NextResponse } from "next/server";
import { fetchCalendar } from "@/src/lib/api/calendar";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol") || undefined;
  try {
    const items = await fetchCalendar(symbol);
    return NextResponse.json({ items });
  } catch (e) {
    console.error("calendar route error", e);
    return NextResponse.json({ error: "calendar_failed" }, { status: 500 });
  }
}
