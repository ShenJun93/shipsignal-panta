import { NextResponse } from "next/server";
import { draftDeliveryMarket, parseDeadlineDays } from "@/lib/delivery-market";
import { getPullRequestSignal } from "@/lib/github";
import { PantaApiError, pantaEnvironment, quoteMarketCreate } from "@/lib/panta";
import { publicOrigin } from "@/lib/signal";

// Panta's sandbox fixture creator, used only with pk_test_ keys when no wallet is given.
const SANDBOX_CREATOR = "Creator1111111111111111111111111111111";
const BASE58_PUBKEY = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

// Drafts a delivery market for an open pull request and asks Panta to quote it (validate + fee).
// Nothing is signed or broadcast here.
export async function POST(request: Request) {
  let body: { pr?: string; days?: number; wallet?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected a JSON body" }, { status: 400 });
  }

  const prUrl = body.pr?.trim();
  if (!prUrl) return NextResponse.json({ error: "Missing pr" }, { status: 400 });

  const environment = pantaEnvironment();
  const wallet = body.wallet?.trim() || (environment === "test" ? SANDBOX_CREATOR : "");
  if (!wallet) {
    return NextResponse.json({ error: "A creator wallet address is required outside the Panta sandbox" }, { status: 400 });
  }
  if (!BASE58_PUBKEY.test(wallet)) {
    return NextResponse.json({ error: "The wallet must be a base58 Solana public address" }, { status: 400 });
  }

  try {
    const pullRequest = await getPullRequestSignal(prUrl);
    const draft = draftDeliveryMarket(pullRequest, {
      deadlineDays: parseDeadlineDays(body.days),
      origin: publicOrigin(),
    });
    if (!draft) {
      return NextResponse.json({ error: "This pull request is closed, so there is nothing to forecast" }, { status: 400 });
    }

    const result = { environment, wallet, walletIsSandboxFixture: wallet === SANDBOX_CREATOR, draft };
    try {
      return NextResponse.json({ ...result, quote: await quoteMarketCreate(draft, wallet), pantaError: null });
    } catch (error) {
      if (error instanceof PantaApiError) {
        return NextResponse.json({ ...result, quote: null, pantaError: error.detail });
      }
      throw error;
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to draft the market" },
      { status: 502 },
    );
  }
}
