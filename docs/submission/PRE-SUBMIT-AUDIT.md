# ShipSignal — Pre-Submit Audit

Last audited: 2026-10-01 (Asia/Ho_Chi_Minh)

## Decision

**NO-GO — DO NOT SUBMIT YET**

This file is the final gate for Colosseum, Panta API Sidetrack, and Superteam Vietnam. Do not click a final submission button until every required gate below is PASS or an explicitly optional item is waived.

## Canonical product state

- Workspace: `E:\Projects\BH-0005-shipsignal-panta`
- Working branch: `work/shipsignal-presubmit-refresh-v1`
- Canonical remote `main`: `9652a475a79a09442ef54320caf51e00ca0a1cf7`
- Production: https://shipsignal-panta.vercel.app
- GitHub: https://github.com/ShenJun93/shipsignal-panta
- Colosseum project ID: `15220`
- Colosseum project name: `ShipSignal`
- Colosseum category: `Developer Infrastructure`
- Colosseum chain: `Solana`
- Colosseum team base country: `Vietnam`

## Gate matrix

| Gate | State | Evidence / required action |
| --- | --- | --- |
| Colosseum account + hackathon registration | PASS | Operator personally accepted the legal gate and registered. |
| Colosseum project draft | PASS | Project ID `15220` exists and is editable. |
| Production homepage | PASS | HTTP 200 and clean BrowserPort smoke on 2026-10-01. |
| Live GitHub telemetry | PASS | Clean BrowserPort run on 2026-10-01 analyzed PR #375 successfully and showed delivery score 80. |
| Panta attribution | PASS | Product visibly uses exact text **Powered by Panta**. |
| Authenticated Panta API integration | PASS | Production `/api/markets` returns authenticated Panta API data. Current credential is a Panta **test** key and returns the official sandbox market, not mainnet data. |
| Panta API legal gate | PASS — operator completed | Operator personally completed the Panta Terms / credential gate before authenticated API use. |
| Panta credential handling | PASS so far | `PANTA_API_KEY` is stored as a Vercel Production secret and is not present in the repository/workspace. Re-scan before final submit. |
| Panta environment labeling | PASS | Production now returns `environment: test`, shows **PANTA TEST API**, and displays `Authenticated Panta test API — sandbox market data, not mainnet.` |
| Panta Sidetrack working demo | BLOCKED | Authenticated API plumbing works, but the final verified demo video is still missing. |
| Colosseum project details | **BLOCKED** | Exactly one required field remains: team Telegram contact. |
| Colosseum media | **BLOCKED** | Exactly two required fields remain: demo video and pitch video. |
| Colosseum founder/team profile | **BLOCKED** | Team shows `0 of 1 complete`; personal required fields still need operator-confirmed values. |
| Project graphic | PASS | `docs/submission/shipsignal-project-graphic.png` uploaded to Colosseum. |
| Demo video | **FAIL / BLOCKER** | First capture was black; invalid captures were deleted. A new verified recording is required. |
| Pitch video | **BLOCKED** | Separate public pitch video required, portal limit <= 2 minutes. |
| Git history / hackathon-window evidence | PASS so far | ShipSignal repository and implementation commits are dated during the current hackathon period. Re-check before final submit. |
| Secret scan | PASS as of 2026-10-01 | Tracked-worktree path-only scan found no credential-shaped `sk-`, `ghp_`, `pk_live_`, `pk_test_`, or private-key material; only `.env.example` is tracked among `.env*` files. |
| Local browser-profile hygiene | PASS | Temporary `.edge-demo*` profiles removed and ignored. |
| Final clean-session judge test | PENDING | Open every public link from a clean session after final deployment. |
| Final claim audit | **PENDING / BLOCKER** | Re-open Colosseum project details and remove any stale 2026-09-30 wording that still says Panta demo / credentials pending; form/video/README must consistently say authenticated Panta test/sandbox API, not mainnet. |

## Colosseum form audit

Current project-details values observed in the authenticated local Edge session:

- Project name: `ShipSignal`
- Brief description: present
- Project website: `https://shipsignal-panta.vercel.app`
- Product/user explanation: present
- Why now: present
- Technology/AI disclosure: present
- Solana: selected
- Chain-use explanation: present, but the copy observed on 2026-09-30 still says M0 uses demo fixtures while live Panta credentials are pending — re-open and update if that stale wording is still present
- Category: `Developer Infrastructure`
- Team base: `Vietnam`
- Outside contributors disclosure: AI coding assistants disclosed; no unlisted human contributors claimed
- Additional judge context: the copy observed on 2026-09-30 still distinguishes GitHub-live vs Panta-demo — re-open and update if that stale wording is still present

Missing required project field:

- **Team Telegram contact**

Media audit:

- GitHub repository: present
- Project graphic: present
- X profile: present
- Live product link: currently blank; portal labels this optional, but fill it with production before final review
- Demo video: required and missing
- Pitch video: required and missing

## Founder submission-profile audit

Already present:

- Full name field currently displays `HoaNguyen` — **operator must verify this is the intended full-name value before final submission**
- Role: `Founder & Software Builder`
- Country: `Vietnam`
- City: `Nha Trang`
- X: `https://x.com/hoanguyen1609`
- GitHub: `https://github.com/ShenJun93`
- Relevant builder experience: present

Required personal fields still unresolved:

- **Gender**
- **Are you currently in school?**
- **Educational background**

Age is visible but did not show a required marker in the observed form; verify again before final submit.

Do not infer or fabricate personal answers.

## Panta API Sidetrack audit

Canonical listing:
https://superteam.fun/earn/listing/panta-api-side-track

Observed 2026-09-30:

- Status: open
- Region: Global
- Prize pool shown: 5,000 USDG
- Current public count observed: 7 submissions
- Winner announcement: October 28, 2026
- Requires official Colosseum registration and submission
- Requires submission to the Panta Sidetrack on Superteam Earn
- Requires **meaningful Panta API integration**
- Requires a **working demonstration / compelling prototype**
- Requires a clear explanation of how Panta API is integrated
- Submission must be in English
- Teams may participate in other eligible sidetracks according to official hackathon rules
- Panta API docs and the official Panta API Playground are listed as technical references

Current ShipSignal status against this listing:

**DO NOT SUBMIT YET.** ShipSignal now authenticates to the Panta API and production `/api/markets` returns the official `pk_test_` sandbox market. This proves real Panta API integration, and the production response/UI now explicitly label the environment as **test/sandbox, not mainnet**. Final sidetrack eligibility remains blocked until the demo is re-recorded and the submission language consistently describes this as Panta test/sandbox API data unless a production key is later used.

## Panta Terms audit

Canonical Terms:
https://docs.panta.market/guides/terms-of-use

Observed 2026-09-30:

- Obtaining API credentials, calling an endpoint, integrating the API, or making a product available using the API constitutes agreement to the Terms.
- Credentials must be safeguarded and may not be published in public source code.
- Products displaying Panta markets/data/functionality must use exact attribution **Powered by Panta**.
- Transaction/trading/market-creation features must clearly communicate the user action and obtain required authorization.
- Eligibility/geographic/KYC/age/access restrictions must not be bypassed.

The operator personally completed this legal gate on 2026-09-30. The credential is stored only in Vercel Production environment variables; do not expose or commit it.

## Superteam Vietnam Sidetrack audit

Canonical listing:
https://superteam.fun/earn/listing/colosseum-crypto-worlds-fair-hackathon-superteam-vietnam-track

Observed 2026-09-30:

- Status: open
- Region metadata: Global
- Prize pool metadata: 10,000 USDG
- Public count observed: 16 submissions
- Winner announcement: October 27, 2026
- Structured listing deadline: `2026-10-13T06:59:00Z`
- Listing requires:
  - submit info through the linked Google Form
  - join the linked Telegram group
  - meet Colosseum eligibility requirements
  - submit on both Colosseum and Superteam Earn
  - select **Vietnam** as Colosseum base country
  - pitch at **Demo Day on October 4, 2026**
  - online pitch is accepted for teams unable to travel
- Superteam Earn listing metadata marks this listing `HUMAN_ONLY`; automated agent submission is not permitted.
- Submission questions require a pitch-deck or Loom/video presentation link and a contact method.

Demo Day:
https://luma.com/e5iu9t0h

Observed event schedule:

- October 4, 2026
- 10:00–17:00 (GMT+7 event window)
- live pitching sessions are part of the agenda
- Luma event is primarily offline in Ho Chi Minh City
- sponsor listing separately states online pitching is accepted for teams unable to travel

**Open issue:** the source does not state the required pitch language. Because the operator does not want a spoken-English workflow, confirm whether Vietnamese pitching is accepted before committing to this sidetrack.

## Colosseum current-public audit

Canonical:
https://colosseum.com/worldsfair

Observed 2026-09-30:

- Hackathon runs Sep 14–Oct 12, 2026
- Product submissions are due October 12, 2026
- Solana Ecosystem track is listed
- Colosseum states hackathon winners will be interviewed and considered for its accelerator

This means the hackathon is not guaranteed to remain a no-interview route if ShipSignal wins. Treat that as an operator-awareness constraint, not as a reason to make or falsify eligibility claims.

## Media policy for this project

Do not reuse the deleted black-screen captures.

A valid demo must:

1. show the live production product, not slides;
2. show GitHub telemetry loading successfully;
3. show the authenticated Panta API environment accurately — currently **test/sandbox**, not mainnet;
4. show clear **Powered by Panta** attribution;
5. avoid exposing API keys, auth tokens, browser profiles, wallet secrets, or personal notifications;
6. stay <= 3 minutes;
7. be visually inspected at multiple timestamps before upload.

Pitch video must:

1. be separate from the demo;
2. stay <= 2 minutes;
3. explain problem, target user, product, why Panta/Solana matter, current proof, and why this founder can execute;
4. make no fabricated traction or partnership claims;
5. be reviewed against Colosseum and Vietnam-track requirements before upload.

## Next execution order

1. Keep final submission blocked.
2. Obtain operator-confirmed Telegram + founder personal fields.
3. Record and visually verify a new demo video from the verified production build.
4. Produce/review the separate pitch video.
5. Re-audit all form/video/README claims so Panta is described as authenticated **test/sandbox API** unless a production key is later used.
6. Resolve Superteam Vietnam live-pitch language/attendance constraint before entering that sidetrack.
7. Re-run security scan, clean-session production smoke, and final link checks after media/upload changes.
8. Run final PRE-SUBMIT audit.
9. Only after all required rows are PASS may the operator proceed to final human-only submissions.