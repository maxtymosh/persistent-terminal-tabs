# Persistent Terminal Tabs 1.5.1

New users now start with **Persistent Terminal Tabs: Sessions** beside their terminals inside VS Code's **Terminal** panel.

- Apply the initial location once. Existing users keep their saved layout, and later manual moves stay where the user puts them.
- Use **Persistent Terminal Tabs: Dock Beside Terminal** in the Command Palette to place Sessions there on request.
- **Cmd+Alt+T** on macOS / **Ctrl+Alt+T** on Windows/Linux focuses Sessions wherever it is docked.
- Includes the Combine / Uncombine group actions introduced in 1.5.0.

Download `persistent-terminal-tabs-1.5.1.vsix` and use **Extensions: Install from VSIX**. Save your work and reload the window to activate the update. The installation bundle `ptt-install-bundle-1.5.1.zip` includes the extension, AI installation prompt, README, status integration guide and checksums. No source build is required.

Validation: 55 automated tests pass, including new-install docking policy, legacy placement preservation and later activations. The native move-view command also completed in an isolated macOS VS Code Extension Development Host. Native Windows/Linux runtime behavior was not independently retested. Marketplace submission still requires Microsoft publisher authentication.
