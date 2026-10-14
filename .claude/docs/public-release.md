# Public release — 2026-10-13

Owner: Max Tymoshyn. Explicit user choice: transfer the existing repository to maxtymosh, without creating another public repository.

## Published

- Existing public MIT repository transferred from normlstudio/persistent-terminal-tabs to https://github.com/maxtymosh/persistent-terminal-tabs. Local origin updated. Historical commits and releases retained.
- Version 1.3.1: https://github.com/maxtymosh/persistent-terminal-tabs/releases/tag/v1.3.1.
- Plain-language readme.md, public install-prompt.md, release-notes.md and updated metadata integrated in 48303ed.
- Release assets: VSIX, install-bundle ZIP, SHA-256 checksums and AI install prompt. Anonymous public ZIP download compared byte-for-byte with local bundle.
- Runtime modules compared against 1.3.0: identical. All 27 tests pass with Node 22.22.2. VSIX installed and version checked in an isolated desktop VS Code profile. Native Windows/Linux runtime behavior was not independently tested in this run.
- Copy mechanical checks pass for README and release notes; manual source comparison preserves the user's terminal organization/persistence explanation and adds factual boundaries for tmux, reboot, plain terminals, idle suspension and optional recap usage. No protected verbatim CTA was supplied.

## Marketplace — pending authentication

Publisher ID remains maxtymosh. Local vsce publisher inventory is empty; canonical credentials registry contains no Marketplace/Microsoft publisher reference, and Azure CLI is unavailable. vsce verify-pat maxtymosh with no token supplied was rejected by Microsoft (TF400813, unauthenticated identity). vsce show also received an HTML response instead of its expected JSON; this does not establish the public listing's existence or absence.

The installable package passes vsce packaging. Marketplace submission is NOT complete. Microsoft's publisher sign-in page was opened. User was asked for explicit permission to complete publisher setup/upload through the website, because the user's browser-control rule bars silently replacing an unauthenticated CLI with browser operation. No browser session was read or controlled.

Next step: receive browser permission and Microsoft sign-in; inspect the publisher identity and permissions, register/verify maxtymosh if available and appropriate, and upload the prepared 1.3.1 VSIX. Do not claim published until Microsoft accepts it and the public listing/version is verified. Update README's Marketplace status and repackage/publish a later patch only after listing verification. Store any resulting credential solely in the canonical OS-native secure store with a reference in the credentials registry.

The earlier normlstudio/ptt-private-share handoff repository remains private; it is not the canonical public source.

Official publishing instructions: https://code.visualstudio.com/api/working-with-extensions/publishing-extension
