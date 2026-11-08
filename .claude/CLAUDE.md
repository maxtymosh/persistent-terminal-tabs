# Persistent Terminal Tabs — development

Canonical source is the public personal repository `maxtymosh/persistent-terminal-tabs`, by Max Tymoshyn. The earlier repository transfer is intentional; do not migrate it to another owner. Target branch: main.

Read [ci-cd/ci-cd.md](ci-cd/ci-cd.md), [the development guide](../contributing.md), [architecture](docs/architecture.md), and the relevant task before changes. Norml Git owns task claims and isolated checkout lifecycle. Preserve unrelated WIP and existing saved chats, transcripts, provider identities and tmux sessions.

Use Node from `.node-version`, `npm ci --ignore-scripts`, then `npm run verify`. Every PR needs exact-source review evidence and the required Quality CI check. Merge with `node scripts/quality-gate.cjs merge PR_NUMBER`; a green unit suite alone is insufficient. A review may be performed by the owning AI session; record its identity and actual findings. Never fabricate independent review or a native PASS.

Release admission is separate: `npm run release:check` also requires actual native VS Code QA and release evidence. Read the requested stage from the central contract; release.md owns the release checklist. PR/merge requests stop at their own completion boundary and hand off later acceptance. No production publish follows merely from a source/pipeline change. Keep immutable release bytes and verify installed/loaded version separately from downloading a VSIX.

Normal tests use in-memory fixtures for 50/100 chats. Do not launch 50 real agents, terminals or tmux sessions on a user's machine as a capacity test. Native QA uses disposable profiles, homes and a distinct tmux socket; real provider/auth flows require their existing authorization. Never run `scripts/check-live-status.py` against a real user home or treat mocks as native acceptance.

PTT has no cloud/database deployment. No website browser automation, production server, shared private CI runner, credentials, OS settings changes or unrelated app cleanup belongs in this pipeline. Use disposable public GitHub-hosted CI runners; do not attach MoonPress's private self-hosted runners to this public repository.
