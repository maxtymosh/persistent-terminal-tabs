# PTT CI/CD and QA contract

Pattern: custom public VS Code extension. Source: `maxtymosh/persistent-terminal-tabs`; integration branch: main. Node 22.22.2 from `.node-version`. Distribution: immutable GitHub VSIX/download bundle, then Marketplace when publisher access exists. No cloud, database, desktop signing or deployment rings apply.

## Development gates

1. Audit main, related PRs and task ownership; use a task-owned isolated worktree. Define accepted behavior and regression coverage before editing.
2. Use `npm ci --ignore-scripts`. Run `npm run check`: strict TypeScript, ESLint with zero warnings, compile and all unit/fixture regressions, then a high/critical dependency-advisory gate. Dependencies and lockfile ship together.
3. Update the relevant architecture/behavior map, task and test cases. Review source for logic, races, performance, session preservation and secrets using dev-code-review/Ponytail principles. Record actual review findings and verdict; the owning AI may review. Do not invent a human approval requirement or claim a second reviewer when there was none.
4. Write scoped evidence and a `docs/development/gates/*.json` record. `node scripts/quality-gate.cjs snapshot` fingerprints all tracked and non-ignored untracked source, file modes, symlink targets and deletions, excluding regular gate JSON only. Seven checks require hashed repository evidence: review, tests, behavior, dependencyAudit, maps, ownership, acceptance. Any source/evidence change invalidates admission. There is no automatic PASS generator.
5. Open a PR to main. GitHub CI's required `Quality` check runs the same checks, exact-source admission and actual VSIX verification. CI builds once and preserves the candidate plus commit/hash provenance for seven days. It never installs, publishes, reads provider credentials or starts model processes. PR CI is unprivileged; never use pull_request_target for source execution.
6. Merge only through `node scripts/quality-gate.cjs merge PR_NUMBER`, which checks clean source, current-main ancestry, exact PR HEAD, target branch and successful CI. The main ruleset requires a PR and up-to-date Quality check, with no human-review count. Configure no administrator bypass for routine work. The ruleset enforces PR/CI; content review evidence is additionally enforced by the workflow and guarded command.

Branch protection and scripts are safeguards, not a claim that a repository administrator cannot change policy. CI failures are failures; do not add continue-on-error, fabricated receipts or broad ignore rules to get green.

## Canonical publication checklist

Before a release, report these eight steps in chat and retain their numbering in progress updates. Use completed/current/pending/blocked accurately. A skipped prerequisite is not PASS.

1. **Take ownership and reserve the version.** Audit main, claims, open PRs and current release. Reserve one new version; never overwrite an existing public version's bytes.
2. **Update from main and review source.** Reconcile current main in the owned checkout. Refresh exact-source evidence after any source, documentation or dependency edit.
3. **Run local checks.** Run `npm run verify`, affected behavior regressions and dependency audit. Keep logs tied to the reviewed source. The VSIX verifier compares its full runtime module set and bytes to compiled output, checks identity/version, and rejects private/development files.
4. **Finish CI and qualify the candidate.** Require green Quality on the exact pushed candidate. Preserve VSIX SHA-256, source revision, compiler inputs and test results. A CI artifact is a candidate, not a published release or proof of native behavior.
5. **Merge through guarded admission.** Use the gate command; verify integrated main and its checks. Any conflict resolution invalidates previous source evidence. Requalify changed inputs instead of reusing a stale result.
6. **Verify native VS Code behavior.** Use the affected rows in `docs/development/native-qa.md`. Record installed package hash, loaded version, exact VS Code/OS, tester, before/after session identities, actions, expected/actual results and durable evidence. Set `nativeQA.status=pass`, a hashed nativeQA evidence pointer, `releaseVerdict=Ship` and hashed releaseEvidence only after actual success. `npm run release:check` fails closed otherwise. CI fixture results cannot satisfy native QA.
7. **Publish and verify the same artifact.** Publish only after engineering and native admission. Keep package/bundle checksums, verify anonymous public downloads and nested bytes, and verify installed runtime and loaded version separately. Preserve the previous known installer and saved metadata outside temporary worktrees. Do not invent Marketplace success without authenticated submission and public readback.
8. **Record and close out.** Update the canonical task, changelog, release record and actual remaining criteria. Retire task-owned checkouts through Norml Git after preserving unique evidence. Distinguish source integration, package qualification, publication, installation and user-visible acceptance.

## Scope and incident rules

Normal 50/100-chat scale checks are in-memory fixtures with bounded subprocess mocks. Native lifecycle tests use an isolated profile/home/socket and no AI provider. Never simulate the expected workload by spawning dozens of real chats on a busy laptop. Use operation counts and event-loop delay assertions; capture the actual reported slow interaction before making a broad performance claim.

Tests must include shutdown/stale-result races, transport failure, session-preserving close/reload, saved identity and cwd recovery, and affected layout paths. One inspected status snapshot or warm focus result does not prove typing/rendering performance for all workloads.

All development dependencies are excluded from the installed extension. `npm audit --audit-level=high` blocks high/critical tooling advisories; moderate findings still need a recorded disposition and recheck. Do not use a force upgrade or incompatible transitive override merely to suppress a report. No credentials, transcripts, user settings or personal paths enter CI evidence.

## Rollback

Keep the previous immutable VSIX and checksum. Reinstall through VS Code's supported extension workflow and verify the loaded version. Back up `.terminal-tabs` before any intentional data migration; never overwrite a user's session state with a CI fixture. Source rollback must remain on GitHub and pass the same gates. No tmux kill-server, interactive-agent kill, global configuration reset or credential reset is a rollback step.
