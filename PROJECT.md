# ShipSignal — BH-0005

## Objective

Build a working Crypto World's Fair submission that can compete in:

1. Official Colosseum Crypto World's Fair.
2. Panta API Sidetrack — 5,000 USDG pool.
3. Superteam Vietnam Track — 10,000 USDG pool, only after the operator personally completes all required eligibility/registration attestations.

## Product

**ShipSignal** is prediction intelligence for software delivery.

It combines:
- live prediction-market data from Panta,
- public GitHub delivery telemetry,
- a machine-readable decision signal for humans and AI agents.

The wedge is software/open-source delivery risk: release dates, protocol upgrades, pull-request merges, milestones, and launch commitments.

The first internal use case is the existing Mermail PR #375 workflow.

## Why prediction markets make the product better

Repository telemetry shows activity, not belief. A market supplies an explicit probability backed by participants taking positions. ShipSignal puts both surfaces together:
- observable execution evidence,
- crowd probability,
- disagreement between the two.

That disagreement is the product signal.

## Panta integration target

Required attribution: **Powered by Panta**.

V1:
- list Panta markets,
- fetch live market detail/spot prices,
- filter markets by software/protocol keywords,
- display source freshness and live/demo status.

V2:
- market creation quote/build/register flow,
- YES/NO buy quote/build/submit flow,
- wallet positions,
- win/creator-fee claims.

All transaction-producing flows remain non-custodial. Panta returns unsigned transactions; the user's wallet signs. No private key or seed phrase is handled by ShipSignal.

## Architecture

- Next.js 16 App Router
- server-side Panta API client; PANTA_API_KEY never reaches client code
- public GitHub REST telemetry
- client dashboard for interactive comparison
- later: agent/MCP endpoint exposing normalized signals

## Human gates

Do not automate these without the operator:
- Colosseum account creation where creating the account constitutes acceptance of Terms/Privacy Policy.
- Eligibility/country declarations.
- Wallet signatures.
- Real USDC spends/trades/market-creation fees.
- Final legal attestations.
- Any final submission field asserting facts not verified from artifacts.

## Current canonical external facts — 2026-09-30

### Panta Sidetrack
- status: OPEN
- region: Global
- agentAccess: HUMAN_ONLY
- deadline: 2026-10-13T06:59:00Z
- prize pool: 5,000 USDG
- prizes: 2,000 / 1,000 / 1,000 / 1,000 USDG
- working demo required
- official Colosseum submission required
- submissions in English
- multiple eligible sidetracks allowed under official rules

### Colosseum
- Crypto World's Fair runs Sep 14 — Oct 12, 2026
- official main submission is required before Panta sidetrack submission

## Acceptance milestones

### M0 — Product shell
- project spec committed
- build/lint green
- polished dashboard shell
- clear live/demo data labeling

### M1 — Live read integration
- Panta market list + detail work from server using PANTA_API_KEY
- GitHub public PR telemetry works
- one combined signal card works

### M2 — Panta transaction intents
- quote/create/buy flows
- explicit user wallet-sign boundary
- no custody

### M3 — Agent surface
- machine-readable decision endpoint
- at least one agent workflow consumes it

### M4 — Demo and traction
- production deploy
- real Panta read path
- first real user workflow
- demo video + pitch material

### M5 — Submission
- Colosseum project submitted by operator where required
- Panta sidetrack submitted
- Vietnam track submitted only if operator eligibility/registration is complete