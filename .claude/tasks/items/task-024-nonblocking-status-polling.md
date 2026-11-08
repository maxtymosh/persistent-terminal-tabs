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
