---
id: "TASK-022"
title: "Add Uncombine Group beside Combine"
status: "done"
priority: "P1"
owner: "Max Tymoshyn"
issue: null
---

## Source

[Max's original request, November 6, 2026](../captures/2026-11-06-uncombine-group.md).

## Outcome and scope

Add a group-row Uncombine button that moves the group's open split terminals into separate native tabs and remembers that layout. Preserve running shells, saved membership, session identity and unrelated groups. Existing Combine restores the split preference. Repository legacy planning stays canonical; no GitHub issue mirror is enabled.

## Acceptance and evidence

- [x] Row button, right-click action and Command Palette command exist.
- [x] Native Unsplit retains the original live terminal objects, pane order and selected chat; sleeping chats remain closed.
- [x] Layout survives state serialization. New/reopened chats and group clicks respect it; explicit Combine reverses it.
- [x] Repeated commands, stale/empty groups and canceled large-group Combine are safe.
- [x] Compile and all 50 tests pass using Node 22.22.2, including registered-command behavior and manifest checks.
- [x] Packaged and installed `maxtymosh.persistent-terminal-tabs` 1.5.0. All 17 packaged and installed JavaScript modules match the compiled, tested output.
- Live activation remains pending the user's next Restart Extensions action. No window reload, terminal manipulation or live UI acceptance was performed in this task; the running log still records 1.4.1.

## Ownership and audit

Audited origin/main ff4418b, integrated authors/history, all available issues and PRs and the shared registry. Combine exists; reverse action was absent. No issues/PRs or active claims overlapped. Claim fcde961a4e57429a8578c14ea5f8f8b0, session codex-ptt-uncombine-20261106, human owner Max Tymoshyn. The explicit transfer to the personal public GitHub repository remains authoritative (see public-release.md).

## Suggested skills

- `norml-git`: audit, shared ownership, exact source commit and package/source parity.
- `dev-changelog`: record final behavior and layout persistence decision.

## Worktrees

Existing canonical checkout: `Work Root/Infra/persistent-terminal-tabs`, branch `main`; no temporary checkout created or removed. Unrelated pre-existing ZIP/checksum files preserved. Install verified as above; the feature commit carries the implementation and acceptance evidence together on the integration branch.
