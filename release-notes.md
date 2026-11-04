# Persistent Terminal Tabs 1.4.1

This update fixes terminal work indicators and replaces unknown-state question marks with filled grey circles.

- Recognize working Codex sessions launched through a shell wrapper, and return to idle when work finishes.
- Read Claude’s native work state so active sessions no longer appear idle because their terminal title is static.
- Recognize Codex approval waits, microphone-prefixed busy titles, and ordinary idle thread/project titles.
- Use one working/waiting/idle/unknown status engine. Gemini can register through the optional setup; other terminal clients, including clients using local models, can report lifecycle events through the shared bridge.
- Preserve attachment colors: green for attached, yellow for detached. Blue means verified work, a bell means input is needed, filled grey means unknown, and hollow grey means stopped.

Grok work detection remains unknown because cancellation signals failed verification. Other clients need a reliable integration; terminal output or CPU activity alone does not establish work. See [agent status setup](https://github.com/maxtymosh/persistent-terminal-tabs/blob/v1.4.1/docs/agent-status.md).

Download `persistent-terminal-tabs-1.4.1.vsix` and run **Extensions: Install from VSIX** in VS Code. Save your work and reload the window to activate it. Installing the file alone may leave the previous version running.

Alternatively, download `ptt-install-bundle-1.4.1.zip`, extract it, and give `install-prompt.md` to an AI coding assistant on your computer. The bundle includes the extension, README, status integration guide and checksums. No source build is required. Marketplace publication remains pending authentication.

Validation: 48 automated tests pass. Version 1.4.1 was also activated on macOS with all 19 live/open terminal sessions retained. Native Windows and Linux runtime behavior were not independently retested for this release.
