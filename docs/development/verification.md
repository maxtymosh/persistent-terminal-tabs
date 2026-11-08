# TASK-025 engineering verification

Date: November 8, 2026. Owner/reviewer: Codex owning session for Max Tymoshyn, applying dev-code-review and MoonPress engineering-admission principles. This is a local self-review, not an independently staffed review. Scope: PTT development/QA pipeline; no native release, installed extension replacement or public artifact mutation.

## Prior-work comparison

Read current remote MoonPress Chat develop CONTRIBUTING, CI/release workflows and QA intake guide, plus current Shuttle main CI, mandatory engineering gate, eight-step publication contract and separate release/native evidence. The local Shuttle clone was older; the remote contracts were used. Adapted source-bound review, actual build provenance, unprivileged validation and accurate QA scope. Did not copy WordPress Docker fixtures, cloud/database deployment, signing/rings, credentials, shared self-hosted runners or private ecosystem dependencies into PTT.

## Review and changes

Reviewed all changed source, test, tooling and configuration paths. Verdict: Ship for pipeline source integration; Hold for native/public release. Removed only two unreferenced private functions and redundant initial assignments caught by lint. Gemini title regex spacing is equivalent. Existing command wiring remains; no runtime behavior feature is claimed. Checked gate source coverage, evidence integrity/path safety, deleted and untracked inputs, mode changes, exact PR/head/current-main/CI binding, native release refusal, workflow permissions, packaged module sets, byte hashes and package allowlist.

No remaining critical source-review findings. Dependencies are development-only. Compatible npm audit fixes removed six high advisories from Azure identity/MSAL, brace-expansion, fast-uri, markdown-it and undici. Thirteen moderate dependency entries remain from minimatch globparts amplification (GHSA-g3hv-75wg-m249), including its dev-tool ancestors; the installed VSIX has no node_modules. The explicit high/critical audit threshold passes; there is no claim of zero advisories. Do not force an incompatible transitive-major override solely to hide this report; recheck on future changes.

## Observed local checks

- Node 22.22.2; pinned ESLint 10.14.0 and typescript-eslint 8.72.1; locked dependency install with scripts disabled.
- Strict TypeScript and zero-warning ESLint pass. Unit/regression suite: 71 passed, zero failures, around 3.2 seconds. Existing 50/100-chat tests use in-memory terminal/process fixtures; no real synthetic chats, agents or tmux sessions were launched.
- New isolated Git fixtures exercise missing/stale/failed review, source mutation, tampered evidence, unsafe paths/symlinks, file modes, deletions, hidden script refusal, dirty merge refusal, and separate native release admission.
- VSIX verifier regression cases reject stale/extra runtime modules, private/development files and unknown package files. The first real package check rejected worktree.md; .vscodeignore now excludes it. The strict allowlist explicitly includes the actual LICENSE.txt. Actual packaging verifies 18 compiled runtime modules and extension identity; no install or publish occurs.
- npm audit --audit-level=high passes with the disclosed moderate development findings. Final CI must re-run the complete check chain on the exact pushed source and retain package provenance; no CI PASS is asserted before its result.

## Behavior, maps and acceptance

Actual affected surface is the development CLI and GitHub pipeline, tested by invoking commands and exercising their rejection paths. Native VS Code UI/provider flows were not run for this source-only change and cannot qualify release admission. The native QA checklist maps docking/upgrades, visible icons, Combine/Uncombine process preservation, live/cold reattachment and cwd, status transitions, exact recap identity, and the reported performance interaction to required real observations.

Project instructions and contributing guide point to one canonical CI/CD/publication checklist. TASK-025 tracks this pipeline; TASK-024's real-workload freezing acceptance stays open. The source gate has seven mandatory checks with hashed evidence; releaseVerdict remains Hold and no native PASS is recorded. Ruleset/CI setup and cleanup are accepted only when their actual remote and lifecycle receipts exist.

## Ownership and retention

Audited origin/main, PRs and claims before editing. Task-local branch/worktree owns this change; unrelated legacy ZIP/checksum files and the retained Marketplace task are untouched. No other chat is messaged or operated. Required logs, candidate provenance and lifecycle evidence are preserved outside the temporary checkout under common Git norml/worktrees/ptt-quality-pipeline-artifacts. The normal worktree removal/checker must follow integration. No CI runner or service consumes this checkout.
