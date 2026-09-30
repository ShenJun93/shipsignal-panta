"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import type { DecisionSignal, GitHubPullRequestSignal, MarketFeed } from "@/lib/types";

const DEFAULT_PR = "https://github.com/Nudgen-Marketing/mermail-skills/pull/375";

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

export default function ShipSignalDashboard() {
  const [prUrl, setPrUrl] = useState(DEFAULT_PR);
  const [pr, setPr] = useState<GitHubPullRequestSignal | null>(null);
  const [feed, setFeed] = useState<MarketFeed | null>(null);
  const [selectedMarketId, setSelectedMarketId] = useState<string | null>(null);
  const [loadingPr, setLoadingPr] = useState(false);
  const [loadingMarkets, setLoadingMarkets] = useState(true);
  const [prError, setPrError] = useState("");
  const [marketError, setMarketError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadMarkets() {
      setLoadingMarkets(true);
      setMarketError("");
      try {
        const response = await fetch("/api/markets?status=primary&limit=12");
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

  const selectedMarket = useMemo(
    () => feed?.items.find((market) => market.marketId === selectedMarketId) || null,
    [feed, selectedMarketId],
  );

  const decision = useMemo<DecisionSignal>(() => {
    const crowdProbability = toProbability(selectedMarket?.yesPrice);
    const deliveryScore = pr?.deliveryScore ?? null;
    const disagreement =
      crowdProbability !== null && deliveryScore !== null
        ? Math.abs(crowdProbability - deliveryScore)
        : null;

    let interpretation =
      "Analyze a pull request and select a Panta market to compare execution evidence with crowd probability.";

    if (deliveryScore !== null && crowdProbability !== null) {
      if ((disagreement ?? 0) >= 25) {
        interpretation =
          "Large disagreement. Repository evidence and market belief are telling materially different stories.";
      } else if ((disagreement ?? 0) >= 10) {
        interpretation =
          "Moderate disagreement. This is a useful review zone for humans or autonomous agents.";
      } else {
        interpretation =
          "Signals broadly agree. Delivery evidence and market probability are directionally aligned.";
      }
    }

    return {
      repositorySignal: pr,
      market: selectedMarket,
      crowdProbability,
      deliveryScore,
      disagreement,
      interpretation,
    };
  }, [pr, selectedMarket]);

  async function analyzePullRequest(event?: FormEvent) {
    event?.preventDefault();
    setLoadingPr(true);
    setPrError("");
    try {
      const response = await fetch(`/api/github-pr?url=${encodeURIComponent(prUrl.trim())}`);
      const data = (await response.json()) as GitHubPullRequestSignal & { error?: string };
      if (!response.ok) throw new Error(data.error || "Unable to analyze pull request");
      setPr(data);
    } catch (error) {
      setPr(null);
      setPrError(error instanceof Error ? error.message : "Unable to analyze pull request");
    } finally {
      setLoadingPr(false);
    }
  }

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
              Know when software delivery risk and crowd belief disagree.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
              ShipSignal combines public GitHub delivery telemetry with Panta prediction-market odds,
              then exposes a compact decision signal for builders, sponsors, and autonomous agents.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-white/[0.025] p-2">
            {[
              ["01", "Observe", "Repository evidence"],
              ["02", "Compare", "Panta probability"],
              ["03", "Act", "Decision signal"],
            ].map(([step, title, note]) => (
              <div key={step} className="rounded-xl border border-white/[0.06] bg-[#0a151f] p-4">
                <div className="font-mono text-[10px] text-cyan-300">{step}</div>
                <div className="mt-5 text-sm font-medium text-white">{title}</div>
                <div className="mt-1 text-[11px] leading-4 text-slate-500">{note}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
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
                      <span>{pr.draft ? "Draft" : "Ready for review"}</span>
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
                <div className="mt-1 text-xs text-slate-500">Prediction-market probability from Panta</div>
              </div>
              <span
                className={`rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider ${
                  feed?.mode === "live"
                    ? "border-emerald-300/20 bg-emerald-300/[0.06] text-emerald-200"
                    : "border-amber-300/20 bg-amber-300/[0.06] text-amber-200"
                }`}
              >
                {loadingMarkets ? "Loading" : feed?.mode === "live" ? "Panta live" : "Demo data"}
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

            <div className="space-y-2">
              {feed?.items.map((market) => {
                const selected = market.marketId === selectedMarketId;
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

        <section className="mt-5 rounded-2xl border border-white/10 bg-gradient-to-br from-[#0c1822] to-[#08121b] p-5 sm:p-7">
          <div className="grid gap-7 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-300">
                Combined decision signal
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {[
                  ["Repo", pct(decision.deliveryScore)],
                  ["Crowd", pct(decision.crowdProbability)],
                  ["Gap", decision.disagreement === null ? "—" : `${decision.disagreement}pt`],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-white/[0.07] bg-black/10 p-4">
                    <div className="text-2xl font-semibold tracking-tight text-white">{value}</div>
                    <div className="mt-1 text-[10px] uppercase tracking-wider text-slate-600">{label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col justify-between rounded-xl border border-white/[0.07] bg-black/10 p-5">
              <p className="text-base leading-7 text-slate-300">{decision.interpretation}</p>
              <div className="mt-6 flex flex-wrap gap-2 font-mono text-[10px] text-slate-500">
                <span className="rounded border border-white/[0.07] px-2 py-1">/api/github-pr</span>
                <span className="rounded border border-white/[0.07] px-2 py-1">/api/markets</span>
                <span className="rounded border border-white/[0.07] px-2 py-1">agent-ready</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-5 grid gap-3 md:grid-cols-3">
          {[
            ["Evidence, not vibes", "Repository state is shown with its underlying evidence instead of a hidden score alone."],
            ["Live vs demo is explicit", "ShipSignal never presents fixture data as live Panta market information."],
            ["Non-custodial by design", "Future transaction flows keep signing in the user wallet. ShipSignal never handles seed phrases."],
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