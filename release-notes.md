# Persistent Terminal Tabs 1.5.0

You can now reverse **Combine Group into Split View** with **Uncombine Group into Separate Tabs**.

- Use the new button beside Combine, the group's right-click menu, or the Command Palette.
- Separate open terminals without closing or recreating their running shells. Closed chats stay closed, and the group's saved membership and order stay intact.
- Keep new and reopened chats in separate tabs until you select Combine again. Existing saved groups keep their previous split behavior.
- Keep the terminal work-state fixes and status integrations from 1.4.1.

Grok work detection remains unknown because cancellation signals failed verification. Other clients need a reliable integration; terminal output or CPU activity alone does not establish work. See [agent status setup](https://github.com/maxtymosh/persistent-terminal-tabs/blob/v1.5.0/docs/agent-status.md).

Download `persistent-terminal-tabs-1.5.0.vsix` and run **Extensions: Install from VSIX** in VS Code. Save your work and reload the window to activate it. Installing the file alone may leave the previous version running.

Alternatively, download `ptt-install-bundle-1.5.0.zip`, extract it, and give `install-prompt.md` to an AI coding assistant on your computer. The bundle includes the extension, README, status integration guide and checksums. No source build is required. Marketplace publication remains pending Microsoft publisher authentication.

Validation: 50 automated tests pass, including registered-command checks for lossless separation, pane order, saved layout, new/reopened chats and recombination. The 1.5.0 package was installed on macOS and its runtime files match the tested build. Live 1.5.0 UI acceptance and native Windows/Linux runtime checks remain unverified.
