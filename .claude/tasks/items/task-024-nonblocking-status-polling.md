---
id: "TASK-024"
title: "Remove blocking status polling at 50 open chats"
status: "in-progress"
priority: "P1"
owner: "Max Tymoshyn"
issue: null
---

## Source

[Original lag report and 50-open-chat clarification](../captures/2026-11-07-ptt-lag.md).

## Outcome and acceptance

- [x] Measure the existing stall without manipulating user chats: 10 live sessions, old four snapshots 225 ms with 224 ms event-loop delay and 8 synchronous children.
- [x] Async snapshot uses 2 bounded child reads; measured 56 ms total with 1 ms event-loop delay. Native status/attachment/identity/RAM interpretation remains shared with diagnostics.
- [x] 50-open-chat activation fixture and 50/100-chat probe fixtures pass. Child probe count remains 2 per status read; concurrent clicks/ticks share a read.
- [x] Reject stale reads after explicit refresh and deactivation; no post-shutdown poll. Preserve existing user terminals and saved metadata.
- [x] Compile and 59-check acceptance verified under Node 22.22.2. Earlier full runs passed all 59; final parallel/serial runs passed 58, with the unchanged 600 ms provider-timeout fixture passing separately under extreme system load. No unrelated test timing was changed.
- [x] Package/install/public release: all 18 runtime modules match compiled output. Latest public 1.5.3 targets 8c3a967; all four anonymous downloads and nested checksums verified. See public-release.md. 1.5.3 activation was later verified at 2026-11-08 00:10 UTC; Max immediately reported persistent lag and grey/color flicker, so this is not live acceptance.

## Boundaries and limitations

This fixes measured PTT polling stalls, not every possible system-wide load source. Synchronous diagnostics, startup adoption and explicit legacy transcript discovery are retained. High-frequency background legacy Grok/Antigravity fd discovery is deferred to startup/explicit recap; stored conversation IDs remain unchanged. No user configuration/authentication, Codex home, terminal layout or active chat was modified.

## Audit and ownership

Audited origin/main 70bc4ff, recent authors/history, PRs and shared claims: no existing performance repair overlaps. Claim 3a5111615fb842f495c32daf8e69a40a, owner Max Tymoshyn, session codex-ptt-lag-20261107. Existing retained release claim owns public documentation and Marketplace continuation. The personal GitHub repository transfer remains authoritative.

## Suggested skills

- `norml-git`: shared task/checkout ownership, scoped integration and source parity.
- `dev-code-review`: local review of async races, native status evidence and scale behavior.
- `dev-changelog`: durable performance measurements and limitations.

## Worktrees

Task-owned worktree ID `ptt-lag-20261107`, branch `fix/nonblocking-status-polling`, base 70bc4ff. Created after Max's updated instructions required task-local checkouts; migrated only this task's edits with byte-for-byte verification, leaving the canonical checkout's unrelated legacy artifacts intact. Lifecycle JSON is stored in the common Git directory under `norml/worktrees/ptt-lag-20261107.json`.

Merge verified: implementation 3dc8de6 and release 8c3a967 integrated on origin/main. Installed runtime and anonymous public artifacts verified. Source remains on main and the retained feature branch. Tests, benchmark and release assets are retained in the common Git directory under norml/worktrees/ptt-lag-artifacts, outside the temporary checkout. No PR queue is configured.

Retirement: this task owns the checkout; its sole node_modules link points outward to canonical dependencies, and out/ is generated from the published source. No service was launched from it. Final process/ignored-file gates and the separate verified removal event are retained in norml/worktrees/ptt-lag-20261107.json; mandatory closeout checker runs after normal removal. The feature branch remains retained.

## Live follow-up — 1.5.4

Reopened after real 1.5.3 activation. Logs show live tmux identities but missing process ownership for every pane on startup; subsequent snapshots recover. Two-second child deadlines and remaining synchronous startup/diagnostic reads were retained by the first patch. Read-only samples during a later healthy interval show the extension host 98.2% idle and live reads around 109–271 ms; these do not measure the user's worst stalls. System load was around 300 with 3.6 GiB swap used. No other chat/process was killed.

Repair: remove all direct synchronous listSessions calls from extension UI/startup, make client adoption async, skip automatic fd discovery, decouple history initialization, extend async probe allowance to 8 seconds, log failures/recoveries, distinguish absent tmux server from failed transport and skip cleanup on failed evidence. Unknown work on a real failed read remains truthful; no cached-blue hold or title-only work inference.

Worktree `ptt-status-recovery-20261107`, branch `fix/status-read-recovery`, base 29f8c6c. Own renewed logical-task claim 827e55c1991440ac864494feeb15160b. Prior worktree was already normally removed; the new record lives under common Git norml/worktrees. Release documentation uses its separate retained task and checkout. Integration, activation verification and final closeout follow the acceptance checks.

Validation for 1.5.4: 50/100-session fixtures, 50-open activation with no synchronous status calls, slow 2.1-second successful process read, failed transport/recovery, stale-generation/shutdown and terminal retention after unavailable adoption evidence. Full serial suite passed 60/61 under contention; the unchanged 600 ms provider fallback fixture passes separately. Targeted acceptance is rerun after the adoption safeguard. No unrelated test budget was changed.

Loaded verification: native Restart Extensions applied 1.5.4 at 2026-11-08 00:28:43 UTC (Nov 7 local), adopting 26 existing native terminals with 28 live tmux sessions. The fresh status read at 00:28:53 took 2112 ms and resolved unknown=0, exercising the old deadline failure boundary on the real machine. All 28 pane-root PIDs in the immediately-pre-apply baseline remain after the final update. An earlier 29-pane baseline lost one session/saved record during ongoing interaction before this final update; cause/actor unverified and no universal preservation claim is made. No task command killed a session or forced a full window reload. The native action was needed because Developer Restart Extension Host alone retained the old extension descriptor.

Public latest 1.5.4 targets 32cf3d4; all four anonymous assets, nested VSIX/checksums and uploaded digests verified. This closes the concrete PTT code/read failure repair, not a claim that subjective/system-wide lag is entirely gone. Both task-owned checkouts are eligible for normal retirement after their narrow evidence commits; retained branches and common Git lifecycle records hold source and separate removal events.

## Reopened — Max still reports lag after 1.5.4

Max: “it's still lagging tho”. Earlier implementation/test acceptance does not establish resolution of the user-visible issue. Keep TASK-024 open. No 1.5.5 or additional speculative code patch was produced.

Fresh evidence: the initial machine reading showed load average 558.38 and about 7.1 GB swap used; renderer CPU spiked near 70% while the extension host was around 0.1%. A native extension-host profile spans 2901.862 seconds, with 2890.341 seconds classified idle; VS Code attributes 2162.73 ms of recorded activity to PTT. Direct reads inside the loaded extension host took 100–101 ms, ps 94–96 ms, with 2 ms maximum sampled timer delay. These do not rule out intermittent stalls outside the captured interaction.

GPU A/B: original global terminal.integrated.gpuAcceleration was off, with no workspace override. Temporarily set workspace auto through the public VS Code API, then removed that override and verified the original off setting. Short uncontrolled renderer samples were 12.5% versus 12.6% of one core; no demonstrated improvement, so no permanent tuning retained. Current load later fell to around 3.34 and swap to about 5.9 GB, independently of any proven fix.

Four live terminal focus changes acknowledged in 20–51 ms with 26 native terminals. This measures focus round-trip during the healthy interval, not typing/scrolling latency, cold reopen, 50 real live agents, or the user's worst lag. No message was typed/submitted to any chat. The CLI --status diagnostic was stopped because workspace-stat collection was long-running; no application, agent, tmux server or user job was killed.

Remaining acceptance: capture the exact slow interaction under the affected workload and attribute the delay to terminal input/layout/rendering, process pressure or PTT before choosing another fix. Non-stop mode remains active, so no clarification prompt was sent. The profile, samples, scoped setting before/after/restoration and focus probe are retained under common Git norml/worktrees/ptt-recovery-artifacts.

Worktree `ptt-render-profile-20261107`, branch `docs/remaining-terminal-lag`, base 6579c61; logical task remains owned by session codex-ptt-render-profile-20261107 and is parked for the uncaptured trigger. The source/evidence remain available without keeping this temporary docs checkout; its verified integration/removal events live in the common Git lifecycle record.
