# ShipSignal

Prediction intelligence for software delivery.

ShipSignal combines public GitHub delivery telemetry with prediction-market probability from [Panta](https://panta.market) to surface disagreement between **observable execution evidence** and **crowd belief**.

## Current demo

The first real repository signal is the Mermail access-review PR:

- https://github.com/Nudgen-Marketing/mermail-skills/pull/375
- GitHub data is fetched live through ShipSignal's server route.
- Panta data remains explicitly labeled **Demo data** until the operator personally accepts Panta's API terms and configures a server-side API key.

ShipSignal never represents fixture data as live market information.

## Local development

```bash
npm install
npm run dev -- -p 3005
```

Open:

```
http://127.0.0.1:3005
```

The local scripts use Next.js Webpack because Windows Application Control on the current development machine blocks the native SWC binary. Next.js falls back to WASM successfully.

## Verification

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Environment

Copy `.env.example` to `.env.local`.

```bash
PANTA_API_KEY=
PANTA_API_BASE_URL=https://live-api.panta.market/api/v1
GITHUB_TOKEN=
```

- `PANTA_API_KEY` is server-side only.
- `GITHUB_TOKEN` is optional; public GitHub REST works without it but has lower rate limits.
- Never expose either secret through a `NEXT_PUBLIC_*` variable.

## API surface

### GitHub delivery signal

```
GET /api/github-pr?url=https://github.com/owner/repo/pull/123
```

Returns public PR telemetry plus an evidence-backed heuristic delivery score.

### Panta market feed

```
GET /api/markets?status=primary&limit=12
```

Without `PANTA_API_KEY`, this returns clearly marked demo fixtures. With a configured key, it uses the live Panta market catalog.

## Product roadmap

1. **M0 — Product shell:** dashboard, explicit live/demo labeling, GitHub signal, Panta adapter.
2. **M1 — Live Panta reads:** authorized Panta market list/detail integration.
3. **M2 — Transaction intents:** market creation, buy, positions and claims with user-wallet signing.
4. **M3 — Agent surface:** machine-readable decision endpoint / agent workflow.
5. **M4 — Demo + traction:** deployed product and real usage.
6. **M5 — Hackathon submission:** Colosseum + eligible sidetracks.

See [PROJECT.md](./PROJECT.md) for the execution contract and human gates.

## Safety and custody

ShipSignal does not handle wallet seed phrases or private keys. Any future on-chain transaction remains user-signed. Real trading, market-creation fees, eligibility declarations, and legal attestations remain explicit human gates.

## Attribution

**Powered by Panta**