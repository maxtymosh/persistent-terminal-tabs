# Public release

Owner: Max Tymoshyn. Explicit user choice: transfer the existing repository to maxtymosh, without creating another public repository.

## 1.5.2 — published November 6, 2026

- Max's screenshot revealed an empty Uncombine button. The manifest used `ungroup`, which does not exist in VS Code's icon registry. Replaced it with `multiple-windows` (glyph U+EB23), verified in the installed workbench and rendered/visually inspected using its actual codicon.ttf font.
- All 55 tests pass. Packaged and installed 1.5.2; verified both manifests contain the replacement and all 18 packaged/installed runtime modules match compiled output. No terminal state, layout or activation changed. Marketplace retains the publisher authentication blocker.
- Latest public release: https://github.com/maxtymosh/persistent-terminal-tabs/releases/tag/v1.5.2, targeting 8fb41eb5aa4c64c82fe9bfe80e65cdb66f74cd07 on origin/main. All four anonymous downloads matched local assets; verified replacement icon in the public manifest, nested VSIX and every bundled checksum. All uploaded digests matched GitHub's API.

## 1.5.1 — published November 6, 2026

- Max requested that new installs start with Sessions beside the native terminal view inside the Terminal panel, as in his screenshot. Added once-per-profile native docking, legacy-state preservation, an explicit docking command and a location-independent view-focus shortcut.
- Compile and all 55 tests pass. Native Dock Beside Terminal completed in an isolated VS Code Extension Development Host; renderer log confirms PTT_NATIVE_DOCK_SUCCEEDED. The native smoke uses VS Code's in-memory test storage; first-run/repeat/legacy policy is covered by unit tests.
- Packaged and installed maxtymosh.persistent-terminal-tabs 1.5.1. All 18 packaged/installed JavaScript modules match tested output. No reload or live user-layout migration was forced. The empty native-QA workspace slice and its exact index entry were removed after testing; all user chat state was retained.
- Published as the latest public release: https://github.com/maxtymosh/persistent-terminal-tabs/releases/tag/v1.5.1. Tag targets 2b832e7fb706ac0b09eeb821940d7a0eccc773aa on origin/main. All four assets downloaded anonymously and matched byte-for-byte; verified the nested VSIX and every bundled checksum. Uploaded digests also matched GitHub's API.
- VSIX SHA-256: 90e1af277f229d72203927d5c05a1b4f36555eb52fc9e8d00019a505690640bd. ZIP SHA-256: 41e1d3373f080529efd94326c4265fd7e0b43e1bba45af4f7daa781082c957e9.
- Marketplace submission retains the existing Microsoft publisher authentication blocker. No new sign-in or browser operation was attempted.

## 1.5.0 — published November 6, 2026

- Max requested the public update after the Uncombine feature, then explicitly requested Marketplace distribution. Runtime is integrated in cc46054; 50 tests passed in that feature run. Updated README download filenames, installation prompt and release notes to 1.5.0.
- Rebuilt the VSIX; all 17 packaged JavaScript modules match compiled output and the installed 1.5.0 runtime. Prepared the VSIX, installation ZIP, install prompt and SHA-256 manifest in a session scratch directory, preserving unrelated pre-existing 1.3.1 ZIP/checksum files.
- Rechecked Marketplace access: `vsce ls-publishers` returns no publishers; no VSCE_PAT/AZURE_ACCESS_TOKEN, local vsce store, Azure profile, matching canonical service credential reference or GitHub repository secret is configured. The public gallery API returned zero results for `maxtymosh.persistent-terminal-tabs`. The configured publisher ID does not establish that Max owns a registered Marketplace publisher.
- Microsoft's current [publishing documentation](https://code.visualstudio.com/api/working-with-extensions/publishing-extension) supports a manual VSIX upload or authenticated CLI publishing. GitHub Actions Trusted Publishing can remove long-lived tokens, but its trust policy first requires publisher management access. Provider sign-in/ownership is the unresolved prerequisite. No browser control or account setup was attempted; non-stop mode remains active.
- Published as the latest public release: https://github.com/maxtymosh/persistent-terminal-tabs/releases/tag/v1.5.0. Release tag targets b2490744f4d0638f0f4f774e62c47c831947c459 on origin/main.
- All four assets downloaded anonymously and matched byte-for-byte with local release files. Verified the nested VSIX, installation prompt, status guide and every bundled checksum. Uploaded asset SHA-256 digests also matched GitHub's API.
- VSIX SHA-256: 97c9d38e0f35d9449ff07795c136fc3307178077ad4eb6db81f364a84d66e5e7. ZIP SHA-256: aabdb44a9f428f6aea19b97edcb4c95e34e5be40aca983fda6651d7809510252.
- Marketplace submission remains blocked by Microsoft publisher sign-in/access. The current package is ready; no Marketplace listing or submission is claimed. Shared release ownership remains parked for that continuation.

## 1.4.1 — published November 4, 2026

- Runtime fixes are integrated in db37433; activation verified in c673e45 with 19 live/open sessions retained. The public downloadable release was still 1.3.1 when Max requested this update.
- Updated README download filenames and the AI installation prompt to 1.4.1. Corrected its nonexistent setup.md reference to readme.md. Bundle now includes docs/agent-status.md and changelog.md.
- Fresh Node 22 run: 48 tests pass. Packaged VSIX manifest verified as maxtymosh.persistent-terminal-tabs 1.4.1; every packaged JavaScript module matches compiled output.
- Publisher authentication rechecked: vsce ls-publishers is empty; no VSCE_PAT/AZURE_ACCESS_TOKEN is available, no ~/.vsce store exists, and the canonical service registry has no matching Marketplace/Microsoft/Azure publisher reference. Marketplace submission remains blocked; no browser takeover or credentials requested in chat.
- Published as the latest public release: https://github.com/maxtymosh/persistent-terminal-tabs/releases/tag/v1.4.1. Tag resolves to 4b8b038aab8913d6f2d6c9ba18adf45c2a6b1ec7 on origin/main.
- All four assets (VSIX, installation ZIP, install prompt, checksum manifest) downloaded anonymously and compared byte-for-byte with local release files. Nested VSIX and bundled guide/instructions verified.
- VSIX SHA-256: ab6ed3f2c2847913cee2a0c553133104165ac904319db001f4e6d567c92d2add. ZIP SHA-256: 9ce6fdb9f02ec324f1e5838ced49a490afb8da0b942b1717cd2c4ac2a403c4f9.
- Earlier unrelated untracked 1.3.1 ZIP/checksum files were preserved. No running terminals or user configuration changed for this public release.

## 1.3.1 — published October 13, 2026

- Existing public MIT repository transferred from normlstudio/persistent-terminal-tabs to https://github.com/maxtymosh/persistent-terminal-tabs. Local origin updated. Historical commits and releases retained.
- Version 1.3.1: https://github.com/maxtymosh/persistent-terminal-tabs/releases/tag/v1.3.1.
- Plain-language readme.md, public install-prompt.md, release-notes.md and updated metadata integrated in 48303ed.
- Release assets: VSIX, install-bundle ZIP, SHA-256 checksums and AI install prompt. Anonymous public ZIP download compared byte-for-byte with local bundle.
- Runtime modules compared against 1.3.0: identical. All 27 tests pass with Node 22.22.2. VSIX installed and version checked in an isolated desktop VS Code profile. Native Windows/Linux runtime behavior was not independently tested in this run.
- Copy mechanical checks pass for README and release notes; manual source comparison preserves the user's terminal organization/persistence explanation and adds factual boundaries for tmux, reboot, plain terminals, idle suspension and optional recap usage. No protected verbatim CTA was supplied.

## Marketplace — pending authentication

Publisher ID remains maxtymosh. Local vsce publisher inventory is empty; canonical credentials registry contains no Marketplace/Microsoft publisher reference, and Azure CLI is unavailable. vsce verify-pat maxtymosh with no token supplied was rejected by Microsoft (TF400813, unauthenticated identity). vsce show also received an HTML response instead of its expected JSON; this does not establish the public listing's existence or absence.

The installable package passes vsce packaging. Marketplace submission is NOT complete. Microsoft's publisher sign-in page was opened. User was asked for explicit permission to complete publisher setup/upload through the website, because the user's browser-control rule bars silently replacing an unauthenticated CLI with browser operation. No browser session was read or controlled.

Next step: complete Microsoft publisher sign-in through an approved supported route; inspect publisher identity and permissions, register maxtymosh if available and appropriate, and upload the prepared 1.5.0 VSIX. Browser operation requires explicit approval under Max's standing rule; sign-in alone is allowed, but no login flow is opened during active non-stop mode. Do not claim published until Microsoft accepts it and the public listing/version is verified. Update README's Marketplace status only after listing verification. Store any resulting credential solely in the canonical OS-native secure store with a reference in the credentials registry.

The earlier normlstudio/ptt-private-share handoff repository remains private; it is not the canonical public source.

Official publishing instructions: https://code.visualstudio.com/api/working-with-extensions/publishing-extension
