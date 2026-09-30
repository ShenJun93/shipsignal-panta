import { NextResponse } from "next/server";
import { getMarketFeed } from "@/lib/panta";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get("category") || undefined;
    const status = url.searchParams.get("status") || undefined;
    const limitRaw = Number(url.searchParams.get("limit") || "20");
    const limit = Number.isFinite(limitRaw) ? limitRaw : 20;
    const feed = await getMarketFeed({ category, status, limit });
    return NextResponse.json(feed);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load Panta markets" },
      { status: 502 },
    );
  }
}