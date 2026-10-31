# Persistent Terminal Tabs — architecture decisions

> Updated: Oct 31, 2026

## Group projects

- `[DECISION]` The existing panel remains the single arrangement source of truth. Clicking a group still opens its native split tab. Add Group and the dedicated Choose Project Folder action use a native VS Code QuickPick.
- `[DECISION]` `Group.cwd` is the explicit new-chat default and `Group.projectName` stores the chosen project's display name. Empty groups retain both. Explicitly assigned groups do not auto-rename from their chats. Legacy groups still infer a dominant cwd (newest wins ties); the unbound inbox defaults to home.
- Existing `SessionMeta.cwd` remains authoritative for conversation recovery. Changing a group's project or moving a chat does not rewrite existing session metadata or issue cd to a running process.
- New-chat commands validate an explicit group folder before adding state or creating a terminal. Missing folders require repair; no silent fallback to home. `TerminalOptions.cwd` and tmux's `new-session -c` receive the resolved session folder.
- Named recent projects are stored locally in `~/.terminal-tabs/projects.json`, separately from workspace slices. Default names use the final folder component; picker pencil edits aliases. Read-before-write plus atomic replace preserve sequential choices across windows. At most 100 recent folders are retained.
- Directory discovery uses asynchronous filesystem directory listings of local workspace roots and `terminalTabs.projectSearchRoots`. It reads no file contents, skips hidden/generated directories and symlink directories, and stops at eight levels and 8,000 directories per root. Each root has a separate budget so large runtime trees cannot starve document roots.
- Search ranks exact/prefix/substring/fuzzy project-name matches before path-only matches, with recent and short names prioritized within matching tiers. Only 200 suggestions render; Browse and typed absolute paths remain available. Discovery repaints are throttled and canceled when the picker closes.

## Planning

[Repository tasks](../tasks/tasks.md) retain their established legacy format. New concrete work uses individual task records alongside the existing index. No v3 migration or GitHub issue sync is configured for this repository; historical tasks remain intact.

## Working dots — 1.3.2

- `[DECISION]` Native Codex OSC busy title plus verified live process ownership determines blue. tmux's `pane_current_command` is diagnostic only for work detection: noninteractive zsh launch wrappers share a foreground process group with Codex, and tmux may select zsh. Do not regress to exact foreground-command equality, screen changes, activity timestamps, busy-text searches, or a linger timer.
- One shared `ps` snapshot provides pid/parent, process group, terminal foreground group, TTY, process state, RSS and executable (`comm`, never argv). Resolve descendants of the pane root on that same TTY and foreground group, rejecting stopped/zombie processes. Stop traversal at an owning agent so nested tools cannot supply another UI's identity. Reuse this snapshot for the existing RAM totals.
- Missing process evidence clears blue; it never enables a title-only or cached-blue fallback. Attachment still uses tmux's attachment count. Completion, approval and exit clear on the next configured poll (default eight seconds). No screen capture is needed, including narrow/detached panes.
- Current support remains Codex only. Claude/Grok/Antigravity retain green/yellow/grey attachment colors until an actual verified work-state integration exists. Their names or static title decorations are not busy signals.
- Diagnose Dots records raw command, verified agent and presence of the busy-title marker without recording conversation titles. Activation records the extension version so future investigations can distinguish loaded from merely compiled/installed code.
- Regression evidence: actual screenshot session had pane root zsh PID 4262 and live Codex child PID 4302, both foreground group 4262 on ttys010. Old detector returned false; repaired detector true. An isolated real tmux server reproduced the wrapper and passed idle → work → approval → completion → work → exit with a deliberately retained spinner. User sessions were not manipulated by that test.
