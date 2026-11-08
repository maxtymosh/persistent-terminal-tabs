# Changelog

## 1.5.4 — November 7, 2026

- Make startup status/client adoption, diagnostics, session reports and automatic suspension scans asynchronous; reuse cached diagnostic snapshots.
- Load Codex history separately from panel startup; keep legacy open-file discovery on explicit recap paths.
- Allow asynchronous status probes up to eight seconds under scheduling pressure. Log probe failures and recoveries without conversation text.
- A failed tmux transport no longer marks every chat stopped. Work becomes unknown until a verified snapshot recovers; automatic cleanup skips failed reads.

## 1.5.3 — November 7, 2026

- Keep status polling and click refresh responsive with asynchronous, bounded tmux/process reads shared across concurrent requests.
- Reuse one session snapshot instead of taking four full-machine snapshots each tick; use cached Codex titles for background identity matching.
- Ignore stale results after explicit actions or shutdown. Preserve native work-state and attachment detection.
- Verify 50-open-chat and 100-chat stress fixtures without per-chat system scans.

## 1.5.2 — November 6, 2026

- Fix the blank Uncombine Group button by replacing the nonexistent `ungroup` icon with the built-in `multiple-windows` icon.

## 1.5.1 — November 6, 2026

- New installs dock Sessions beside the terminals inside the Terminal panel on first activation.
- Preserve existing users' layouts and later manual moves. Add Dock Beside Terminal to place the view there on request.
- Focus the actual Sessions view with Cmd+Alt+T / Ctrl+Alt+T, including when it has been moved out of its original container.

## 1.5.0 — November 6, 2026

- Added Uncombine Group into Separate Tabs beside Combine and in the group's context menu and Command Palette.
- Separate existing panes with VS Code's native Unsplit action, preserving running shells, panel order, session identities and closed chats.
- Remember each group's layout: new and reopened chats remain separate until Combine is selected again. Older saved groups retain split behavior.

## 1.4.1 — November 2, 2026

- Fixed Codex idle sessions staying unknown: recognize native thread/project and Ready titles after work finishes.
- Recognize both blinking approval-title phases and microphone-prefixed busy titles.
- Show unknown as a filled grey circle; stopped sessions retain the hollow circle. Keep attachment details in tooltips.
- Added repeated lifecycle and already-open-tab click-refresh regression coverage; 48 tests pass.

## 1.4.0

- Unify work detection behind one working/waiting/idle/unknown state engine, independent of the selected cloud or local model.
- Add Gemini native dynamic-title integration, and a reusable process-bound lifecycle reporter for other terminal apps.
- Keep Grok explicitly unknown: real cancellation tests reproduced stale hook/native-turn state, so the adapter is gated rather than enabling false blue.
- Show unknown work state with a question mark and input waits with a bell, preserving green/yellow attachment colors. Plain Codex titles now correctly mean unknown rather than confirmed idle.
- Add an explicit passive-hook installer with configuration preservation/backups and an integration guide. Existing agent sessions must load their hooks normally; no live chats are restarted.

## 1.3.3

- Add Claude working dots using its native busy/idle/waiting session registry, including delegated background work. A static Claude terminal title no longer hides active work.
- Verify the foreground process, PID, UTC process start time, interactive kind and tmux session before accepting native status. Missing records, exited/reused processes, waiting prompts and idle sessions cannot keep blue latched.
- Preserve Codex detection and attachment colors; no hooks, screen heuristics or timer-based guesses.

## 1.3.2

- Fix working Codex sessions staying green when tmux reports their launch shell as the foreground command. Verify the live agent using the pane's process ancestry, terminal and foreground process group.
- Clear blue on completion, approval, process exit or unavailable process evidence. Stale titles, background processes and nested tools cannot establish work; no screen-change guesses or blue hold timer.
- Keep attachment colors unchanged and include the loaded extension version in activation diagnostics.

## 1.3.1

- Explain saved terminal groups, live tmux reattachment, reboot recovery, native Windows limits and optional AI recap usage in plain language.
- Move the existing repository to maxtymosh and update extension metadata and download links.
- Exclude internal planning and release handoff files from the installed extension. Runtime behavior is unchanged from 1.3.0.

## 1.3.0

- Add Group now opens a searchable project-folder picker with named recent projects, full paths, workspace-folder discovery, folder browsing and editable saved names.
- Groups save an explicit default folder, including when empty. Every New Chat command inherits it; a group's folder action changes the default for future chats while preserving existing conversation folders.
- Plain terminals now receive the correct working directory. Missing group folders require a replacement rather than silently starting new chats at home.
- Folder discovery runs asynchronously with separate limits per workspace root, prioritizes name matches and supports additional roots through `terminalTabs.projectSearchRoots`.

## 1.2.3

- Stop false blue dots from idle Codex animations, typing, and old output containing busy phrases. Read Codex’s live busy-title indicator together with its foreground process; clear blue on the next poll without a hold. Unsupported agents retain attachment colors instead of guessed activity.
- Match Codex conversation names through busy and approval title decorations, including narrow panes, so those states do not prevent name/recap lookup.

## 1.2.2

- Read modern Codex paginated conversations through its local read-only app-server API, restoring name and recap generation when no JSONL transcript exists. Match full terminal titles (including narrow panes) only when unique; retain exact session links for resume.
- Refresh links when a live pane switches Codex conversations. Never substitute a different same-folder transcript for a missing known conversation.
- Refresh green attachment dots from tmux attachment counts, including multiple clients and attachments outside the current extension host. Keep blue status polling independent of asynchronous Codex metadata reads.
- Missing history errors no longer incorrectly tell the user to sign in.

## 1.2.1

- Fixed names and recaps silently failing with "CLI not found" when VS Code could not resolve the shell environment at startup ("Unable to resolve your shell environment in a reasonable time"). The extension host then runs on the bare launchd PATH, so bare `claude` / `codex` / `grok` were not found even though the chats themselves kept working. Recap CLIs are now looked up on PATH first, then in their usual install dirs (`~/.local/bin`, `~/.grok/bin`, `~/.bun/bin`, `/opt/homebrew/bin`, `/usr/local/bin`, …), the same way tmux is found. Absolute paths in the command settings pass through unchanged.

## 1.2.0

- New 🔵 **working** dot: a chat shows blue while its agent is actively producing output — streaming a reply, thinking, or running a tool — as distinct from 🟢 attached-but-idle and 🟡 detached. Detected by diffing the chat's visible terminal between polls (the on-screen "esc to interrupt" line changes every 1-2s while busy; tmux's own activity clock, it turns out, sits stale for minutes while a modern agent TUI works). Lights up for background (detached) chats too, and works for Claude, Codex, Grok, and Antigravity alike; a ⚪ suspended tab is never blue.
- Dot polling is now `terminalTabs.workingPollSeconds` (default 8s, was a fixed 15s), so 🟡/⚪ transitions are more responsive too. New knobs: `terminalTabs.showWorkingDot` (off = old three-state dot), `terminalTabs.workingHoldSeconds` (blue linger across quiet gaps, default 20s).
- **Diagnose Dots** and the status-bar tooltip now report the 🔵 working count.

## 1.1.3

- Name + recap generation falls back from Claude Haiku to Codex, then Grok, using existing CLI logins
- Bounded, restricted background calls and sanitized provider failure messages replace silent authentication failures
- Keeps the original transcript identity and manually set names when another CLI generates the recap

## 1.1.2

- Regenerate Name + Recap now produces entity-first titles (lead, client, company, project, site, or repo) and concrete latest-state recaps instead of generic workflow labels
- Removed the Show Group as Grid / Collapse Grid feature; groups now stay in the terminal panel split view
- New Chat (including Codex, Grok, and Antigravity variants) now joins the selected/open group and inherits its folder; with no group context it still falls back to `📥 New`
- Detects the conflicting internal `norml.persistent-terminal-tabs` build before registering any views or listeners, preventing split ownership that left open chats yellow

## 1.1.1

- Panel row description (and native tab prefix) shows the agent — Claude, Codex, Grok, Gemini — instead of the folder name

## 1.1.0

- Antigravity CLI (`agy`) recap, rename, resume, and **New Antigravity Chat**
- Live-binds `agy` typed into an older Claude-labelled tab to `~/.gemini/antigravity-cli/brain/<id>/` transcripts

## 1.0.0

First public release.

- Browser-style grouped tabs for Claude Code, Codex, and Grok terminal sessions
- Crash-persistent tmux sessions (macOS / Linux): close detaches, reload reattaches, Drop kills
- AI recap + naming (✨) from Claude, Codex, and Grok transcripts
- Search recaps across current tabs and dropped-chat history
- New Chat / New Codex Chat / New Grok Chat
- Suspend a tab or all closed tabs to free RAM; click to resume from transcript
- Per-workspace saved layout (groups, order, titles)
