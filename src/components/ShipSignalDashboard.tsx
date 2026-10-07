"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { DEADLINE_OPTIONS, usdc } from "@/lib/delivery-market";
import type { Comparison, SignalReport } from "@/lib/signal";
import type { DeliveryMarketDraft, MarketCreateQuote, MarketFeed, PantaError } from "@/lib/types";

const EXAMPLE_PRS = [
  { label: "Anchor · transaction v1 buffers", url: "https://github.com/otter-sec/anchor/pull/5095" },
  { label: "Agave · Alpenglow in test validator", url: "https://github.com/anza-xyz/agave/pull/15665" },
  { label: "Anchor · v2.0.0-rc.2", url: "https://github.com/otter-sec/anchor/pull/5150" },
];
const DEFAULT_PR = EXAMPLE_PRS[0].url;

type QuoteResult = {
  environment: MarketFeed["environment"];
  wallet: string;
  walletIsSandboxFixture: boolean;
  draft: DeliveryMarketDraft;
  quote: MarketCreateQuote | null;
  pantaError: PantaError | null;
};

function toProbability(value?: string | null) {
  if (!value) return null;
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  return Math.round(numeric * 100);
}

function pct(value: number | null) {
  return value === null ? "—" : `${value}%`;
}

function truncate(value: string, max = 132) {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

function signalTone(score: number | null) {
  if (score === null) return "text-slate-400";
  if (score >= 75) return "text-emerald-300";
  if (score >= 45) return "text-amber-300";
  return "text-rose-300";
}

function utc(unixSeconds: number) {
  return `${new Date(unixSeconds * 1000).toISOString().slice(0, 16).replace("T", " ")} UTC`;
}

function shortAddress(value: string) {
  return value.length > 16 ? `${value.slice(0, 6)}…${value.slice(-6)}` : value;
}

const BASIS_LABEL: Record<Comparison["basis"], string> = {
  "pull-request": "Market names this pull request",
  repository: "Market names this repository",
  "user-linked": "Linked by you — ShipSignal did not verify that this market is about this PR",
};

function compareClient(report: SignalReport, market: MarketFeed["items"][number]): Comparison | null {
  const crowdProbability = toProbability(market.yesPrice);
  if (crowdProbability === null) return null;
  const deliveryScore = report.pullRequest.deliveryScore;
  const gap = Math.abs(crowdProbability - deliveryScore);
  const direction =
    deliveryScore > crowdProbability
      ? "Repository evidence is ahead of the crowd."
      : "The crowd is more confident than the repository evidence.";
  const interpretation =
    gap >= 25
      ? `Large disagreement (${gap} pt). ${direction}`
      : gap >= 10
        ? `Moderate disagreement (${gap} pt). ${direction} Worth a human or agent review.`
        : `Signals broadly agree (${gap} pt).`;
  return { market, basis: "user-linked", deliveryScore, crowdProbability, gap, interpretation };
}

export default function ShipSignalDashboard() {
  const [prUrl, setPrUrl] = useState(DEFAULT_PR);
  const [deadlineDays, setDeadlineDays] = useState<number>(14);
  const [report, setReport] = useState<SignalReport | null>(null);
  const [feed, setFeed] = useState<MarketFeed | null>(null);
  const [selectedMarketId, setSelectedMarketId] = useState<string | null>(null);
  const [linkedMarketId, setLinkedMarketId] = useState<string | null>(null);
  const [loadingPr, setLoadingPr] = useState(false);
  const [loadingMarkets, setLoadingMarkets] = useState(true);
  const [prError, setPrError] = useState("");
  const [marketError, setMarketError] = useState("");
  const [wallet, setWallet] = useState("");
  const [quoting, setQuoting] = useState(false);
  const [quoteResult, setQuoteResult] = useState<QuoteResult | null>(null);
  const [quoteError, setQuoteError] = useState("");
  const [copied, setCopied] = useState(false);

  const pr = report?.pullRequest ?? null;

  useEffect(() => {
    let cancelled = false;

    async function loadMarkets() {
      setLoadingMarkets(true);
      setMarketError("");
      try {
        const response = await fetch("/api/markets?limit=50");
        const data = (await response.json()) as MarketFeed & { error?: string };
        if (!response.ok) throw new Error(data.error || "Unable to load market feed");
        if (cancelled) return;
        setFeed(data);
        setSelectedMarketId(data.items[0]?.marketId || null);
      } catch (error) {
        if (!cancelled) {
          setMarketError(error instanceof Error ? error.message : "Unable to load market feed");
        }
      } finally {
        if (!cancelled) setLoadingMarkets(false);
      }
    }

    loadMarkets();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadSignal = useCallback(async (url: string, days: number) => {
    setLoadingPr(true);
    setPrError("");
    setQuoteResult(null);
    setQuoteError("");
    try {
      const response = await fetch(`/api/signal?pr=${encodeURIComponent(url.trim())}&days=${days}`);
      const data = (await response.json()) as SignalReport & { error?: string };
      if (!response.ok) throw new Error(data.error || "Unable to analyze pull request");
      setReport(data);
      setLinkedMarketId(null);
      const match = data.panta.matches[0];
      if (match) setSelectedMarketId(match.market.marketId);
    } catch (error) {
      setReport(null);
      setPrError(error instanceof Error ? error.message : "Unable to analyze pull request");
    } finally {
      setLoadingPr(false);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("demo") !== "1") return;
    // Deferred so the demo load does not set state synchronously inside the effect.
    const timer = window.setTimeout(() => loadSignal(DEFAULT_PR, 14), 0);
    return () => window.clearTimeout(timer);
  }, [loadSignal]);

  const matchReason = useMemo(() => {
    const reasons = new Map<string, string>();
    for (const match of report?.panta.matches || []) reasons.set(match.market.marketId, match.reason);
    return reasons;
  }, [report]);

  const comparison = useMemo<Comparison | null>(() => {
    if (!report) return null;
    if (report.comparison) return report.comparison;
    const linked = feed?.items.find((market) => market.marketId === linkedMarketId);
    return linked ? compareClient(report, linked) : null;
  }, [report, feed, linkedMarketId]);

  const selectedIsMatched = selectedMarketId ? matchReason.has(selectedMarketId) : false;

  function analyzePullRequest(event?: FormEvent) {
    event?.preventDefault();
    loadSignal(prUrl, deadlineDays);
  }

  function changeDeadline(days: number) {
    setDeadlineDays(days);
    if (report) loadSignal(report.pullRequest.url, days);
  }

  async function quoteDraft() {
    if (!report) return;
    setQuoting(true);
    setQuoteError("");
    setQuoteResult(null);
    try {
      const response = await fetch("/api/market-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pr: report.pullRequest.url, days: deadlineDays, wallet: wallet.trim() || undefined }),
      });
      const data = (await response.json()) as QuoteResult & { error?: string };
      if (!response.ok) throw new Error(data.error || "Unable to quote the market");
      setQuoteResult(data);
    } catch (error) {
      setQuoteError(error instanceof Error ? error.message : "Unable to quote the market");
    } finally {
      setQuoting(false);
    }
  }

  async function copyDraft(draft: DeliveryMarketDraft) {
    const { deadlineDays: _days, shipSignalPrior: _prior, ...request } = draft;
    void _days;
    void _prior;
    try {
      await navigator.clipboard.writeText(JSON.stringify({ wallet: "<creator wallet>", ...request }, null, 2));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  const draft = quoteResult?.draft || report?.draft || null;

  return (
    <main className="min-h-screen bg-[#071018] text-slate-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-12rem] top-[-9rem] h-[34rem] w-[34rem] rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute right-[-10rem] top-[18rem] h-[28rem] w-[28rem] rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-5 border-b border-white/10 pb-7 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl border border-cyan-300/30 bg-cyan-300/10 font-mono text-sm font-bold text-cyan-200">
              SS
            </div>
            <div>
              <div className="text-lg font-semibold tracking-tight">ShipSignal</div>
              <div className="text-xs text-slate-500">Engineering delivery intelligence</div>
            </div>
          </div>
          <a
            className="w-fit rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-medium text-slate-300 transition hover:border-cyan-300/40 hover:text-white"
            href="https://panta.market"
            target="_blank"
            rel="noreferrer"
          >
            Powered by Panta
          </a>
        </header>

        <section className="grid gap-8 py-12 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/[0.06] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-emerald-200">
              Repo evidence × market belief
            </div>
            <h1 className="max-w-4xl text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
              Turn a pull request into a market the crowd can price.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
              ShipSignal scores a GitHub pull request from its delivery evidence, looks for a Panta market that
              tracks it, and when none exists drafts one that resolves from GitHub, quoted by Panta and ready for
              the creator&apos;s wallet to sign.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-white/[0.025] p-2">
            {[
              ["01", "Observe", "Repository evidence"],
              ["02", "Match", "Panta markets on this PR"],
              ["03", "Draft", "A market Panta can quote"],
            ].map(([step, title, note]) => (
              <div key={step} className="rounded-xl border border-white/[0.06] bg-[#0a151f] p-4">
                <div className="font-mono text-[10px] text-cyan-300">{step}</div>
                <div className="mt-5 text-sm font-medium text-white">{title}</div>
                <div className="mt-1 text-[11px] leading-4 text-slate-500">{note}</div>
              </div>
            ))}
          </div>
        </section>

        <section id="evidence" className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="rounded-2xl border border-white/10 bg-[#0a151f]/90 p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-medium text-white">Repository evidence</div>
                <div className="mt-1 text-xs text-slate-500">Live public GitHub pull-request telemetry</div>
              </div>
              <span className="rounded-full border border-blue-300/20 bg-blue-300/[0.06] px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-blue-200">
                GitHub live
              </span>
            </div>

            <form className="flex flex-col gap-2 sm:flex-row" onSubmit={analyzePullRequest}>
              <input
                className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#071018] px-4 py-3 text-sm text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-cyan-300/40"
                value={prUrl}
                onChange={(event) => setPrUrl(event.target.value)}
                aria-label="GitHub pull request URL"
                placeholder="https://github.com/owner/repo/pull/123"
              />
              <button
                className="rounded-xl bg-cyan-300 px-5 py-3 text-sm font-semibold text-[#041017] transition hover:bg-cyan-200 disabled:cursor-wait disabled:opacity-60"
                type="submit"
                disabled={loadingPr}
              >
                {loadingPr ? "Analyzing…" : "Analyze PR"}
              </button>
            </form>

            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="text-slate-600">Try</span>
              {EXAMPLE_PRS.map((example) => (
                <button
                  key={example.url}
                  type="button"
                  disabled={loadingPr}
                  onClick={() => {
                    setPrUrl(example.url);
                    loadSignal(example.url, deadlineDays);
                  }}
                  className="rounded-full border border-white/[0.08] px-2.5 py-1 text-slate-400 transition hover:border-cyan-300/40 hover:text-white"
                >
                  {example.label}
                </button>
              ))}
            </div>

            {prError ? (
              <div className="mt-4 rounded-xl border border-rose-300/20 bg-rose-300/[0.06] p-3 text-sm text-rose-200">
                {prError}
              </div>
            ) : null}

            {pr ? (
              <div className="mt-5">
                <div className="flex flex-col gap-4 rounded-xl border border-white/[0.07] bg-white/[0.025] p-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                      {pr.repository} · PR #{pr.number}
                    </div>
                    <a
                      className="mt-2 block truncate text-base font-medium text-white hover:text-cyan-200"
                      href={pr.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {pr.title}
                    </a>
                    <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-400">
                      <span>{pr.state === "open" ? (pr.draft ? "Draft" : "Ready for review") : pr.state}</span>
                      <span>·</span>
                      <span>{pr.mergeable === null ? "Mergeability pending" : pr.mergeable ? "Mergeable" : "Conflict"}</span>
                      {pr.mergeableState ? (
                        <>
                          <span>·</span>
                          <span>state: {pr.mergeableState}</span>
                        </>
                      ) : null}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className={`text-4xl font-semibold tracking-tight ${signalTone(pr.deliveryScore)}`}>
                      {pr.deliveryScore}
                    </div>
                    <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-slate-500">
                      delivery score
                    </div>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {[
                    ["Commits", pr.commits],
                    ["Files", pr.changedFiles],
                    ["Additions", `+${pr.additions}`],
                    ["Comments", pr.comments + pr.reviewComments],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-white/[0.06] bg-[#071018] p-3">
                      <div className="text-lg font-medium text-slate-200">{value}</div>
                      <div className="mt-1 text-[10px] uppercase tracking-wider text-slate-600">{label}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 space-y-2">
                  {pr.evidence.map((item) => (
                    <div key={item} className="flex gap-2 text-xs leading-5 text-slate-400">
                      <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-cyan-300" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-[11px] leading-4 text-slate-600">
                  The score is a transparent heuristic over the evidence above, not a calibrated probability.
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-600">
                Analyze a PR to turn repository state into a delivery signal.
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0a151f]/90 p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-medium text-white">Market belief</div>
                <div className="mt-1 text-xs text-slate-500">Panta markets, checked against the pull request</div>
              </div>
              <span
                className={`rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider ${
                  feed?.mode === "live"
                    ? "border-emerald-300/20 bg-emerald-300/[0.06] text-emerald-200"
                    : "border-amber-300/20 bg-amber-300/[0.06] text-amber-200"
                }`}
              >
                {loadingMarkets
                  ? "Loading"
                  : feed?.mode !== "live"
                    ? "Demo data"
                    : feed.environment === "test"
                      ? "Panta test API"
                      : "Panta live"}
              </span>
            </div>

            {feed?.notice ? (
              <div className="mb-4 rounded-xl border border-amber-300/15 bg-amber-300/[0.05] p-3 text-xs leading-5 text-amber-100/80">
                {feed.notice}
              </div>
            ) : null}

            {marketError ? (
              <div className="rounded-xl border border-rose-300/20 bg-rose-300/[0.06] p-3 text-sm text-rose-200">
                {marketError}
              </div>
            ) : null}

            {report ? (
              <div
                className={`mb-3 rounded-xl border p-3 text-xs leading-5 ${
                  report.panta.matches.length
                    ? "border-emerald-300/20 bg-emerald-300/[0.05] text-emerald-100/90"
                    : "border-white/[0.08] bg-white/[0.02] text-slate-400"
                }`}
              >
                {report.panta.matches.length
                  ? `${report.panta.matches.length} of ${report.panta.marketsScanned} Panta markets mention ${report.pullRequest.repository}.`
                  : `None of the ${report.panta.marketsScanned} Panta markets scanned mention ${report.pullRequest.repository} or PR #${report.pullRequest.number}, so there is no crowd price to compare yet.`}
              </div>
            ) : null}

            <div className="max-h-[22rem] space-y-2 overflow-y-auto pr-1">
              {feed?.items.map((market) => {
                const selected = market.marketId === selectedMarketId;
                const reason = matchReason.get(market.marketId);
                return (
                  <button
                    key={market.marketId}
                    type="button"
                    className={`w-full rounded-xl border p-4 text-left transition ${
                      selected
                        ? "border-cyan-300/35 bg-cyan-300/[0.07]"
                        : "border-white/[0.06] bg-[#071018] hover:border-white/15"
                    }`}
                    onClick={() => setSelectedMarketId(market.marketId)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="font-mono text-[10px] uppercase tracking-wider text-slate-600">
                          {market.category || "market"} · {market.phase}
                          {reason ? (
                            <span className="ml-2 text-emerald-300">
                              {reason === "pull-request" ? "tracks this PR" : "mentions this repo"}
                            </span>
                          ) : null}
                        </div>
                        <div className="mt-1 text-sm font-medium leading-5 text-slate-200">
                          {truncate(market.title, 100)}
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="text-xl font-semibold text-emerald-300">
                          {pct(toProbability(market.yesPrice))}
                        </div>
                        <div className="font-mono text-[9px] uppercase tracking-wider text-slate-600">YES</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {report && selectedMarketId && !selectedIsMatched && !report.comparison ? (
              <label className="mt-3 flex cursor-pointer items-start gap-2 text-xs leading-5 text-slate-400">
                <input
                  type="checkbox"
                  className="mt-1 accent-cyan-300"
                  checked={linkedMarketId === selectedMarketId}
                  onChange={(event) => setLinkedMarketId(event.target.checked ? selectedMarketId : null)}
                />
                <span>This market is about this pull request. Compare them anyway.</span>
              </label>
            ) : null}

            {!loadingMarkets && !marketError && !feed?.items.length ? (
              <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-600">
                No markets returned for this filter.
              </div>
            ) : null}

            <a
              className="mt-5 inline-flex text-xs font-medium text-cyan-200 hover:text-cyan-100"
              href="https://panta.market"
              target="_blank"
              rel="noreferrer"
            >
              Powered by Panta ↗
            </a>
          </div>
        </section>

        <section id="signal" className="mt-5 rounded-2xl border border-white/10 bg-gradient-to-br from-[#0c1822] to-[#08121b] p-5 sm:p-7">
          <div className="grid gap-7 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-300">
                Repository vs crowd
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {[
                  ["Repo", pct(pr?.deliveryScore ?? null)],
                  ["Crowd", pct(comparison?.crowdProbability ?? null)],
                  ["Gap", comparison ? `${comparison.gap}pt` : "—"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-white/[0.07] bg-black/10 p-4">
                    <div className="text-2xl font-semibold tracking-tight text-white">{value}</div>
                    <div className="mt-1 text-[10px] uppercase tracking-wider text-slate-600">{label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col justify-between rounded-xl border border-white/[0.07] bg-black/10 p-5">
              <div>
                <p className="text-base leading-7 text-slate-300">
                  {!report
                    ? "Analyze a pull request. ShipSignal compares it only with a Panta market that is actually about it."
                    : comparison
                      ? comparison.interpretation
                      : report.draft
                        ? "No Panta market prices this pull request yet. ShipSignal drafted one below."
                        : "This pull request is closed, so there is nothing left to forecast."}
                </p>
                {comparison ? (
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    {truncate(comparison.market.title, 90)} · {BASIS_LABEL[comparison.basis]}
                  </p>
                ) : null}
              </div>
              <div className="mt-6 flex flex-wrap gap-2 font-mono text-[10px] text-slate-500">
                <span className="rounded border border-white/[0.07] px-2 py-1">GET /api/signal?pr=…</span>
                <span className="rounded border border-white/[0.07] px-2 py-1">POST /api/market-draft</span>
                <span className="rounded border border-white/[0.07] px-2 py-1">agent-ready</span>
              </div>
            </div>
          </div>
        </section>

        {report && draft ? (
          <section id="draft" className="mt-5 rounded-2xl border border-cyan-300/15 bg-[#0a151f]/90 p-5 sm:p-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-300">
                  Delivery market draft
                </div>
                <h2 className="mt-3 text-xl font-semibold leading-7 tracking-tight text-white sm:text-2xl">
                  {draft.question}
                </h2>
              </div>
              <div className="flex shrink-0 gap-1 rounded-xl border border-white/10 bg-black/20 p-1" role="group" aria-label="Deadline">
                {DEADLINE_OPTIONS.map((days) => (
                  <button
                    key={days}
                    type="button"
                    disabled={loadingPr}
                    onClick={() => changeDeadline(days)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                      deadlineDays === days ? "bg-cyan-300 text-[#041017]" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {days} days
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-4 text-sm leading-6">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-600">Resolution rule</div>
                  <p className="mt-1 text-slate-300">{draft.resolutionRule}</p>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-600">Sources of truth</div>
                  <ul className="mt-1 space-y-1">
                    {draft.sourcesOfTruth.map((source) => (
                      <li key={source} className="truncate font-mono text-xs text-cyan-200/80">
                        {source}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {[
                    ["Trading opens", utc(draft.startTime)],
                    ["Trading closes", utc(draft.endTime)],
                    ["Resolves", utc(draft.resolutionTime)],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-white/[0.06] bg-[#071018] p-3">
                      <div className="text-[10px] uppercase tracking-wider text-slate-600">{label}</div>
                      <div className="mt-1 text-xs text-slate-300">{value}</div>
                    </div>
                  ))}
                </div>
                <div className="text-xs leading-5 text-slate-500">
                  Category <span className="text-slate-300">{draft.category}</span> · standard market · ShipSignal
                  prior <span className={signalTone(draft.shipSignalPrior)}>{draft.shipSignalPrior}% YES</span>{" "}
                  (heuristic, shown to the creator, not sent to Panta)
                </div>
              </div>

              <div className="rounded-xl border border-white/[0.07] bg-black/10 p-4">
                <div className="text-sm font-medium text-white">Quote it with Panta</div>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Panta validates the parameters and returns the USDC creation fee. Nothing is signed or sent.
                </p>
                <input
                  className="mt-3 w-full rounded-xl border border-white/10 bg-[#071018] px-3 py-2.5 font-mono text-xs text-slate-200 outline-none placeholder:text-slate-600 focus:border-cyan-300/40"
                  value={wallet}
                  onChange={(event) => setWallet(event.target.value)}
                  aria-label="Creator wallet public address"
                  placeholder={
                    feed?.environment === "test"
                      ? "Creator wallet (optional in the sandbox)"
                      : "Creator wallet public address"
                  }
                />
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={quoteDraft}
                    disabled={quoting || loadingPr}
                    className="flex-1 rounded-xl bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-[#041017] transition hover:bg-cyan-200 disabled:cursor-wait disabled:opacity-60"
                  >
                    {quoting ? "Quoting…" : "Get Panta quote"}
                  </button>
                  <button
                    type="button"
                    onClick={() => copyDraft(draft)}
                    className="rounded-xl border border-white/10 px-3 py-2.5 text-xs text-slate-300 transition hover:border-cyan-300/40 hover:text-white"
                  >
                    {copied ? "Copied" : "Copy JSON"}
                  </button>
                </div>

                {quoteError ? (
                  <div className="mt-3 rounded-xl border border-rose-300/20 bg-rose-300/[0.06] p-3 text-xs text-rose-200">
                    {quoteError}
                  </div>
                ) : null}

                {quoteResult?.quote ? (
                  <div className="mt-3 space-y-1.5 rounded-xl border border-emerald-300/20 bg-emerald-300/[0.05] p-3 text-xs leading-5">
                    <div className="font-medium text-emerald-200">
                      Panta accepted the parameters
                      {quoteResult.environment === "test" ? " (sandbox, not mainnet)" : ""}
                    </div>
                    <div className="text-slate-300">Creation fee: {usdc(quoteResult.quote.paymentUsdc)}</div>
                    <div className="text-slate-400">
                      {usdc(quoteResult.quote.liquidityInjectionUsdc)} seeds liquidity ·{" "}
                      {usdc(quoteResult.quote.platformRevenueUsdc)} platform
                    </div>
                    <div className="truncate font-mono text-[11px] text-slate-400">
                      Event address {shortAddress(quoteResult.quote.expectedEventPda)}
                    </div>
                    <div className="text-slate-500">
                      Creator {shortAddress(quoteResult.wallet)}
                      {quoteResult.walletIsSandboxFixture ? " (Panta sandbox fixture)" : ""} · quote expires{" "}
                      {new Date(quoteResult.quote.expiresAt).toLocaleTimeString()}
                    </div>
                  </div>
                ) : null}

                {quoteResult?.pantaError ? (
                  <div className="mt-3 rounded-xl border border-amber-300/20 bg-amber-300/[0.05] p-3 text-xs leading-5 text-amber-100/90">
                    <div className="font-medium">
                      Panta rejected the quote{quoteResult.pantaError.code ? `: ${quoteResult.pantaError.code}` : ""}
                    </div>
                    <div className="mt-1 text-amber-100/70">{quoteResult.pantaError.message}</div>
                    {quoteResult.pantaError.fields
                      ? Object.entries(quoteResult.pantaError.fields).map(([field, messages]) => (
                          <div key={field} className="font-mono text-[11px] text-amber-100/60">
                            {field}: {messages.join(" ")}
                          </div>
                        ))
                      : null}
                  </div>
                ) : null}

                <p className="mt-3 text-[11px] leading-4 text-slate-600">
                  Next, in the creator&apos;s wallet: Panta builds the unsigned transaction, the wallet signs and
                  broadcasts it, then Panta registers the market. ShipSignal never holds keys or funds.
                </p>
              </div>
            </div>
          </section>
        ) : null}

        <section className="mt-5 grid gap-3 md:grid-cols-3">
          {[
            ["Evidence, not vibes", "Repository state is shown with its underlying evidence instead of a hidden score alone."],
            ["Only like with like", "A crowd price is compared only with a market about this pull request, or one you link yourself, labelled as such."],
            ["Non-custodial by design", "ShipSignal stops at Panta's quote. Signing and broadcasting stay in the creator's wallet; ShipSignal never handles seed phrases."],
          ].map(([title, body]) => (
            <div key={title} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
              <div className="text-sm font-medium text-slate-200">{title}</div>
              <div className="mt-2 text-xs leading-5 text-slate-500">{body}</div>
            </div>
          ))}
        </section>

        <footer className="mt-10 flex flex-col gap-3 border-t border-white/10 py-7 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <span>ShipSignal · Crypto World&apos;s Fair build</span>
          <span>Market probability is information, not a guarantee of delivery or financial outcome.</span>
        </footer>
      </div>
    </main>
  );
}
