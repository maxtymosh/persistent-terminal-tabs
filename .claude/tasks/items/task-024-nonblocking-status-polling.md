---
id: "TASK-024"
title: "Remove blocking status polling at 50 open chats"
status: "done"
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
- [x] Package/install/public release: all 18 runtime modules match compiled output. Latest public 1.5.3 targets 8c3a967; all four anonymous downloads and nested checksums verified. See public-release.md. Live activation remains a separate user restart action.

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
