# New Group reveal verification

Date: November 11, 2026. Task: TASK-028. Reviewer: Claude owning-session self-review for Max Tymoshyn; no independent review claimed. Base: d306862f07652e2eedb5fb3fd26071470cb0b071.

## Failure and corrected contract

Creating a group from the panel ended in the toast `Error running command terminalTabs.newGroup: Required registered TreeDataProvider to implement 'getParent' method to access 'reveal' method`. The group was saved and usable; the command rejected afterwards, at `view.reveal()`. `TabsTree` never implemented `getParent`, which VS Code requires before it will reveal anything. The pinned `@types/vscode` 1.125.0 states the requirement in the `TreeView.reveal` documentation. The call arrived with named project folders in 1.3.0 and shipped unchanged through 1.5.6.

The existing group test did not catch it because its tree-view double resolved every `reveal()`.

Corrected contract: the tree is flat, so `getParent()` returns `undefined` for every row. Stable item ids let VS Code resolve the freshly built node to the visible row. `newGroup` now logs the creation, then reveals inside a guard. A reveal failure is logged and no longer reported as a failed command.

The same report included Claude not starting in that folder. That was a Google Drive file-provider stall on the machine, resolved outside this repository; it is recorded in TASK-028 and is not evidence for or against this change.

## Checks and review

- Baseline: `test/new-group-reveal.test.cjs` run against base d306862 fails with the exact reported message. It passes on the fix.
- Node 22.22.2: strict types, zero-warning ESLint and **77 tests passed, 0 failed** (76 existing plus the new regression). The regression uses a tree-view double that rejects without `getParent` and otherwise resolves by parent chain and item id. It covers the new group row, a chat row, and a second group whose reveal fails for another reason: that group is still saved, both log lines are written and the command resolves.
- Source review of the exact diff, two source files and one test. `getParent` takes no state and cannot race. The reveal guard changes ordering only by logging before reveal; the command still awaits the reveal, so callers see the same completion point. No state format, persistence, tmux, process or provider path is touched. No secrets or personal paths. No blocking finding.
- Behavior change to note: reveal now actually runs. With `select` and `focus` as already written in 1.3.0, creating a group opens the Sessions view if it is hidden, selects the new row and moves keyboard focus to it. Selecting a row this way does not run the row's open command; the native run counted zero `terminalTabs.openGroup` invocations.
- Dependency audit: zero high or critical findings; 13 moderate findings remain in the existing development lint chain. No dependency versions changed. No force upgrade or waiver.
- Package check: candidate VSIX builds with 19 compiled modules and passes the module-byte and public-file allowlist checks. It still reports version 1.5.6 because this task does not version or release.
- Architecture, TASK-028 and the task index updated. Task ownership and the isolated checkout receipt were verified; no other owner's checkout or chat was operated.

## Native surface

Actual VS Code 1.145.2 on macOS arm64, launched as a separate background instance with a disposable user-data directory, extensions directory, home and tmux socket. A harness extension contributes the product's views, commands and settings; the test loads a module set into the real extension host, activates it and executes the real `terminalTabs.newGroup` command against the real tree view. Two things are replaced: the project picker returns a fixed folder instead of showing its QuickPick, and the Codex history provider is a no-op. The real `createTreeView` result is observed, not altered. tmux use is disabled by setting.

| Module set | Result |
| --- | --- |
| Shipped 1.5.6 runtime | Provider has no `getParent`. Group is saved, then the command rejects with the reported message. PASS as a reproduction. |
| This source | Provider has `getParent`. Command resolves. The real tree view selects the new group row and reports itself visible. A second group for the same project is created after the inbox and selected too. The group open command did not run. PASS. |

Limits. The project picker's own UI was not exercised. The toast itself was not screenshotted; the rejection that produces it was observed on the shipped runtime and is absent on the fix. The module set was loaded from compiled output, not installed from a VSIX, so this is not an installed-version or loaded-version claim. No real provider, credential, user profile, production window or live tmux session was used. Raw results, harness and logs are preserved outside the checkout in the task artifact home.

## Delivery

None in this task. No version bump, publication or installation. Installed and public 1.5.6 keep the defect until a later release includes this change under a new version number. That release should confirm, on the installed build, that creating a group from the toolbar shows no toast and selects the new row.

Scoped source verdict: **Ship**. Release verdict: **Hold**; no release was requested or performed.
