import type {
  DeliveryMarketDraft,
  MarketCreateQuote,
  MarketFeed,
  PantaError,
  PantaMarket,
  UnsignedCreateTransaction,
} from "@/lib/types";

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

// Carries Panta's error envelope ({ code, message, field | fields }) so callers can show what failed.
export class PantaApiError extends Error {
  constructor(public readonly detail: PantaError) {
    super(`Panta API ${detail.status}${detail.code ? ` ${detail.code}` : ""}: ${detail.message}`);
  }
}

export function pantaEnvironment(): MarketFeed["environment"] {
  if (!apiKey()) return "demo";
  return apiKey().startsWith("pk_test_") ? "test" : "production";
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
    let envelope: { code?: string; message?: string; field?: string; fields?: Record<string, string[]> } = {};
    try {
      envelope = JSON.parse(body);
    } catch {
      // Non-JSON error body; keep the raw text below.
    }
    throw new PantaApiError({
      status: response.status,
      code: envelope.code || null,
      message: (envelope.message || body).slice(0, 400),
      fields: envelope.fields || (envelope.field ? { [envelope.field]: [envelope.message || "invalid"] } : undefined),
    });
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
  const environment = pantaEnvironment();

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

// Step 1 of Panta's create flow: Panta validates the parameters and returns the USDC creation fee.
// ShipSignal stops here. Building, signing and broadcasting the create transaction stay with the
// creator's wallet.
export async function quoteMarketCreate(draft: DeliveryMarketDraft, wallet: string): Promise<MarketCreateQuote> {
  // Keep only the fields the product shows; Panta also returns account and key identifiers.
  const quote = await pantaFetch<MarketCreateQuote>("/markets/create/quote/", {
    method: "POST",
    body: JSON.stringify({
      wallet,
      question: draft.question,
      title: draft.title,
      description: draft.description,
      resolutionRule: draft.resolutionRule,
      sourcesOfTruth: draft.sourcesOfTruth,
      category: draft.category,
      marketType: draft.marketType,
      region: draft.region,
      startTime: draft.startTime,
      endTime: draft.endTime,
      resolutionTime: draft.resolutionTime,
      imageUrl: draft.imageUrl,
    }),
  });
  return {
    createId: quote.createId,
    expectedEventPda: quote.expectedEventPda,
    paymentUsdc: quote.paymentUsdc,
    liquidityInjectionUsdc: quote.liquidityInjectionUsdc,
    platformRevenueUsdc: quote.platformRevenueUsdc,
    marketType: quote.marketType,
    expiresAt: quote.expiresAt,
    disclaimer: quote.disclaimer,
  };
}

// Step 2: Panta returns the unsigned create transaction for the quoted session. The creator's
// wallet signs and broadcasts it; ShipSignal only passes it through.
export async function buildMarketCreate(createId: string, wallet: string): Promise<UnsignedCreateTransaction> {
  const built = await pantaFetch<{
    transaction: string;
    recentBlockhash: string;
    lastValidBlockHeight: number;
    blockhashExpiryHintSec?: number;
    derived?: Record<string, string>;
    disclaimer?: string;
  }>("/markets/create/build/", {
    method: "POST",
    body: JSON.stringify({ createId, wallet }),
  });
  return {
    transaction: built.transaction,
    transactionBytes: Buffer.from(built.transaction || "", "base64").length,
    recentBlockhash: built.recentBlockhash,
    lastValidBlockHeight: built.lastValidBlockHeight,
    blockhashExpiryHintSec: built.blockhashExpiryHintSec ?? null,
    derived: built.derived || {},
    disclaimer: built.disclaimer,
  };
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