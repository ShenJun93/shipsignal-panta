import type { DeliveryMarketDraft, GitHubPullRequestSignal, MarketMatch, PantaMarket } from "@/lib/types";

export const DEADLINE_OPTIONS = [7, 14, 30] as const;

// Panta requires startTime at least minimumStartDelay (typically 3600 s) ahead of now.
const START_DELAY_SECONDS = 2 * 3600;
const RESOLUTION_GRACE_SECONDS = 3600;

function isoDate(unixSeconds: number) {
  return new Date(unixSeconds * 1000).toISOString().slice(0, 10);
}

function isoMinute(unixSeconds: number) {
  return `${new Date(unixSeconds * 1000).toISOString().slice(0, 16).replace("T", " ")} UTC`;
}

function clip(value: string, max: number) {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

// Only a market that names this pull request (or at least its repository) can be compared with it.
export function matchMarketsToPullRequest(markets: PantaMarket[], pr: GitHubPullRequestSignal): MarketMatch[] {
  const repo = pr.repository.toLowerCase();
  const prUrl = `github.com/${repo}/pull/${pr.number}`;
  const prTokens = [`#${pr.number}`, `pr ${pr.number}`, `pull request ${pr.number}`];

  const matches: MarketMatch[] = [];
  for (const market of markets) {
    const text = `${market.title} ${market.description}`.toLowerCase();
    if (text.includes(prUrl) || (text.includes(repo) && prTokens.some((token) => text.includes(token)))) {
      matches.push({ market, reason: "pull-request" });
    } else if (text.includes(repo)) {
      matches.push({ market, reason: "repository" });
    }
  }
  return matches.sort((a, b) => (a.reason === b.reason ? 0 : a.reason === "pull-request" ? -1 : 1));
}

// Turns an open pull request into the parameters of a Panta market that resolves from GitHub.
export function draftDeliveryMarket(
  pr: GitHubPullRequestSignal,
  options: { deadlineDays: number; origin: string; now?: number },
): DeliveryMarketDraft | null {
  if (pr.state !== "open") return null;

  const now = Math.floor((options.now ?? Date.now()) / 1000);
  const startTime = Math.ceil((now + START_DELAY_SECONDS) / 3600) * 3600;
  // The deadline is the end of the UTC day, `deadlineDays` after the market opens.
  const deadlineDay = Math.floor((startTime + options.deadlineDays * 86_400) / 86_400);
  const endTime = deadlineDay * 86_400 + 86_399;
  const resolutionTime = endTime + RESOLUTION_GRACE_SECONDS;
  const deadline = isoDate(endTime);
  const apiUrl = `https://api.github.com/repos/${pr.repository}/pulls/${pr.number}`;

  const question = clip(`Will ${pr.repository} PR #${pr.number} be merged by ${deadline}?`, 512);
  const resolutionRule = clip(
    [
      `Resolves YES if GitHub reports pull request ${pr.url} as merged (a non-null merged_at at ${apiUrl}) at or before ${isoMinute(endTime)}.`,
      "Resolves NO if it is not merged by then, including if it is closed without merging.",
      "Changes that reach the base branch through a different pull request do not count.",
    ].join(" "),
    2048,
  );
  const description = clip(
    [
      `Pull request: "${pr.title}" by ${pr.author}.`,
      `When this market was drafted ShipSignal scored its delivery evidence ${pr.deliveryScore}/100 (${pr.deliveryLabel}): ${pr.evidence.join(" ")}`,
    ].join(" "),
    1000,
  );

  return {
    question,
    title: clip(`${pr.repository} #${pr.number} merged by ${deadline}?`, 200),
    description,
    resolutionRule,
    sourcesOfTruth: [pr.url, apiUrl],
    category: "other",
    marketType: "standard",
    region: "Global",
    startTime,
    endTime,
    resolutionTime,
    imageUrl: `${options.origin.replace(/\/$/, "")}/market-image.png`,
    deadlineDays: options.deadlineDays,
    shipSignalPrior: pr.deliveryScore,
  };
}

export function parseDeadlineDays(value: unknown) {
  const days = Number(value);
  return (DEADLINE_OPTIONS as readonly number[]).includes(days) ? days : 14;
}

export function usdc(baseUnits: string | null | undefined) {
  const value = Number(baseUnits);
  if (!Number.isFinite(value)) return "—";
  return `${(value / 1_000_000).toLocaleString("en-US", { maximumFractionDigits: 2 })} USDC`;
}
