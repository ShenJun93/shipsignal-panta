import { NextResponse } from "next/server";
import { parseDeadlineDays } from "@/lib/delivery-market";
import { buildSignalReport } from "@/lib/signal";

// One call for agents: repository evidence, matching Panta markets, comparison and a draft market.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const prUrl = (url.searchParams.get("pr") || url.searchParams.get("url"))?.trim();
  if (!prUrl) {
    return NextResponse.json({ error: "Missing ?pr=<github-pull-request-url>" }, { status: 400 });
  }

  try {
    return NextResponse.json(await buildSignalReport(prUrl, parseDeadlineDays(url.searchParams.get("days"))));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to build the signal" },
      { status: 400 },
    );
  }
}
