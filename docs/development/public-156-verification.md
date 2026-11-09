# Public 1.5.6 release qualification

November 9, 2026. Owner: Max Tymoshyn. Reviewer: Codex owning-session self-review, `codex-ptt-public-156-20261109`; no independent review claimed.

## Authority and scope

Max requested public publication and repeated the instruction after being told that release-task transfer was required. The existing release reservation was explicitly transferred; its completed 1.5.5 GitHub delivery was closed against integrated evidence 806fa4b. The same logical `public-extension-release` task now owns this release in isolated worktree `ptt-public-156`, branch `release/ptt-156`. Target: public GitHub release v1.5.6. No Marketplace submission, desktop reinstall, provider login or account migration is included.

Previous public release: v1.5.5 at 2bb7d97185a59bb6335d6ef75d1e55fabf0a2ae7. Frozen runtime source: 36b858411810a93a06b194f0af055d3ec1a52ff5. Its main Quality CI run 42642113863 passed. Release-document changes must additionally pass their exact-head CI before guarded merge.

## Complete inclusion inventory

```
806fa4bc6685c548c3f3471697a9e9c5abdd7355 docs(release): verify loaded and public PTT 1.5.5
98d2a8c2dd915798b488f24a2d2456ab88fb6d4a ci(ptt): enforce source review, QA and package integrity
ec98c166e911b96d19493e8304d76defc7ed8d9a docs(ci): record real PTT validation and required checks
fab1bb137a86b7bf18aa16008c1a487b9c76be9f Merge pull request #1 from maxtymosh/chore/development-quality-pipeline
1114b6933c65eead4a95e92c5210c1198b21b25d docs(ci): adopt the stage-specific delivery contract
030777f56c5e9f679a3f2b4e3b9674031cf47b51 Merge pull request #2 from maxtymosh/docs/ci-cd-stage-bundle
76f5dea13c8c330eca01212daf73de1d990e2134 fix(persistence): retain Codex conversation profiles across reopen
36b858411810a93a06b194f0af055d3ec1a52ff5 Merge pull request #3 from maxtymosh/fix/codex-profile-persistence
```

- 806fa4b records already-completed 1.5.5 delivery; no runtime change.
- PR #1 / TASK-025 adds strict/lint/dependency/source/package gates and CI. Runtime cleanup removes unused functions, equivalent regex spacing syntax and redundant variable initializers; inspected the complete source diff for behavioral equivalence. Build-tool changes remove high vulnerabilities, with 13 moderate development-only lint/minimatch-chain findings retained. Runtime excludes development dependencies. Its verification and exact-source review are in `verification.md` and `gates/task-025.json`.
- PR #2 / TASK-026 adds stage-specific CI/CD documentation; no runtime change. Evidence: `ci-cd-stage-bundle-verification.md`.
- PR #3 / TASK-027 fixes exact Codex conversation/profile binding, atomic per-tab persistence, profile discovery and identity-safe resume/recaps. Risks: incorrect profile assignment, stale workspace saves, ambiguous histories, quoted paths, asynchronous late results and cold restore. Existing binding files remain readable; additive per-tab records require no destructive migration. Evidence: `codex-profile-verification.md`.
- This release updates only public installation filenames, notes and release evidence; no additional runtime changes or unmerged work.

## Combined checks and native evidence

Fresh `npm ci --ignore-scripts`; `npm run check` passed on pinned Node 22.22.2: strict types, zero-warning ESLint, 76 tests, zero failures, audit with zero high/critical vulnerabilities. Thirteen moderate development-only advisories remain accepted as disclosed tooling debt; no forced dependency upgrade or gate waiver. An initial additional run on system Node 26 also passed; the recorded required run is Node 22.

Actual VSIX verification checks the public-file allowlist, full module set, manifest and every module byte. All 19 modules and package manifest are byte-identical to the earlier native-qualified local 1.5.6 artifact; the embedded README now references 1.5.6. Public frozen SHA-256: `568c63de55fcef159b4a24021f76108a522e2383231331fae615d11ba13e212b`. The earlier artifact digest is `80bf866fd328c4ac292b0ab89042a59027433c6b74a078d36efd09c3bb90ff10`; the ZIP digest change is not described as identical bytes.

Native QA reran against modules extracted from the exact public candidate in actual VS Code 1.145.2 / macOS arm64, with a disposable home, user-data directory and distinct tmux socket. At 2026-11-09T18:13:54Z, six cases passed: stale slice recovery; exact profile/ID; quoted profile path; native terminal close/reopen preserving pane process; extension deactivate/reactivate preserving pane process; cold restore creating a new process with the same identity/profile/cwd. This uses a controlled CLI fixture and native VS Code terminal/command APIs. It is not a new provider-authentication test or a claim of production extension-host activation. Reuse the prior read-only matching of 11 live Codex identities only because runtime bytes are identical. No real user terminal, transcript, provider login or workspace state was modified.

The combined unit suite includes exact-ID history and recap behavior, late-result/shutdown rejection, stale saves, missing/ambiguous profiles, async status reads and 50-chat in-memory layout/attach fixtures. It does not spawn 50 native agents. Native cold/reattach testing covers the interaction of the new binding with the previously shipped fast live-open path.

## Review, compatibility and limits

Owning-session review inspected the full inclusion diff, release prose, target/version links, package allowlist and module equivalence. Source, native/runtime and public delivery are separate assertions. No blocking finding remains for this bounded GitHub release. Marketplace authentication is still unresolved. TASK-024 normal-workload freezing acceptance remains open; no broad performance claim. Native Windows, Linux, remote hosts, all provider authentication flows, and newly configured shared-SQLite/account-switch workflows were not independently qualified here. User account-manager settings are outside the extension change and were not modified.

Frozen installer, native result/harness, test/package logs, and subsequent delivery/download receipts are retained outside the temporary checkout in the common Git artifact home for `ptt-public-156`. The previous immutable public 1.5.5 remains the recovery version. Publication must use the frozen file, never regenerated qa-artifacts bytes. After release admission, guarded source integration and exact CI, deliver via `gh release create`, then verify tag, asset digests, anonymous downloads and nested bundle checksums.

Scoped review verdict: **Ship**. Native affected-journey verdict: **Pass**, with fixture/provider boundaries above. GitHub release verdict: **Ship**. Delivery verified: https://github.com/maxtymosh/persistent-terminal-tabs/releases/tag/v1.5.6. Tag targets `c4c95779ce3e2d8a1d71148203ee11d31930b3b7`; all four anonymous downloads, GitHub API digests and nested bundle/VSIX checksums match. Exact PR4 Quality run 42672423822 passed after two GitHub internal-server errors during the Actions incident. This receipt update changes documentation only; runtime/source package inputs remain identical to the qualified release.

## Worktree lifecycle

`ptt-public-156` created from 36b8584, owned by the release task; source integration and eligible checkout retirement follow public delivery. Durable lifecycle records retain merge and removal separately. Required installers/evidence live outside the checkout.

## Public artifact digests

- `install-prompt.md`: `sha256:7bfbf2804155e25c60c88259ebc9804c3701eef71c4661402a00b7101bfce042`
- `persistent-terminal-tabs-1.5.6.vsix`: `sha256:568c63de55fcef159b4a24021f76108a522e2383231331fae615d11ba13e212b`
- `ptt-install-bundle-1.5.6.zip`: `sha256:e2fe5da5e112c3561ea71ba9a0b8ae7fe436824c64c9f4282787109f75cc8ae8`
- `sha256sums.txt`: `sha256:ad8c2791e429a9335b56262d40dc21c5bb02249f0bfa54ef9954aa3b9e9f1e0c`
