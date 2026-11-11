# Public 1.5.7 release qualification

November 11, 2026. Owner: Max Tymoshyn. Reviewer: Claude owning-session self-review, `claude-ptt-public-157-20261111`; no independent review claimed.

## Authority and scope

After the TASK-028 fix was merged in PR #6, Max wrote "okay, publish and release that fixes". The previous release claim for 1.5.6 was already released; the same logical `public-extension-release` task owns this release in isolated worktree `ptt-public-157`, branch `release/ptt-157`. Targets: public GitHub release v1.5.7 and installation of the same frozen VSIX into Max's desktop VS Code default profile. No Marketplace submission, provider login or account migration is included. Activating the installed build needs Restart Extensions in Max's own window; this session does not drive his UI.

Previous public release: v1.5.6 at c4c95779ce3e2d8a1d71148203ee11d31930b3b7. Frozen package source: 3632ddf40520ba7f3ce79579e5f3ee29bf2a9275, whose runtime source equals main da37c737d4f785637f2f2c99e441c1736ce37833. Main Quality run 43061980259 passed on da37c73. Release-document changes must additionally pass their exact-head CI before guarded merge.

## Complete inclusion inventory

```
ff6ccf584f31969538cda1c11a4b1f8e13e670df docs(release): verify public PTT 1.5.6 downloads
d306862f07652e2eedb5fb3fd26071470cb0b071 Merge pull request #5 from maxtymosh/release/ptt-156
c857cd11b7fcfcfb8882d71c41405aae524ef8b8 fix(groups): stop the New Group error toast after a group is created
da37c737d4f785637f2f2c99e441c1736ce37833 Merge pull request #6 from maxtymosh/fix/new-group-reveal
3632ddf40520ba7f3ce79579e5f3ee29bf2a9275 chore(release): set PTT 1.5.7 version and install filenames
```

- PR #5 records the completed 1.5.6 delivery. Documentation and gate record only; no runtime change.
- PR #6 / TASK-028 adds `TabsTree.getParent` for the flat tree and makes the post-creation reveal best-effort. Risk: creating a group now really reveals, selects and focuses its row, which never ran before; a wrong parent chain or item id would leave the row unselected. No state format, persistence, tmux, process or provider path changes; no migration. Evidence: `new-group-reveal-verification.md`, `gates/task-028.json`, PR Quality run 43061725904.
- 3632ddf sets the version to 1.5.7 in the manifest and lockfile, adds the changelog entry shipped inside the VSIX and renames the install assets in the README and install prompt. No runtime source change.
- This release adds only release notes and release evidence on top. No unmerged work is included.

Runtime equivalence with public 1.5.6: 17 of 19 compiled modules in the frozen VSIX are byte-identical to the published 1.5.6 package. `tree.js` and `extension.js` differ, and their compiled diff is exactly the two TASK-028 hunks.

## Combined checks and native evidence

Fresh `npm ci --ignore-scripts`; `npm run check` passed on pinned Node 22.22.2: strict types, zero-warning ESLint, 77 tests, zero failures, audit with zero high or critical vulnerabilities. Thirteen moderate development-only advisories remain accepted as disclosed tooling debt; no forced dependency upgrade or gate waiver.

Actual VSIX verification checks the public-file allowlist, full module set, manifest and every module byte. Frozen VSIX: 27 extension files, 19 runtime modules, SHA-256 `ed6479bf2ebeabb8e2700110a815274c36f5f1eb56971360cde86f9b82e4b46e`.

Native QA ran in actual VS Code 1.145.2 on macOS arm64. Every run used a separate background VS Code instance with a disposable home, user-data directory, extensions directory and tmux socket. A test driver aborts the instance unless its home resolves inside the disposable root; a dry run confirmed that isolation first.

Install journey. The VS Code CLI installed a VSIX into the disposable extensions directory. All installed files were compared with the VSIX; the only difference is the install metadata key VS Code adds to the installed manifest. VS Code then activated the extension itself on startup. The real `terminalTabs.newGroup` command ran and the real project picker opened. The driver moved the highlight to the workspace-folder entry with VS Code's list navigation command and accepted it with VS Code's accept command. Nothing was stubbed. The driver observes the extension's real tree view, picker and group open command without altering them.

| Package | Time (UTC) | Result |
| --- | --- | --- |
| Published 1.5.6, SHA-256 `568c63de…` | 2026-11-11T17:49:53Z | Activated as 1.5.6; provider has no `getParent`. Group saved, then the command rejected with `Required registered TreeDataProvider to implement 'getParent' method to access 'reveal' method`. PASS as a reproduction of the reported defect. |
| Frozen 1.5.7, SHA-256 `ed6479bf…` | 2026-11-11T17:50:12Z | Activated as 1.5.7, confirmed by the extension's own log. Command resolved; the real tree view selected the new group row and reported itself visible. A second group for the same folder was created and selected. The group open command did not run. PASS. |

Lifecycle regression. The six-case harness from the 1.5.6 qualification, unchanged (SHA-256 `870914d6…`), ran against modules extracted from the frozen 1.5.7 VSIX at 2026-11-11T17:51:40Z. All six passed: stale slice recovery; exact profile and ID; quoted profile path; native terminal close and reopen keeping the pane process; extension deactivate and reactivate keeping the pane process; cold restore creating a new process with the same identity, profile and cwd. This uses a controlled CLI fixture and native VS Code terminal and command APIs.

No real user terminal, transcript, provider login or workspace state was modified. The install journeys ran with a disposable home. The lifecycle harness redirects the extension's home inside the extension host and uses its own tmux socket; the count of live sessions on the user's socket was 45 before and after that run.

## Review, compatibility and limits

Owning-session review inspected the full inclusion diff, release prose, target and version links, package allowlist and module equivalence. Source, native runtime, public delivery and desktop installation are separate assertions. No blocking finding remains for this bounded release.

Limits. The native journeys are not a provider-authentication test and not a claim that the production extension host has loaded this build. The folder Browse dialog was not exercised. Marketplace authentication is still unresolved. TASK-024 normal-workload freezing acceptance remains open; no performance claim. Native Windows, Linux and remote hosts were not independently qualified.

Observation, not changed in this release: the project picker opens with "Browse for a folder…" highlighted, not the first project, because the code that restores the previous highlight also matches the Browse entry when there is no previous highlight. Pressing Enter immediately therefore opens the folder dialog. It is recorded for a separate decision.

Frozen installer, public assets, native results and harnesses, logs and delivery receipts are retained outside the temporary checkout in the common Git artifact home for `ptt-public-157`. Public 1.5.6 remains the recovery version. Publication must use the frozen files, never regenerated `qa-artifacts` bytes. After release admission, guarded source integration and exact CI, deliver through `gh release create`, verify tag, asset digests, anonymous downloads and nested bundle checksums, then install the frozen VSIX with the VS Code CLI and compare installed modules.

Scoped review verdict: **Ship**. Native affected-journey verdict: **Pass**, with the boundaries above. Release verdict for GitHub publication and desktop installation: **Ship**. Delivery results are recorded after publication.

## Worktree lifecycle

`ptt-public-157` created from da37c73, owned by the release task; source integration and checkout retirement follow delivery. Durable lifecycle records retain merge and removal separately. Required installers and evidence live outside the checkout.

## Public artifact digests

- `install-prompt.md`: `sha256:171d361fec8aca5e4d1dfe2680efc6bbfed92b9a9b2118b03defdea8971ebd23`
- `persistent-terminal-tabs-1.5.7.vsix`: `sha256:ed6479bf2ebeabb8e2700110a815274c36f5f1eb56971360cde86f9b82e4b46e`
- `ptt-install-bundle-1.5.7.zip`: `sha256:2429ea30dbc4c4ede441af03fae403ba8b53737fc18e00c3e6edb7708567102b`
- `sha256sums.txt`: `sha256:6f94206009673d094dad1913b2c967be40f1f4833214d83eb8011121b2975941`
