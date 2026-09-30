import type { MarketFeed, PantaMarket } from "@/lib/types";

const DEMO_MARKETS: PantaMarket[] = [
  {
    marketId: "demo-solana-upgrade",
    category: "crypto",
    title: "Will a major Solana protocol upgrade ship before year end?",
    description: "Demo fixture used only when no Panta API credential is configured.",
    phase: "primary",
    region: "Global",
    resolved: false,
    status: "demo",
    volumeUsdc: "0",
    yesPrice: "0.64",
    noPrice: "0.36",
  },
  {
    marketId: "demo-crypto-launch",
    category: "crypto",
    title: "Will the referenced crypto product launch on schedule?",
    description: "Demo fixture. Connect a Panta API key for live catalog data.",
    phase: "primary",
    region: "Global",
    resolved: false,
    status: "demo",
    volumeUsdc: "0",
    yesPrice: "0.52",
    noPrice: "0.48",
  },
];

function apiBase() {
  return (process.env.PANTA_API_BASE_URL || "https://live-api.panta.market/api/v1").replace(/\/$/, "");
}

function apiKey() {
  return process.env.PANTA_API_KEY?.trim() || "";
}

async function pantaFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const key = apiKey();
  if (!key) throw new Error("PANTA_API_KEY is not configured");

  const response = await fetch(`${apiBase()}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "X-Api-Key": key,
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(init?.headers || {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Panta API ${response.status}: ${body.slice(0, 400)}`);
  }

  return response.json() as Promise<T>;
}

export async function getMarketFeed(options?: {
  category?: string;
  status?: string;
  limit?: number;
}): Promise<MarketFeed> {
  if (!apiKey()) {
    return {
      mode: "demo",
      environment: "demo",
      source: "panta",
      fetchedAt: new Date().toISOString(),
      items: DEMO_MARKETS,
      nextCursor: null,
      notice: "Demo fixtures — configure PANTA_API_KEY for live Panta market data.",
    };
  }

  const params = new URLSearchParams();
  if (options?.category) params.set("category", options.category);
  if (options?.status) params.set("status", options.status);
  params.set("limit", String(Math.min(Math.max(options?.limit || 20, 1), 50)));

  const data = await pantaFetch<{ items: PantaMarket[]; nextCursor?: string | null }>(
    `/markets/?${params.toString()}`,
  );
  const environment = apiKey().startsWith("pk_test_") ? "test" : "production";

  return {
    mode: "live",
    environment,
    source: "panta",
    fetchedAt: new Date().toISOString(),
    items: data.items || [],
    nextCursor: data.nextCursor || null,
    notice:
      environment === "test"
        ? "Authenticated Panta test API — sandbox market data, not mainnet."
        : undefined,
  };
}

export async function getMarket(marketId: string): Promise<PantaMarket> {
  if (!apiKey()) {
    const fixture = DEMO_MARKETS.find((item) => item.marketId === marketId);
    if (!fixture) throw new Error("Demo market not found");
    return fixture;
  }
  return pantaFetch<PantaMarket>(`/markets/${encodeURIComponent(marketId)}/`);
}

export async function quotePrimaryBuy(input: {
  wallet: string;
  marketId: string;
  side: "yes" | "no";
  amountUsdc: string;
  userId?: string;
}) {
  return pantaFetch<{
    quoteId: string;
    marketId: string;
    side: string;
    amountUsdc: string;
    shares: string;
    avgPrice: string;
    feeUsdc: string;
    expiresAt: string;
  }>("/primaryorderquote/", {
    method: "POST",
    body: JSON.stringify(input),
  });
}