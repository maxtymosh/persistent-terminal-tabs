---
id: "TASK-025"
title: "Apply MoonPress engineering and QA practices to PTT"
status: "in-progress"
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
- [ ] Actual exact-source GitHub CI green, guarded PR integration, main checks and required-PR/Quality ruleset verified.
- [ ] Shared claim and worktree closeout after source/evidence integration and preservation.

This changes the development pipeline, not the installed runtime or current immutable public 1.5.5 artifact. Existing TASK-024 normal-workload freezing acceptance and Microsoft Marketplace authentication remain separate open criteria. No real synthetic agents, tmux sessions or terminals are launched by the normal pipeline suite.

## Worktrees

Task-owned ptt-quality-pipeline-20261108; branch chore/development-quality-pipeline; base 806fa4b; task claim c4725a05b8ba4683825d7aabd7e6804a. Durable lifecycle and QA artifacts live under the canonical common Git norml/worktrees directory. Integration/removal are distinct verified lifecycle events; no private CI runner is attached to this public repository.
