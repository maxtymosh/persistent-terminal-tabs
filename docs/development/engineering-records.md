# Exact-source engineering records

The quality gate adapts MoonPress's engineering admission to PTT. Keep one scoped record under `docs/development/gates/`; existing records remain historical when source changes. Regular JSON records are excluded from the source fingerprint to avoid self-reference. Executable or symlinked records are refused. Evidence itself is inside the fingerprint and must be a regular repository file outside the gate directory, with its SHA-256 recorded.

Every record contains schema 1, task, scope, reviewer identity, verdict `Ship`, full `baseRevision` and current `sourceSha256`. The base must be an ancestor of HEAD. `checks` has seven required entries: review, tests, behavior, dependencyAudit, maps, ownership and acceptance. Each entry has status `pass` and evidence `{path, sha256}`. Missing, blocked, failed or tampered evidence refuses admission; there is no blanket not-applicable escape.

Write the actual review and observed results first, then obtain the fingerprint:

```sh
node scripts/quality-gate.cjs snapshot
node scripts/quality-gate.cjs check merge
```

Do not put the fingerprint in the evidence document itself, which would create a hash cycle. Put it in the JSON record after evidence is final. Generated installers, dependencies and transient logs belong in ignored `qa-artifacts/` or the durable task artifact home, not in source or a user profile. Keep a concise committed verification account with commands, results, failures and limits.

Release admission additionally requires `releaseVerdict: Ship`, nativeQA `{status: pass, evidence: {path, sha256}}`, and releaseEvidence `{path, sha256}`. Actual native checks must precede those values; `releaseVerdict: Hold` is correct for pipeline-only source work. Do not copy a historical native PASS into a new source record.

The automated gate checks integrity, coverage declarations and CI, not the truth of arbitrary prose. The reviewer remains responsible for checking evidence and scope. Review/QA must describe what was actually exercised; an automated declaration cannot turn mocks into native acceptance.
