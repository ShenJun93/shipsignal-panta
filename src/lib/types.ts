export type PantaMarket = {
  marketId: string;
  category: string | null;
  title: string;
  description: string;
  phase: "primary" | "secondary" | "resolved" | "cancelled" | string;
  marketType?: string | null;
  startTime?: number | null;
  endTime?: number | null;
  resolutionTime?: number | null;
  region?: string | null;
  resolved?: boolean;
  status?: string | null;
  volumeUsdc?: string | null;
  campaignId?: string | null;
  createdByPartner?: boolean;
  yesPrice?: string | null;
  noPrice?: string | null;
  primaryYesPrice?: string | null;
  primaryNoPrice?: string | null;
  secondaryYesPrice?: string | null;
  secondaryNoPrice?: string | null;
};

export type MarketFeed = {
  mode: "live" | "demo";
  environment: "production" | "test" | "demo";
  source: "panta";
  fetchedAt: string;
  items: PantaMarket[];
  nextCursor: string | null;
  notice?: string;
};

export type GitHubPullRequestSignal = {
  source: "github";
  fetchedAt: string;
  url: string;
  repository: string;
  number: number;
  title: string;
  state: string;
  draft: boolean;
  mergeable: boolean | null;
  mergeableState: string | null;
  comments: number;
  reviewComments: number;
  changedFiles: number;
  additions: number;
  deletions: number;
  commits: number;
  createdAt: string;
  updatedAt: string;
  headSha: string;
  baseSha: string;
  author: string;
  labels: string[];
  deliveryScore: number;
  deliveryLabel: "strong" | "mixed" | "blocked";
  evidence: string[];
};

export type DecisionSignal = {
  repositorySignal: GitHubPullRequestSignal | null;
  market: PantaMarket | null;
  crowdProbability: number | null;
  deliveryScore: number | null;
  disagreement: number | null;
  interpretation: string;
};

// A Panta market whose text names the pull request or its repository.
export type MarketMatch = {
  market: PantaMarket;
  reason: "pull-request" | "repository";
};

// Body of POST /markets/create/quote/ minus the wallet, built from repository evidence.
export type DeliveryMarketDraft = {
  question: string;
  title: string;
  description: string;
  resolutionRule: string;
  sourcesOfTruth: string[];
  category: "other";
  marketType: "standard";
  region: "Global";
  startTime: number;
  endTime: number;
  resolutionTime: number;
  imageUrl: string;
  deadlineDays: number;
  shipSignalPrior: number;
};

export type MarketCreateQuote = {
  createId: string;
  expectedEventPda: string;
  paymentUsdc: string;
  liquidityInjectionUsdc: string;
  platformRevenueUsdc: string;
  marketType?: string;
  expiresAt: string;
};

export type PantaError = {
  status: number;
  code: string | null;
  message: string;
  fields?: Record<string, string[]>;
};