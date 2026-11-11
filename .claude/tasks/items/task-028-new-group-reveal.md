---
id: "TASK-028"
title: "Stop the New Group error toast after a group is created"
status: "done"
priority: "P2"
owner: "Max Tymoshyn"
issue: null
---

## Source and scope

On November 11, 2026 Max reported that Claude would not start inside a PTT folder and attached screenshots showing `Error running command terminalTabs.newGroup: Required register…`. Two separate causes were found.

The Claude hang was outside PTT. The folder's project directory is on Google Drive, macOS had evicted the instruction files Claude reads at startup, and the system file-provider daemon had stopped serving downloads. Restarting that daemon fixed it. No PTT code was involved and none changed for it.

The toast is a PTT defect and is this task. `New Group` saved the group, then `view.reveal()` rejected with VS Code's `Required registered TreeDataProvider to implement 'getParent' method to access 'reveal' method`, because `TabsTree` never implemented `getParent`. The group existed and worked, but every creation ended in an error toast and the creation log line never printed.

## Acceptance

1. `terminalTabs.newGroup` resolves after creating a group. No command error reaches the user.
2. The new group row is revealed and selected in the real tree view.
3. A reveal that fails for any other reason is logged and does not turn a saved group into a command error.
4. A regression fails on the previous source for the reported reason and passes on the fix.
5. Source integration only. No version bump, package publication or installation belongs to this task.

## Implementation / validation

`TabsTree.getParent()` returns `undefined`: the tree is flat, so every row is top-level. `newGroup` logs the creation first and treats the reveal as best-effort. The regression in `test/new-group-reveal.test.cjs` uses a tree-view double that enforces VS Code's documented reveal contract; the older always-succeeding double is why the defect shipped. Unit and native results are in `docs/development/new-group-reveal-verification.md`. Owning-session self-review; no independent reviewer is claimed. Git operations follow norml-git.

## Release handoff

Released in 1.5.7 on November 11, 2026: [GitHub release](https://github.com/maxtymosh/persistent-terminal-tabs/releases/tag/v1.5.7), qualification and delivery in `docs/development/public-157-verification.md`. The frozen 1.5.7 package, installed into a disposable profile, passed the New Group journey through the real command and project picker. The same package is installed in Max's desktop VS Code; it loads after Restart Extensions. Confirming no toast in his own window after that restart is the one remaining acceptance step.

## Worktrees

`ptt-new-group-reveal`, branch `fix/new-group-reveal`, base `d306862`, owner Max Tymoshyn, claim `95476df7c25c456aa3e86f1e561e7ae8`. Durable lifecycle and evidence live in the canonical common Git `norml/worktrees` directory. Retire after verified integration and artifact preservation; otherwise record the exact remaining gate and retention condition.
