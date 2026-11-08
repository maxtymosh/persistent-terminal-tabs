# PTT CI/CD — central contract

Read this first, then the requested stage. Adapted to dev-ci-cd 3.2.0 on November 8, 2026. This is a custom VS Code extension contract. The legacy `.claude/ci-cd.md` is a discovery redirect only.

## Verified project facts

| Fact | Actual configuration and evidence |
| --- | --- |
| Source/branches | Public personal `maxtymosh/persistent-terminal-tabs`; default/integration branch `main`. No separate develop or production branch. The repository transfer is intentional. |
| Flow | Task-local source → protected PR/merge → separately qualified immutable VSIX → authorized GitHub release/desktop install. Marketplace requires publisher access. |
| Runtime/tooling | Node 22.22.2 from `.node-version`; `npm ci --ignore-scripts`. CI uses disposable public Ubuntu runners, never MoonPress private runners. |
| Triggers | `.github/workflows/ci.yml` validates PRs to main, main pushes and manual dispatches. It packages candidates only. No branch/tag/merge automatically publishes, installs or deploys; there is no release workflow. |
| Main protection | Ruleset 26789904 requires a PR and current `Quality` from GitHub Actions; no routine bypass actors and zero mandatory human approvals. Read actual rules before merge. |
| Environments/channels | Installed desktop VS Code is the actual runtime. No configured hosted staging, staging branch, cloud/database, production server, Beta/Stable ring or signing/notarization route. CI artifacts/disposable profiles are qualification surfaces, not staging. |
| Distribution | Immutable GitHub Releases assets and supported VSIX installation. Last observed release: 1.5.5; query actual release/install state at delivery. Microsoft Marketplace authentication is an unresolved separate target until verified otherwise. |
| Data | User workspace metadata, transcripts, provider identities, cwd and live tmux/agents remain user-owned. No CI/fixture writes to real user state. No credentials or personal paths enter source/evidence. |
| Fact sources | Actual origin/main, package/lockfile, `.node-version`, CI workflow, gate/package scripts, ruleset API and recorded public/installed release evidence. Recheck before affected operations. |

## Stage routing and graph

- [PR](pr.md): scope, planning/design, implementation, tests, review and readiness for main.
- [Merge](merge.md): qualified integration to main, durable release handoff and feature-checkout disposition.
- [Local to staging](local-stage.md): explicitly N/A; no staging environment.
- [Local to production](local-prod.md): authorized immutable VSIX publication/installation; no cloud deploy.
- [Stage to production](stage-prod.md): explicitly N/A; no staging branch/environment to promote.
- [Release](release.md): freeze included changes, combined regression/native/package acceptance, selected delivery and reconciliation.

Supported graph: PR → merge → durable handoff; a separately authorized release consumes one or more handoffs and calls local-prod only for missing delivery transitions. No original chat must stay open as a release queue. PR-only and merge-only requests stop at their boundary; a status question starts no action. Chain authorized stages without repeat approval while honoring explicit holds/narrower targets. Mark unsupported transitions explicitly rather than inventing infrastructure.

During stage execution, report that stage's whole numbered checklist with ✅/🔄/⏳/⛔, preserving numbers. Show completed investigation/planning history separately; do not attach unrequested release work to a feature chat. Full-project status still includes all requested workstreams under their actual owners. Source integration and native/product acceptance are different facts.

## Authority and shared safeguards

| Operation | Scope |
| --- | --- |
| Inspect, plan, check and edit | Requested task and owned worktree only; preserve unrelated WIP. |
| Commit, push and PR | Exact task paths through Norml Git. PR readiness alone grants no later-stage authority. |
| Guarded merge | Existing owning-session automatic merge policy for completed in-scope implementations after gates; no human click required. Explicit PR-only scope stops before merge. |
| Native QA | Affected authorized surface using disposable profile/home/socket; no borrowed credentials or real provider use without authorization. |
| Publication/installation | Actual selected target and valid release/install authority plus native/release admission and exact bytes. This documentation migration grants none. |
| Destructive data/unrelated services | Never implied by checks, merge, publication or rollback. Preserve live agents, other windows and authentication. |

- Norml Git owns task claims, isolated checkouts and closeout; preserve evidence outside temporary trees. Never operate/message independent chats.
- `npm run check` runs strict types, zero-warning ESLint, compile/unit regressions and `npm audit --audit-level=high`. Disposition moderate findings; do not force incompatible dependencies or waive checks. Development dependencies are excluded from runtime.
- `npm run verify` adds exact-source admission and actual VSIX verification. Seven mandatory checks are review, tests, behavior, dependencyAudit, maps, ownership and acceptance, with hashed evidence. Source/mode/symlink/deletion changes invalidate admission. No fabricated PASS, blanket N/A or continue-on-error.
- Use `node scripts/quality-gate.cjs merge PR_NUMBER`; CI alone is insufficient. Identify owning-session self-review truthfully. Rules/scripts are safeguards, not proof an administrator cannot alter policy. Never bypass hooks or use pull_request_target for untrusted source execution.
- Package verification checks manifest/version, complete module set/bytes and a public-file allowlist. Keep artifacts/provenance in ignored `qa-artifacts/` or the durable task home. Do not overwrite immutable public versions with private candidates.
- Native/release admission requires actual VS Code proof, nativeQA pass, hashed native/release evidence and a separate Ship verdict. See [engineering records](../../docs/development/engineering-records.md) and [native QA](../../docs/development/native-qa.md). Screenshots/fixtures alone cannot prove provider/process/workload acceptance.
- 50/100-chat tests use in-memory/process mocks. Never spawn dozens of real chats on the laptop. Cover stale/shutdown races, transport failure, close/reload preservation, identity/cwd and layouts. Capture the reported slow interaction before broad performance claims.

## Recovery and durable outcomes

Keep the previous immutable VSIX/checksum; back up actual `.terminal-tabs` metadata outside source before any intentional migration. Restore only through supported VSIX installation and verify loaded version. No cloud/database backup is invented. No kill-server, interactive-agent termination, global configuration reset or credential reset is a rollback step. Source rollback stays on GitHub and passes gates.

Tasks live in `../tasks/`; review/admission in `../../docs/development/`; publication history in [public-release.md](../docs/public-release.md). Handoffs include exact PR/commit, checks/skips, risk, compatibility/migrations and remaining journeys. Durable task receipts preserve integration/removal separately. Built, merged, published, installed, loaded and accepted remain separate results.
