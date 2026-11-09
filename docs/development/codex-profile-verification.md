# Codex profile persistence verification

Date: November 9, 2026. Task: TASK-027. Reviewer: Codex owning-session self-review for Max Tymoshyn; no independent review claimed. Base: 030777f56c5e9f679a3f2b4e3b9674031cf47b51.

## Failure and corrected contract

Three manually named saved tabs had been recorded as Claude without Codex identity. Their conversations were intact in the separate CLI profile. Original main compiled in an isolated fixture reported `separate CLI conversation found: false`; the corrected exact-identity fixture finds it. No transcript deletion was established. Manual resume was a workaround, not the fix.

Persist the exact pair of conversation ID and owning profile. Independent per-tab atomic binding files survive stale workspace saves and avoid cross-window aggregate replacement. Legacy string links stay compatible. Discover homes from explicit/default/CLI profiles and verified foreground native descriptors; read paginated metadata with local read-only app-server methods. Names only match complete unique native titles, scoped by home when observed. Never choose a conversation by cwd or recency. Exact missing/ambiguous history preserves the record and reports the issue. Resume pins the profile after the login shell initializes and bypasses interactive shell account-switching functions.

## Checks and review

- Node 22.22.2: strict types, zero-warning ESLint and **76 tests passed, 0 failed**. Includes profile lookup, corrupt identity, duplicate account copies, missing saved profile, stale host save/reload, exact-home API requests, foreground custom-home discovery, asynchronous binding and late-result rejection after shutdown. Existing 50-chat in-memory attach/layout checks pass without creating real load.
- Baseline failure was reproduced against current main separately. New exact lookup, saved-binding and launch contracts pass. Read-only observation using the candidate matched all 11 currently running Codex chats, including all three reported failures, to exact native metadata and native SQLite profile descriptors. Both old default-home and new CLI-home conversations remained distinguishable. No credentials, auth files, transcripts or provider configuration were copied or changed.
- Source review covered process ownership, async shutdown/store/process/title guards, profile ambiguity, stale name cache, quoted shell paths, exact missing-history behavior and independent-window persistence. Review caught the aggregate-ledger race and changed it to one atomic file per tab. Quoting covers the entire shell program, profile and failed-resume command. No blocking review finding remains within the scoped repair.
- Dependency audit: zero high/critical findings; 13 moderate findings remain in the existing development lint/minimatch chain. No dependency versions changed. These packages are excluded from runtime; no force upgrade or waiver was used.
- Architecture and TASK-027 record updated. Task ownership and isolated checkout receipt verified; no other owner's checkout or chat was operated.

## Native surface

Actual VS Code 1.145.2 on macOS arm64 loaded the candidate's extracted runtime modules inside a disposable native extension harness, user-data directory and tmux socket. Six affected lifecycle cases passed: stale saved-state recovery; exact profile/ID; spaces/apostrophe/dollar in profile path; native terminal close/reopen keeping the same pane process; extension deactivate/reactivate keeping that process; cold process restore using the same conversation/profile with a new process. The controlled CLI fixture records argv, cwd and selected home; actual Codex provider identity observation is a separate read-only check, not inferred from the fixture. Initial harness-only failures (unregistered test setting and macOS path alias comparison) were corrected and rerun. No production terminal was killed or restarted.

Native module tests are not a claim that the production extension host has loaded this update, nor that every provider/authentication flow was exercised. The real user manually resumed the three actual conversations during recovery; exact identity readback confirmed each. Actual post-install production reload remains a delivery readback step. Existing TASK-024 broad workload/performance acceptance stays open.

## Selected delivery and recovery

Target: local VS Code update for this repair, **not** a Marketplace or public GitHub release. Previous installed immutable version: 1.5.5. Source scope since that runtime includes this persistence repair and already-integrated pipeline/documentation changes; the latter do not change runtime modules. The candidate VSIX contains 19 compiled modules; all module bytes and public-file allowlist were verified.

Frozen native-qualified candidate SHA-256: `80bf866fd328c4ac292b0ab89042a59027433c6b74a078d36efd09c3bb90ff10`. Native raw results, controlled harness, live observation and frozen installer are preserved outside the temporary checkout in the canonical common Git task artifact home. Future repackaging must compare module bytes to this tested candidate; never substitute a different runtime. Local intentional recovery backs up affected metadata before applying verified identities. Source integration, installed bytes, production activation and accepted real reopening are separate facts. No production activation or broad acceptance PASS is claimed here.

Scoped source verdict: **Ship**. Selected local-install verdict: **Ship**, on the tested runtime and preserved data; production activation readback remains required. Public distribution is outside this task.
