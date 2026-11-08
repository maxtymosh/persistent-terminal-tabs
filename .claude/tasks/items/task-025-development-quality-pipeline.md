---
id: "TASK-025"
title: "Apply MoonPress engineering and QA practices to PTT"
status: "done"
priority: "P1"
owner: "Max Tymoshyn"
issue: null
---

## Source and accepted scope

Max: “check the dev pipeline on moonpress, let's apply those practice here as well in PTT dev pipeline, so we're keeping code clean and tested and QA correctly”. Audited current MoonPress Chat develop CI, same-build E2E provenance and QA intake, plus current Shuttle main's mandatory engineering evidence, guarded AI merge and separate native/release admission. Adapted those principles to the public VS Code extension; private server/WordPress/cloud/signing infrastructure is not copied.

## Outcome and acceptance

- [x] Canonical `.claude/ci-cd.md`, complementary project instructions and contributor guide define ownership, review, local checks, CI, actual package provenance, native QA, guarded merge and release/cleanup.
- [x] Node pinned; strict typecheck, ESLint zero-warning gate, unit regressions and high/critical dependency audit share local/CI commands.
- [x] Exact-source review/admission rejects stale/missing/failed/tampered evidence. Release admission additionally requires actual native QA and a separate release verdict.
- [x] Actual VSIX verifier checks identity, full runtime-module set/bytes, and absence of private/development files. Its first real run caught worktree.md in the package; the exclusion is fixed. New tests demonstrate stale/private package rejection.
- [x] Six high-severity development dependency advisories fixed with compatible lockfile updates; thirteen moderate minimatch-related tooling advisories remain disclosed. Installed runtime has no shipped node_modules.
- [x] First exact-source GitHub CI passed (run 42458193435, source 98d2a8c). Main ruleset 26789904 is active: PR plus current Quality from GitHub Actions, zero required human approvals and no bypass actors. Final evidence commit must pass CI and merge through the guard before this completion is delivered.
- [x] Shared task claim, durable artifact home and mandatory worktree lifecycle/closeout records are established. Actual integration, final main CI and removal events are verified in the common Git lifecycle record after guarded delivery.

This changes the development pipeline, not the installed runtime or current immutable public 1.5.5 artifact. Existing TASK-024 normal-workload freezing acceptance and Microsoft Marketplace authentication remain separate open criteria. No real synthetic agents, tmux sessions or terminals are launched by the normal pipeline suite.

## Worktrees

Task-owned ptt-quality-pipeline-20261108; branch chore/development-quality-pipeline; base 806fa4b; task claim c4725a05b8ba4683825d7aabd7e6804a. Durable lifecycle and QA artifacts live under the canonical common Git norml/worktrees directory. Integration/removal are distinct verified lifecycle events; no private CI runner is attached to this public repository.

## Verified pipeline and delivery record

[PR #1](https://github.com/maxtymosh/persistent-terminal-tabs/pull/1) introduces the pipeline. [First real CI run](https://github.com/maxtymosh/persistent-terminal-tabs/actions/runs/42458193435) passed type/lint, all 71 regressions, high/critical advisory admission, source evidence and actual VSIX verification/upload. The final metadata revision requires its own green CI; the guarded merge refuses stale HEAD, stale main or missing checks. The source record intentionally holds native/public release admission. Final main/run and lifecycle receipts remain at the durable artifact home to avoid changing the reviewed source after every transient CI/log update.

The pipeline catches private worktree notes in candidate packages, rejects unexpected entries and verifies all 18 runtime modules. This improves future release qualification; it does not replace immutable public 1.5.5 or install a new runtime. Existing user sessions were not operated for this pipeline work.
