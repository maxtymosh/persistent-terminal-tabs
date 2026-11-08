---
id: "TASK-026"
title: "Adapt PTT to the updated CI/CD stage bundle"
status: "done"
priority: "P1"
owner: "Max Tymoshyn"
issue: null
---

## Source and scope

Max: “let's update from new ci-cd.md process”. Re-read dev-ci-cd 3.2.0 adaptation/QA/templates and current remote MoonPress Shuttle central/stage contracts. Existing PTT main fab1bb1 has a flat guarded pipeline from TASK-025. This adaptation changes instructions/discovery only; it grants no new release/install/data authority, changes no branch rules/scripts/runtime, and publishes no extension version.

## Accepted result

- Exactly seven canonical stage files under .claude/ci-cd; old flat file is a tiny redirect, not a second procedure.
- PR, merge, direct artifact delivery and combined release have separate entry, numbered steps, side effects, handoff and completion. Requests can stop at a stage; original feature chats/checkouts need not remain open.
- Actual PTT main, public CI, guarded source/native gates and immutable VSIX path are preserved. No invented develop, hosted staging, cloud/database, app rings or signing requirements.
- No-staging transitions retain explicit N/A procedures and route to the real release/local-prod flow.
- Release consumes every included merged PR/direct commit since the prior target, reviews interactions and owns combined/native/package acceptance. Existing product gaps/Marketplace auth remain separate.
- Active discovery links point to the central file. Historical TASK-025 receipts stay unchanged. Bundle/link/policy QA and exact-source gate/required CI qualify integration; no runtime/manual native PASS is claimed.

Completion is delivered only after guarded PR integration and final main CI; durable run/integration/removal receipts live at the task artifact home instead of causing a source/evidence loop after each run. Source migration can finish before a separately authorized release.

## Worktrees

Owned ptt-stage-bundle-20261108; branch docs/ci-cd-stage-bundle; base fab1bb1; claim 47c6cf267cff409194b2830ed9d3b507, Max Tymoshyn. Durable lifecycle/artifacts in canonical common Git norml/worktrees. Verify normal removal after integration and preserve its separate event. No other chat/worktree/service is operated.
