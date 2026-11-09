---
id: "TASK-027"
title: "Preserve Codex conversations across separate CLI profiles"
status: "in-progress"
priority: "P0"
owner: "Max Tymoshyn"
issue: null
---

## Source and scope

Max reported three saved PTT tabs reopening as empty shells and stated that this breaks PTT's core persistence promise. Read-only investigation confirmed intact Codex conversations in a separate CLI home, while PTT kept Claude-labelled records without the provider conversation IDs. Manual CLI resume is recovery, not product acceptance.

## Acceptance

1. Capture exact provider conversation ID plus owning home after manual launch in a tab, including shell-wrapped processes and modern paginated history.
2. Preserve bindings outside stale workspace snapshots; retain tab title, cwd, grouping and order.
3. Resume the exact identity using the saved profile, independently of the current shell's Codex account default. Missing/ambiguous identity must never select the newest conversation in a folder.
4. Keep live attach fast, asynchronous observation bounded and late results fenced after shutdown/store/process changes.
5. Reproduce old failure, pass fixture and actual native lifecycle checks, and verify actual real-provider identity observation. Preserve the three affected local records with reversible backup.
6. Guarded source integration and local installation only after their gates. No Marketplace/public release is implied. Actual loaded-version and real reopening acceptance remain distinct from source tests.

## Implementation / validation

Profile-aware read-only metadata, bounded foreground-owner observation, durable profile bindings, exact rollout lookup and profile-pinned cold launch. Unit regressions and native checks recorded in `docs/development/codex-profile-verification.md`. Owning-session self-review follows dev-code-review; no independent reviewer is claimed. Git operations follow norml-git. Existing TASK-024 performance acceptance remains separate.

## Worktrees

`ptt-codex-profile-persistence`, branch `fix/codex-profile-persistence`, base `030777f`, owner Max Tymoshyn, claim `b861927ffc76446b9c0b5db5102ee990`. Durable lifecycle/evidence lives in the canonical common Git `norml/worktrees` directory. Retire after verified integration and artifact preservation; otherwise record the exact remaining gate and retention condition.
