# Contributing to Persistent Terminal Tabs

The canonical development and publication process is [.claude/ci-cd.md](.claude/ci-cd.md). Use an isolated task branch/worktree and open a PR to main. Keep tests and evidence tied to the exact source; a local build is not a release.

```sh
npm ci --ignore-scripts
npm run check
npm run quality:check
npm run package:verify
```

Use the Node version in `.node-version`. `npm run verify` runs the complete sequence. The quality check deliberately refuses missing or stale review evidence; it does not manufacture acceptance for contributors. See [engineering records](docs/development/engineering-records.md).

Regression tests live in `test/` and use Node's test runner. Use small mocks for 50/100-chat capacity; never launch that many real agents or terminals on someone's computer. Cover the observable bug, failure/shutdown cases and session preservation. Avoid assertions that merely repeat the implementation.

ESLint checks source, tests and release tooling with zero warnings; TypeScript checks strict types. Package verification opens the actual VSIX and rejects stale runtime files or leaked development/private content. CI uses disposable public GitHub-hosted runners, never private MoonPress runners.

Before merge, perform and record source review, meaningful tests, affected behavior, dependency audit, architecture/task reconciliation, ownership and scoped acceptance. The owning AI can review and merge after passing gates; a human click is not a normal step. Use `node scripts/quality-gate.cjs merge PR_NUMBER`.

Native QA is a separate [checklist](docs/development/native-qa.md). Unit/fixture results do not establish real VS Code UI behavior or an installed release. Public artifacts require `npm run release:check` and the publication steps in the canonical contract. This pipeline change does not publish a new extension version.
