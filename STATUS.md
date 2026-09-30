# ShipSignal Status

Last updated: 2026-09-30

## Milestone

**M0 — PRODUCT SHELL: PASS / PUBLISHED / DEPLOYED**

**M1 — AUTHENTICATED PANTA READS: PASS IN TEST ENVIRONMENT**

**PRE-SUBMIT: NO-GO**

Workspace:

`E:\Projects\BH-0005-shipsignal-panta`

Working branch:

`work/shipsignal-presubmit-v1`

Production:

https://shipsignal-panta.vercel.app

GitHub:

https://github.com/ShenJun93/shipsignal-panta

Canonical remote `main`:

`3fbfe9ce70fcbb5ef7131aa4ff27601f52a2345a`

## Implemented

- Next.js 16 App Router application.
- Public GitHub pull-request telemetry.
- Panta API adapter with demo/test/production awareness.
- Authenticated Panta API reads using a server-side Vercel secret.
- Evidence-backed delivery score.
- Combined repository-vs-market disagreement signal.
- Exact **Powered by Panta** attribution.
- Server routes:
  - `GET /api/github-pr`
  - `GET /api/markets`

## Verification

### Static checks — current pre-submit branch

- `npm run lint` — PASS.
- `npx tsc --noEmit` — PASS.
- `git diff --check` — PASS.
- Local `next build` remains unreliable on this Windows host due the existing Application Control / SWC environment; use Vercel production build as the deployment build gate.

### Vercel production

- Project: `shipsignal-panta`.
- Current production Git SHA: `3fbfe9ce70fcbb5ef7131aa4ff27601f52a2345a`.
- Secret `PANTA_API_KEY` exists in the **Production** environment.
- Redeploy after secret installation: **READY**.
- Deployment ID: `dpl_6JRr67sZqUxxLv2U9GrgCujTrqPb`.
- Production alias: https://shipsignal-panta.vercel.app
- Vercel runtime errors in the checked one-hour window: none.

### Production smoke — 2026-09-30

- Homepage: HTTP 200.
- `/api/github-pr` against real Mermail PR #375: PASS.
- GitHub signal:
  - state: open
  - draft: false
  - mergeable: true
  - deliveryScore: 80
- `/api/markets`: **authenticated Panta API response**.
- Current Panta credential is a `pk_test_` key.
- Returned market: `Sandbox test market`.
- Panta response explicitly says this fixture is **not on mainnet**.
- Clean BrowserPort test loaded:
  - GitHub live telemetry
  - Panta sandbox market at 50% YES
  - combined signal: repo 80%, crowd 50%, gap 30pt
  - **Powered by Panta** attribution

Important accuracy fix:

Current deployed M0 UI still shows the generic badge `PANTA LIVE`. Because the active credential is a Panta test key and the returned market is sandbox data, the pre-submit branch changes this to **Panta test API** and returns an explicit `environment: test` field plus the notice:

`Authenticated Panta test API — sandbox market data, not mainnet.`

This fix must be deployed before any final video or submission.

## Security / workspace hygiene

- Panta credential is stored in Vercel, not in the repository.
- No credential was pasted into chat.
- Prior secret-pattern scan found no API token/private-key patterns in the workspace.
- Temporary browser profiles and invalid black-screen demo captures were removed.
- Project graphic:
  - `docs/submission/shipsignal-project-graphic.png`

Re-run secret scanning after the final code/deployment update.

## Colosseum

**REGISTRATION: COMPLETE / PROJECT DRAFT ACTIVE**

Current project:

- Name: `ShipSignal`
- Project ID: `15220`
- Category: `Developer Infrastructure`
- Chain: `Solana`
- Team base: `Vietnam`
- Website: https://shipsignal-panta.vercel.app
- GitHub: https://github.com/ShenJun93/shipsignal-panta

Remaining portal blockers:

- Project details: **1 required field** — team Telegram contact.
- Media and code: **2 required fields** — demo video and pitch video.
- Team: **0 of 1 complete** — personal required fields still need operator-confirmed values.

Do not click final submission yet.

## Panta

**LEGAL GATE: COMPLETED BY OPERATOR**

Canonical Terms:

https://docs.panta.market/guides/terms-of-use

The operator personally completed the Panta Terms / credential gate before authenticated API use.

Current state:

- `PANTA_API_KEY` is stored as a Vercel Production secret.
- Authenticated Panta API access works.
- Current key is `pk_test_`, therefore the returned market is test/sandbox data, not mainnet.
- No trade was executed.
- No market was created.
- No wallet transaction was signed.

Panta Sidetrack requires meaningful Panta API integration plus a working demonstration. The integration is now real/authenticated, but final submission stays blocked until:

1. accurate test-environment labeling is deployed;
2. a verified working demo video is produced;
3. the submission accurately describes the sandbox/test environment unless a production key is later used.

## Superteam Vietnam

Canonical listing re-audited on 2026-09-30.

Observed requirements:

- Colosseum eligibility.
- Submit on both Colosseum and Superteam Earn.
- Colosseum base country `Vietnam`.
- Google Form + Telegram group.
- Demo Day: **October 4, 2026**.
- Online pitch accepted for teams unable to travel.
- Listing metadata is `HUMAN_ONLY`.

The accepted live-pitch language is still unresolved. Do not commit to this sidetrack until that is confirmed because the operator does not want a spoken-English workflow.

## Final audit

Source of truth:

`docs/submission/PRE-SUBMIT-AUDIT.md`

Final submission remains blocked.

## Next

1. Commit/publish the accurate `Panta test API` environment-label fix.
2. Deploy and verify production again.
3. Re-run secret scan and clean-session smoke.
4. Obtain operator-confirmed Telegram + founder personal fields.
5. Record and visually inspect a new real product demo.
6. Produce/review the separate pitch video.
7. Resolve Superteam Vietnam live-pitch language/attendance constraint.
8. Run the final PRE-SUBMIT audit.
9. Submit only when every required gate is PASS.