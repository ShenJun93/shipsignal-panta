# ShipSignal Status

Last updated: 2026-09-30

## Milestone

**M0 — PRODUCT SHELL: PASS**

Workspace:

`E:\Projects\BH-0005-shipsignal-panta`

## Implemented

- Next.js 16 App Router application.
- Polished ShipSignal dashboard.
- Server-side Panta adapter with explicit live/demo modes.
- Demo fixtures only when `PANTA_API_KEY` is absent.
- Public GitHub pull-request telemetry adapter.
- Evidence-backed delivery score.
- Combined repository-vs-market disagreement signal.
- Required exact attribution: **Powered by Panta**.
- Server routes:
  - `GET /api/github-pr`
  - `GET /api/markets`

## Verified

### Static checks

- `npm run lint` — PASS.
- `npx tsc --noEmit` — PASS.

### Production build

- `npm run build` — PASS using `next build --webpack`.
- Next.js generated:
  - `/`
  - `/api/github-pr`
  - `/api/markets`
- Development machine warns that Windows Application Control blocks native `@next/swc-win32-x64-msvc`; Next.js WASM fallback completed the build.

### Runtime smoke

WAG BrowserPort opened `http://127.0.0.1:3005`.

Panta route:
- HTTP 200.
- mode: `demo`.
- UI visibly labels `DEMO DATA`.
- notice says to configure `PANTA_API_KEY` for live data.

GitHub route on real PR #375:
- source: github
- repository: `Nudgen-Marketing/mermail-skills`
- PR: #375
- title: `feat: add Mermail access review skill`
- state: open
- draft: false
- mergeable: true
- mergeableState: `unstable`
- deliveryScore: 80
- head: `82d5a9ef5306280298e913cdead3927ef217288f`
- base: `9f2e6e0f9d77d4967bd451058fb7c19a32825da9`

Combined demo signal:
- repository score: 80%
- selected demo Panta YES probability: 64%
- disagreement: 16 points
- UI interpretation: moderate disagreement.

## External gates

### Colosseum

Current WAG browser reached the Crypto World's Fair signup page.

**STOP: HUMAN LEGAL GATE**

The account-creation page explicitly states that creating an account constitutes agreement to Colosseum Terms of Service and Privacy Policy. The assistant did not click Create Account or complete OAuth signup.

### Panta

**STOP: HUMAN LEGAL GATE**

Panta API terms state that obtaining credentials, calling authenticated endpoints, or integrating the API constitutes agreement to the API Terms. No Panta account/key has been created and no authenticated Panta endpoint has been called.

Until the operator personally accepts this gate:
- keep `PANTA_API_KEY` empty;
- use demo fixtures only;
- do not execute trades;
- do not create markets;
- do not sign wallet transactions.

## Next

1. Commit and publish M0.
2. Deploy demo with Panta demo-mode labeling.
3. Operator completes Colosseum account/terms gate.
4. Operator completes Panta API terms/credential gate.
5. Move to M1 live Panta read integration.