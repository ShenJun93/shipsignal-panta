# ShipSignal

Prediction intelligence for software delivery.

ShipSignal turns a GitHub pull request into a question a prediction market can price: *will this PR merge by a deadline?*

1. **Observe.** It scores the pull request from public GitHub evidence (draft state, mergeability, checks, age) and shows the evidence behind the score.
2. **Match.** It scans the [Panta](https://panta.market) catalog for a market that names the pull request or its repository. A crowd price is compared with the repository evidence only when the market is about that pull request, or when the user links one and the page labels it as user-linked.
3. **Draft.** When no market exists, it drafts one that resolves from GitHub: question, resolution rule, sources of truth, trading window. It then asks Panta to quote it (`POST /markets/create/quote/`), so Panta validates the parameters and returns the USDC creation fee, and to build the unsigned create transaction (`POST /markets/create/build/`). Building, signing and broadcasting stay with the creator's wallet; ShipSignal never holds keys or funds.

## Production demo

https://shipsignal-panta.vercel.app (open `/?demo=1` to load the first example automatically)

- Examples are open pull requests in Solana repositories (Anchor, Agave). GitHub data is fetched live.
- Production is connected to Panta through an authenticated **test API** key. The catalog returns Panta's sandbox market, and quotes run against the sandbox.
- The UI labels this as **PANTA TEST API** and **sandbox market data, not mainnet**.

ShipSignal never represents fixture, test, or sandbox data as mainnet production market information.

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

### Combined signal (for agents)

```
GET /api/signal?pr=https://github.com/owner/repo/pull/123&days=14
```

Returns the pull-request evidence, the Panta markets that mention it, a comparison when one does, and a drafted delivery market (`days` is 7, 14 or 30).

### Quote a drafted market with Panta

```
POST /api/market-draft
{ "pr": "https://github.com/owner/repo/pull/123", "days": 14, "wallet": "<creator public address>" }
```

Drafts the market, calls Panta's create quote, then Panta's create build. Returns the quote (fee, liquidity portion, expected event address, expiry) and the unsigned create transaction (base64, blockhash, derived accounts) for the creator's wallet to sign, or Panta's error envelope. With a `pk_test_` key the wallet is optional and defaults to Panta's sandbox fixture creator. ShipSignal signs and broadcasts nothing.

### Panta market feed

```
GET /api/markets?status=primary&limit=12
```

Without `PANTA_API_KEY`, this returns clearly marked demo fixtures. With a configured key, it calls the authenticated Panta API and reports the detected environment (`test` or `production`) explicitly. The current production deployment uses a Panta test key and sandbox data.

## Product roadmap

1. **M0 — Product shell:** dashboard, explicit data-environment labeling, GitHub signal, Panta adapter.
2. **M1 — Authenticated Panta reads:** authorized Panta market list/detail integration with test/production labeling.
3. **M2 — Delivery markets:** draft a GitHub-resolved market for any open PR and get a Panta create quote (done). Next: build the unsigned create transaction for the creator's wallet, then buy, positions and claims.
4. **M3 — Agent surface:** `GET /api/signal` and `POST /api/market-draft` (done).
5. **M4 — Demo + traction:** deployed product and real usage.
6. **M5 — Hackathon submission:** Colosseum + eligible sidetracks.

See [PROJECT.md](./PROJECT.md) for the execution contract and human gates.

## Safety and custody

ShipSignal does not handle wallet seed phrases or private keys. Any future on-chain transaction remains user-signed. Real trading, market-creation fees, eligibility declarations, and legal attestations remain explicit human gates.

## Attribution

**Powered by Panta**