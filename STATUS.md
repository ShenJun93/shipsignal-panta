# ShipSignal Status

Last updated: 2026-10-01

## Milestones

- **M0 — PRODUCT SHELL: PASS / PUBLISHED / DEPLOYED**
- **M1 — AUTHENTICATED PANTA READS: PASS IN TEST ENVIRONMENT**
- **PRE-SUBMIT: NO-GO**

Workspace:

`E:\Projects\BH-0005-shipsignal-panta`

Production:

https://shipsignal-panta.vercel.app

GitHub:

https://github.com/ShenJun93/shipsignal-panta

Audited product-code baseline (before docs-only audit refreshes):

`9652a475a79a09442ef54320caf51e00ca0a1cf7`

Docs-only merges may advance `main`; use Git/Vercel directly for the current remote HEAD.

PR #2:

https://github.com/ShenJun93/shipsignal-panta/pull/2 — **MERGED**

## Current implementation

- Next.js 16 App Router.
- Live public GitHub pull-request telemetry.
- Authenticated Panta API reads.
- Explicit Panta environment labeling: `demo` / `test` / `production`.
- Evidence-backed delivery score.
- Combined repository-vs-market disagreement signal.
- Exact **Powered by Panta** attribution.
- API routes:
  - `GET /api/github-pr`
  - `GET /api/markets`

## Verification

### Static checks

- `npm run lint` — PASS.
- `npx tsc --noEmit` — PASS.
- `git diff --check` — PASS.
- Local `next build` remains unreliable on this Windows host because of the existing Application Control / SWC environment. Vercel production build is the deployment build gate.

### Verified Vercel production snapshot — 2026-10-01

- Project: `shipsignal-panta`.
- Verified production Git SHA at smoke time: `9652a475a79a09442ef54320caf51e00ca0a1cf7`.
- Production deployment: **READY**.
- Deployment ID: `dpl_GU1hRicA3AzTiM1HZB6WKzPe2za9`.
- `PANTA_API_KEY` is stored as a Vercel **Production** secret.
- No runtime errors were found in the checked 1-hour window on 2026-10-01.

### Production smoke

Revalidated on 2026-10-01 from a clean WAG BrowserPort session.

- Homepage: HTTP 200.
- GitHub PR #375 telemetry: PASS.
- Delivery score: 80.
- Panta API: authenticated.
- Current Panta credential: `pk_test_`.
- Returned market: `Sandbox test market`.
- API response:
  - `mode: live`
  - `environment: test`
  - notice: `Authenticated Panta test API — sandbox market data, not mainnet.`
- Clean BrowserPort verification confirmed:
  - **GITHUB LIVE**
  - **PANTA TEST API**
  - sandbox/not-mainnet notice
  - **Powered by Panta**
  - combined signal from repo 80% vs sandbox crowd 50%.

The product no longer presents Panta test/sandbox data as generic live/mainnet data.

## Security

- Panta credential is not in the repository or local workspace.
- Credential was not sent through chat.
- Workspace secret-pattern scan: PASS.
- No trade executed.
- No market created.
- No wallet transaction signed.

## Colosseum

Registration and project draft are active.

Project:

- Name: `ShipSignal`
- ID: `15220`
- Category: `Developer Infrastructure`
- Chain: `Solana`
- Team base: `Vietnam`

Remaining portal blockers:

- Project details: **team Telegram contact**.
- Media: **demo video + pitch video**.
- Team: **0 of 1 complete** — operator-confirmed personal fields still missing.

Do not submit yet.

## Panta Sidetrack

Authenticated Panta API integration now works through the official test environment. The current market is explicitly sandbox/test and not mainnet.

Final submission remains blocked until:

1. a verified demo video is produced;
2. the pitch video is reviewed;
3. all claims consistently describe Panta as **test/sandbox API** unless a production key is later used;
4. remaining Colosseum profile/contact fields are completed.

## Superteam Vietnam

Re-audited 2026-09-30:

- Colosseum eligibility required.
- Submit on Colosseum + Superteam Earn.
- Base country must be Vietnam.
- Google Form + Telegram group required.
- Demo Day: **October 4, 2026**.
- Online pitch accepted when unable to travel.
- Listing is `HUMAN_ONLY`.

Pitch language remains unresolved. Do not commit to this sidetrack until that is confirmed because the operator does not want a spoken-English workflow.

## Final audit

Canonical final gate:

`docs/submission/PRE-SUBMIT-AUDIT.md`

Final submission stays **NO-GO** until every required gate is PASS.

## Next

1. Obtain operator-confirmed Telegram + founder personal fields.
2. Record and visually inspect a new real product demo.
3. Produce/review the separate pitch video.
4. Re-audit all public/form/video claims.
5. Resolve Superteam Vietnam pitch-language constraint.
6. Run the final PRE-SUBMIT audit.
7. Submit only when every required gate is PASS.