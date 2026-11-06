---
id: "TASK-023"
title: "Dock new installs beside Terminal"
status: "done"
priority: "P1"
owner: "Max Tymoshyn"
issue: null
---

## Source

[Max's original request and clarifications](../captures/2026-11-06-default-terminal-location.md), November 6, 2026.

## Outcome and acceptance

- [x] On a new installation, dock the existing Sessions view in `workbench.panel.terminal` beside the native terminal view, matching the screenshot's area.
- [x] Preserve existing installations' saved arrangements and any later manual moves; never force placement on every activation.
- [x] Keyboard shortcut follows the actual view. Provide an explicit Dock Beside Terminal command.
- [x] Compile and all 55 tests pass. Native command completed in an isolated VS Code Extension Development Host; its renderer log records PTT_NATIVE_DOCK_SUCCEEDED. Native test storage is in-memory; cross-app persistence of VS Code layout is not separately claimed.
- [x] Packaged and installed 1.5.1; all 18 installed JavaScript modules match compiled/tested output. Public download verification is recorded in the release record.

## Implementation and ownership

`src/view-location.ts` handles first-run policy, legacy detection and native docking. Stable view/container IDs retain upgrade layouts. The first-run marker is per local VS Code profile; the older releases' global state or workspace-slice directory identifies an upgrade. The documented original container remains a fallback if the built-in move command is unavailable.

Audited origin/main 1f3e587, integrated history, authors, PRs and shared claims. No prior first-run docking exists. Feature claim 3620d09d086f4607982679a82b24fdeb belongs to Max Tymoshyn/session codex-ptt-default-terminal-location-20261106. The same conversation's retained public-release claim owns release documentation and publication separately.

## Suggested skills

- `norml-git`: audit, ownership, source/package parity and release.
- `dev-changelog`: preserve first-run policy and QA evidence.

## Worktrees

Canonical checkout: `Work Root/Infra/persistent-terminal-tabs`, branch main. No temporary Git checkout created. Native QA used a disposable VS Code profile/workspace in the session scratch directory. Existing untracked legacy ZIP/checksum artifacts remain untouched.
