import { NextResponse } from "next/server";
import { getPullRequestSignal } from "@/lib/github";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const prUrl = url.searchParams.get("url")?.trim();
  if (!prUrl) {
    return NextResponse.json({ error: "Missing ?url=<github-pull-request-url>" }, { status: 400 });
  }

  try {
    return NextResponse.json(await getPullRequestSignal(prUrl));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load GitHub PR" },
      { status: 400 },
    );
  }
}