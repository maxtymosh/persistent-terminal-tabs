# Persistent Terminal Tabs

Keep your Claude and Codex terminal chats organized, then reopen VS Code and pick up where you left off.

When you run several AI chats in terminals, you end up with a row of tabs that all look alike. You arrange them by project, close VS Code, and have to work out which chat belongs where when you come back.

Persistent Terminal Tabs (PTT) gives those chats a saved home inside VS Code. Name them, group them by project, and keep their order. On macOS and Linux, tmux keeps the sessions running when you close a terminal, reload the window, or quit VS Code. Open VS Code again and PTT reconnects to those sessions in their saved groups.

Free and open source, under the MIT license. Works with Claude Code, OpenAI Codex, Grok, and Antigravity terminal sessions.

## What it does

- **Keeps your arrangement.** Groups, chat names, order, and project folders are saved per workspace.
- **Keeps chats available across reloads.** With tmux, reopening a chat reconnects to its running terminal session.
- **Starts chats in the right folder.** Choose a project folder once for a group; new chats inherit it.
- **Lets you close a tab without removing it.** Click it in the sidebar when you want to return. Use Drop when you want to remove it.
- **Helps you find an old conversation.** Generate an optional AI title and recap, then search recaps across current and dropped chats.
- **Lets you free memory deliberately.** Suspend ends a chat's running process while keeping its saved tab for later resume.

## Install

1. [Download the latest release](https://github.com/maxtymosh/persistent-terminal-tabs/releases/latest).
2. Download its `persistent-terminal-tabs-1.3.1.vsix` asset.
3. In VS Code, open the Command Palette → **Extensions: Install from VSIX** and select that file.
4. Run **Developer: Reload Window** after saving your work.

Or use the VS Code CLI:

```sh
code --install-extension persistent-terminal-tabs-1.3.1.vsix
```

The release also includes a ZIP with the extension and an [AI installation prompt](install-prompt.md) that you can give to a coding assistant with access to your computer. No source build is required.

Marketplace publication is pending. For now, install the VSIX from GitHub. VSIX updates are installed manually.

### Requirements

- Desktop VS Code 1.85 or newer.
- The agent CLI you use, installed and signed in on your computer: `claude`, `codex`, `grok`, or `agy`.
- **macOS/Linux:** tmux for keeping live sessions running outside VS Code. On macOS with Homebrew, install it with `brew install tmux`.
- **Windows:** saved groups and tabs with plain terminals; live tmux reattachment is unavailable in native Windows. WSL and remote extension hosts are not verified here.

PTT works with terminal-based agents. ChatGPT conversations in a browser and chats in VS Code's built-in chat panel are outside its scope.

## Start using it

1. Open **Persistent Terminal Tabs** in the Activity Bar, or press **Cmd+Alt+T** on macOS / **Ctrl+Alt+T** on Windows/Linux.
2. Click **Add Group**, then choose your project folder.
3. Click the group's **+** to create a chat. A new tmux chat opens a shell; type `claude`, `codex`, `grok`, or `agy` to start your agent.
4. Rename chats and drag them into the order or group you want. Click a group to open its chats as split terminals.
5. Close and reopen VS Code. Your saved chats are still in the sidebar. Click one to return to it.

Up to eight saved chats reopen automatically by default. With more chats, PTT shows the saved list and opens them when clicked, avoiding a large memory spike.

## What survives closing VS Code?

| What happens | What PTT restores |
| --- | --- |
| Close a terminal, reload, or quit VS Code with tmux enabled | Saved groups and tabs, with reattachment to sessions that are still running |
| Restart the computer, or a session's process stops | Saved groups and tabs; a recognized agent conversation resumes through its CLI when its saved history is available |
| Use plain terminals without tmux | Saved groups and tabs; the live process does not survive closing VS Code |

A reboot ends running processes. Resuming a conversation depends on the agent's saved history and resume support; arbitrary shell programs cannot be restored from a chat transcript.

By default, a closed tmux chat stays running. PTT may suspend a closed, idle, resumable session after 12 hours to free memory. Set `terminalTabs.autoSuspendHours` to `0` to disable that behavior. Work producing terminal output refreshes its activity. Manual Suspend also ends the process; Drop removes the saved tab and ends its tmux session.

## Useful settings

| Setting | Purpose |
| --- | --- |
| `terminalTabs.useTmux` | Enable live session persistence where tmux is available |
| `terminalTabs.defaultAgent` | Choose the agent for New Chat |
| `terminalTabs.openOnStartup` / `autoOpenLimit` | Control automatic reopening |
| `terminalTabs.closeToDrop` | Default `false`: closing keeps a tab; Drop removes it |
| `terminalTabs.suspendOnClose` | Default `false`: closing detaches instead of ending the tmux session |
| `terminalTabs.autoSuspendHours` | Idle suspension threshold; `0` disables it |
| `terminalTabs.projectSearchRoots` | Additional folders for the project picker |
| `terminalTabs.autoRecapOnOpen` | Refresh AI recaps when conversations grow |

Dots show each chat's state: green means attached, yellow means running in the background, and grey means stopped or suspended. Blue means a foreground Codex process reports an active turn; other agents retain their attachment colors.

Layout and project history are stored locally under `~/.terminal-tabs/`. AI recaps use your existing agent CLI login and may consume usage or credits on your account. Set `terminalTabs.autoRecapOnOpen` to `false` to disable automatic recaps. The sparkle action generates a recap on request.

## Develop and contribute

Use Node.js 20 or newer:

```sh
npm ci
npm test
npm run package
```

Press F5 in VS Code to open an Extension Development Host. [Report a bug](https://github.com/maxtymosh/persistent-terminal-tabs/issues) with your OS, VS Code version, agent, and steps to reproduce. Pull requests are welcome.

## License

MIT © Max Tymoshyn. See [LICENSE](LICENSE).
