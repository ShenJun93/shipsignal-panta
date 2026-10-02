# ShipSignal Status

Last updated: 2026-10-02

## Milestones

- **M0 — PRODUCT SHELL: PASS / PUBLISHED / DEPLOYED**
- **M1 — AUTHENTICATED PANTA READS: PASS IN TEST ENVIRONMENT**
- **PRE-SUBMIT: PASS / READY — WAITING FOR SUBMISSION WINDOW**

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

Colosseum portal readiness:

- Project details: **PASS** — required contact field is present; stale Panta wording was corrected and persisted.
- Media and code: **PASS / Complete** — corrected demo, pitch, public GitHub, graphic, X, and live product link are present.
- Team: **PASS** — submission profile now shows **Complete** using operator-confirmed personal values.
- Judge-access audit: **PASS** — canonical GitHub repository is public and clean WAG sessions can open the required public links.
- Review submission: **READY** — portal explicitly says `Your project is ready.`
- Submission availability: **WAITING** — portal says submissions open `October 6, 2026 at 4:00 AM PDT`.

Do not submit yet; the Colosseum submission window is not open.

## Panta Sidetrack

Authenticated Panta API integration now works through the official test environment. The current market is explicitly sandbox/test and not mainnet.

Final Colosseum submission remains blocked only until:

1. the portal submission window opens;
2. the final public-link / claim / secret checks are re-run immediately before submit;
3. the operator performs the human-only final submission action.

All currently editable required Colosseum fields are complete.

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

## Verified local media candidates

- Demo primary: `C:\Users\PACMAP\AppData\Local\WAG-Local\media-capture-pw\demo-candidate-03-captioned-audio-final.mp4` — 59.9s, 1920x1080 H.264 + AAC mono voiceover, captioned; local ffprobe + loudness check PASS; uploaded Unlisted to `https://www.youtube.com/watch?v=ojFtIuhCa3Y`; Colosseum points to this corrected audio version.
- Pitch primary: `C:\Users\PACMAP\AppData\Local\WAG-Local\media-capture-pw\pitch-candidate-01.mp4` — 94.07s, 1920x1080 H.264 + AAC audio, captioned; uploaded Unlisted to `https://www.youtube.com/watch?v=nrI4ky_LUL4`; clean-session accessible and within the portal's **Up to 2 minutes** limit.
- Pitch backup: `pitch-candidate-02.mp4` — 136.776s (2:16.8), retained only as a longer backup and not used in the portal.
- The current demo and primary pitch accurately describe Panta as authenticated TEST/sandbox data and do not claim mainnet, traction, or partnerships.
- Both media URLs are persisted in Colosseum; final submission has not been made.

## Next

1. Wait for the Colosseum submission window to open on `October 6, 2026 at 4:00 AM PDT`.
2. Immediately before submission, re-run public-link, secret, production, Panta-labeling, media, and claim checks.
3. Keep the final Colosseum submit action human-only.
4. Superteam Vietnam remains a separate HUMAN_ONLY sidetrack hold until pitch-language/attendance handling is confirmed.
5. Do not change the verified demo/pitch URLs unless a new audit is run.