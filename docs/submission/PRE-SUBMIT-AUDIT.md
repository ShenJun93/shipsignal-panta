# ShipSignal — Pre-Submit Audit

Last audited: 2026-10-02 (Asia/Ho_Chi_Minh)

## Decision

**COLOSSEUM READY — WAITING FOR SUBMISSION WINDOW — DO NOT SUBMIT YET**

The authenticated Colosseum review page says `Your project is ready.` All currently editable required Colosseum fields are complete. The portal says submission opens `October 6, 2026 at 4:00 AM PDT`, so final submission remains blocked until that window opens and the final pre-submit checks are rerun.

Panta sidetrack readiness depends on the eventual Colosseum submission. Superteam Vietnam remains a separate `HUMAN_ONLY` hold while pitch-language/attendance handling remains unresolved.

## Canonical product state

- Workspace: `E:\Projects\BH-0005-shipsignal-panta`
- Audited product-code baseline: `9652a475a79a09442ef54320caf51e00ca0a1cf7`
- Docs-only audit refreshes may advance `main`; current remote HEAD must be read from Git rather than inferred from this document
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
| Production homepage | PASS | Clean WAG final-link smoke revalidated production on 2026-10-02. |
| Live GitHub telemetry | PASS | Clean BrowserPort run on 2026-10-01 analyzed PR #375 successfully and showed delivery score 80. |
| Panta attribution | PASS | Product visibly uses exact text **Powered by Panta**. |
| Authenticated Panta API integration | PASS | Production `/api/markets` returns authenticated Panta API data. Current credential is a Panta **test** key and returns the official sandbox market, not mainnet data. |
| Panta API legal gate | PASS — operator completed | Operator personally completed the Panta Terms / credential gate before authenticated API use. |
| Panta credential handling | PASS so far | `PANTA_API_KEY` is stored as a Vercel Production secret and is not present in the repository/workspace. Re-scan before final submit. |
| Panta environment labeling | PASS | Production now returns `environment: test`, shows **PANTA TEST API**, and displays `Authenticated Panta test API — sandbox market data, not mainnet.` |
| Panta Sidetrack working demo | PASS | Corrected 59.9s production demo with AAC voiceover is uploaded Unlisted at `https://www.youtube.com/watch?v=ojFtIuhCa3Y` and persisted in Colosseum. Local ffprobe verifies H.264 + AAC audio; captions accurately label Panta TEST/sandbox/not-mainnet. |
| Colosseum project details | PASS | All required project-detail fields are complete, including the operator-confirmed Telegram contact. |
| Colosseum media | PASS | Authenticated portal shows **Media and code Complete**. Demo and pitch URLs are persisted server-side and both YouTube links are reachable from a clean WAG session. |
| Colosseum founder/team profile | PASS | Required personal profile fields were filled only from operator-confirmed values; authenticated review now shows `Submission profile: Complete`. |
| Colosseum review readiness | PASS / READY | Authenticated review page explicitly says `Your project is ready.` |
| Colosseum submission window | WAITING | Portal says submission opens `October 6, 2026 at 4:00 AM PDT`; do not submit before the window opens. |
| Project graphic | PASS | `docs/submission/shipsignal-project-graphic.png` uploaded to Colosseum. |
| Demo video | PASS | Corrected 59.9s H.264 + AAC product demo uploaded to YouTube as Unlisted: `https://www.youtube.com/watch?v=ojFtIuhCa3Y`. The prior `eL-SsnCKv2M` upload was silent because its source file had no audio stream and is no longer used in Colosseum. |
| Pitch video | PASS | Authenticated Colosseum portal requires **Up to 2 minutes**. The 94.07s primary candidate was uploaded to YouTube as Unlisted: `https://www.youtube.com/watch?v=nrI4ky_LUL4`. Clean WAG session opens the video successfully. The 136.776s v2 remains backup only. |
| Git history / hackathon-window evidence | PASS so far | ShipSignal repository and implementation commits are dated during the current hackathon period. Re-check before final submit. |
| Secret scan | PASS as of 2026-10-02 | Tracked-worktree path-only scan found no credential-shaped `sk-`, `ghp_`, `pk_live_`, `pk_test_`, or private-key material. |
| Local browser-profile hygiene | PASS | Temporary `.edge-demo*` profiles removed and ignored. |
| Final clean-session judge test | PASS for technical/public links | On 2026-10-02 a fresh WAG session opened production, the public GitHub repo, corrected demo `ojFtIuhCa3Y`, and pitch `nrI4ky_LUL4` with no 404/private/unavailable blockers. Personal/contact form blockers remain separate. |
| Final claim audit | PASS so far | Authenticated Colosseum project details use authenticated Panta test/sandbox wording, explicitly not mainnet. Demo and pitch URLs are now persisted. Re-check once more immediately before final submit. |

## Colosseum form audit

Current project-details values observed in the authenticated local Edge session:

- Project name: `ShipSignal`
- Brief description: present
- Project website: `https://shipsignal-panta.vercel.app`
- Product/user explanation: present
- Why now: present
- Technology/AI disclosure: present
- Solana: selected
- Chain-use explanation: updated in the authenticated portal to state production reads authenticated Panta test/sandbox API data and that the current build does not create markets, execute trades, or sign wallet transactions
- Category: `Developer Infrastructure`
- Team base: `Vietnam`
- Outside contributors disclosure: AI coding assistants disclosed; no unlisted human contributors claimed
- Additional judge context: updated in the authenticated portal to state GitHub telemetry is live and Panta is authenticated official test/sandbox data, explicitly not mainnet

Required project fields:

- **PASS** — team Telegram contact is present using the operator-confirmed value. The contact value is intentionally not duplicated in this public repository.

Media audit:

- GitHub repository: `https://github.com/ShenJun93/shipsignal-panta` — now **public**; logged-out clean WAG session opens repository + README
- Project graphic: present
- X profile: present
- Live product link: present — `https://shipsignal-panta.vercel.app`
- Demo video: persisted — `https://www.youtube.com/watch?v=ojFtIuhCa3Y` — corrected 59.9s H.264 + AAC voiceover build; prior silent URL is superseded
- Pitch video: persisted — `https://www.youtube.com/watch?v=nrI4ky_LUL4` — 94.07s, Unlisted, clean-session accessible, within authenticated portal's **Up to 2 minutes** rule

## Founder submission-profile audit

- Full name value was explicitly confirmed by the operator.
- Role, country, city, X, GitHub, and relevant builder experience are present.
- Required personal fields were completed using only operator-confirmed values; those personal values are intentionally not duplicated in this public repository.
- Authenticated Colosseum review now shows `Submission profile: Complete`.
- Age did not show a required marker in the observed form.

**PASS.** Do not infer, expand, or alter personal-profile answers without new operator input.

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

**TECHNICALLY READY / WAITING FOR COLOSSEUM SUBMISSION.** ShipSignal authenticates to the Panta API and production `/api/markets` returns the official `pk_test_` sandbox market with explicit **test/sandbox, not mainnet** labeling. Corrected demo + pitch are uploaded and persisted, GitHub is public, and the authenticated Colosseum review says `Your project is ready.` Panta sidetrack submission must remain pending until the required Colosseum submission exists.

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

Pitch / presentation video must:

1. be separate from the product-demo video;
2. be **no more than 2 minutes** for the actual authenticated Colosseum submission field, as verified on 2026-10-02;
3. explain problem, target user, product, why Panta/Solana matter, current proof, and why this founder can execute;
4. make no fabricated traction or partnership claims;
5. be reviewed against the authenticated portal and Vietnam-track requirements before upload.

A public FAQ observed earlier said 2–3 minutes, which conflicts with the authenticated submission form. For the Colosseum portal field, the authenticated form is the controlling submission constraint. The product-demo field remains **up to 3 minutes**.

## Next execution order

1. Keep final Colosseum submission blocked until the portal window opens `October 6, 2026 at 4:00 AM PDT`.
2. Immediately before submission, re-run clean-session checks for production, public GitHub, corrected demo, and pitch.
3. Re-run secret scan, lint, TypeScript, production Panta response, and final claim audit.
4. Confirm the portal still says `Your project is ready.` and that the verified URLs/answers have not changed.
5. Keep the final Colosseum submit action human-only.
6. After a valid Colosseum submission exists, prepare the Panta sidetrack human submission.
7. Superteam Vietnam remains a separate HUMAN_ONLY hold until pitch-language/attendance handling is confirmed.