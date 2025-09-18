import { NextResponse } from "next/server";
import { fetchNews } from "@/lib/api/news";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol") || undefined;
  try {
    const items = await fetchNews(symbol || undefined);
    return NextResponse.json({ items });
  } catch (e) {
    console.error("news route error", e);
    return NextResponse.json({ error: "news_failed" }, { status: 500 });
  }
}
