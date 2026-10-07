import { draftDeliveryMarket, matchMarketsToPullRequest } from "@/lib/delivery-market";
import { getPullRequestSignal } from "@/lib/github";
import { getMarketFeed } from "@/lib/panta";
import type { DeliveryMarketDraft, GitHubPullRequestSignal, MarketMatch, PantaMarket } from "@/lib/types";

// Market images must be on a public host; Panta rejects localhost and protected preview URLs.
export function publicOrigin() {
  return process.env.SHIPSIGNAL_PUBLIC_ORIGIN?.trim() || "https://shipsignal-panta.vercel.app";
}

export function toProbability(value?: string | null) {
  if (!value) return null;
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  return Math.round(numeric * 100);
}

export type Comparison = {
  market: PantaMarket;
  basis: MarketMatch["reason"] | "user-linked";
  deliveryScore: number;
  crowdProbability: number;
  gap: number;
  interpretation: string;
};

export function compare(
  pr: GitHubPullRequestSignal,
  market: PantaMarket,
  basis: Comparison["basis"],
): Comparison | null {
  const crowdProbability = toProbability(market.yesPrice);
  if (crowdProbability === null) return null;
  const gap = Math.abs(crowdProbability - pr.deliveryScore);
  const direction =
    pr.deliveryScore > crowdProbability
      ? "Repository evidence is ahead of the crowd."
      : "The crowd is more confident than the repository evidence.";
  const interpretation =
    gap >= 25
      ? `Large disagreement (${gap} pt). ${direction}`
      : gap >= 10
        ? `Moderate disagreement (${gap} pt). ${direction} Worth a human or agent review.`
        : `Signals broadly agree (${gap} pt).`;
  return { market, basis, deliveryScore: pr.deliveryScore, crowdProbability, gap, interpretation };
}

export type SignalReport = {
  pullRequest: GitHubPullRequestSignal;
  panta: {
    environment: "production" | "test" | "demo";
    notice?: string;
    marketsScanned: number;
    matches: MarketMatch[];
  };
  comparison: Comparison | null;
  draft: DeliveryMarketDraft | null;
  nextStep: string;
};

export async function buildSignalReport(prUrl: string, deadlineDays: number): Promise<SignalReport> {
  const [pullRequest, feed] = await Promise.all([getPullRequestSignal(prUrl), getMarketFeed({ limit: 50 })]);
  const matches = matchMarketsToPullRequest(feed.items, pullRequest);
  const best = matches.find((match) => match.reason === "pull-request") || matches[0];
  const comparison = best ? compare(pullRequest, best.market, best.reason) : null;
  const draft = draftDeliveryMarket(pullRequest, { deadlineDays, origin: publicOrigin() });

  const nextStep = comparison
    ? "Compare the crowd with the repository evidence; a large gap is a review signal."
    : draft
      ? "No Panta market tracks this pull request yet. Quote the drafted market with POST /api/market-draft; the creator's wallet builds, signs and broadcasts it through Panta."
      : "This pull request is closed, so there is nothing left to forecast.";

  return {
    pullRequest,
    panta: {
      environment: feed.environment,
      notice: feed.notice,
      marketsScanned: feed.items.length,
      matches,
    },
    comparison,
    draft,
    nextStep,
  };
}
