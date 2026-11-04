# Daily changelog — Persistent Terminal Tabs

## Nov 4, 2026 — public 1.4.1 download

- Published the public VSIX and installation bundle for 1.4.1 as the latest GitHub release, closing the gap between fixed public source and the older 1.3.1 download. Updated versioned install instructions, corrected the missing setup.md reference, and included the status integration guide.
- Fresh verification: 48 tests pass; packaged JavaScript matches compiled output. All four public assets were downloaded anonymously and matched byte-for-byte; release tag v1.4.1 resolves to 4b8b038. Marketplace remains blocked by absent publisher authentication.

## Nov 2, 2026 — unknown dots and Codex idle regression

- Fixed the 1.4.0 regression that classified ordinary Codex thread/project titles as unknown forever. All three reported Upwork sessions were verified at idle prompts; the corrected live detector resolves idle. Click refresh was already wired; a new activation test verifies the already-open early-return path refreshes immediately.
- `[DECISION]` Unknown now uses a filled grey circle, with attachment details in the tooltip; stopped remains hollow. Recognize both native approval blink phases, microphone-prefixed work and explicit run-state titles.
- 48 tests pass, including click refresh isolated from startup catch-ups. Packaged and installed 1.4.1; installed JavaScript matches compiled output. Source reviewed against Codex 0.166.0 native title renderer. Existing Claude, Gemini, generic bridge and Grok quarantine retained.
- Activated and verified 1.4.1 using the Extensions view’s Restart Extensions button. Log confirms 2026-11-03 04:45:25 UTC (Nov 2 local); refreshed panel has no question-mark icons and retains 19 live / 19 open sessions. Earlier palette attempts failed, but the dedicated restart action succeeded. TASK-021 closed.

## Nov 1, 2026 — shared status engine and adapter acceptance

- Release 1.4.0 passes all 47 tests and is packaged/installed; installed JavaScript matches compiled output. The stable generic reporter and passive Gemini registration are installed. Loaded activation remains unverified (latest log: 1.3.3); native command entry was unreliable, and no full-window reload was forced. TASK-020 records the activation check.

- Replaced application-specific dot decisions with a common working/waiting/idle/unknown engine and reusable process-bound lifecycle bridge. Unknown and waiting now have question/bell icons while attachment colors remain unchanged.
- Added Gemini native-title integration through passive process registration. Actual Gemini 0.56.0 idle → working → cancellation → idle passed using an isolated tmux session and a local fake provider. Generic local-client work/wait/idle/unknown/exit passed the same engine; a repeatable fixture is saved in scripts/check-live-status.py.
- Grok 1.0.70 failed cancellation acceptance even with native status-line observation: UI returned to prompt while native work state stayed active and no stop hook arrived. Gated Grok to unknown and removed this task's temporary global hook. No current-turn status-line setting was installed in the user's config. TASK-019 retains the exact remaining blocker.
- Opus 5.5 reviewed the code. Addressed delayed-event ordering, process-start identity, lock ownership and reported-application binding. Preserved unrelated configuration and switched installed bridge runtimes atomically. The Grok failure was found by actual lifecycle testing after review, not hidden by passing unit tests.

## Nov 1, 2026 — Claude work-state repair verified

- Completed 1.3.3 acceptance: 40 tests pass, packaged and installed JavaScript matches the compiled source, and the live activation log confirms version 1.3.3 loaded on Oct 31 at 19:02:52 UTC.
- Verified native Claude busy-to-idle on interruption in an isolated tmux session. Live user sessions independently changed state: Solutions Pages from busy to idle and Moonpress latest changes from idle to busy; Fine Color continued reporting busy. No screen-output heuristic or age-based hold was added.
- Opus 5.5 completed both a mechanism review and an actual-code review, finding no concrete blocker. Checked its three startup questions against the code: foreign-session binders do not populate the terminal map, tmux is the direct terminal process, and the small-workspace path disposes/rebuilds rather than duplicating adopted terminals.
- Terminal adoption is regression-tested for extension-host restart with lazy startup. A full window reload can still close VS Code transient terminals; the adoption change does not claim to prevent that. The user's current panel layout supersedes the earlier reattachment snapshot.

## Oct 31, 2026 — recurring blue-dot repair

- Reproduced the screenshot's false green against the running contact-form pane: tmux reported zsh while its live Codex child emitted the busy spinner. Both processes shared the pane's foreground group.
- `[DECISION]` Replaced the exact foreground-command gate with verified pane ancestry, TTY and foreground-group ownership, reusing the RAM process snapshot. Kept the native Codex title signal; no screen heuristics, activity clock or hold timer. Other agents retain attachment colors.
- Added lifecycle and process-topology regression coverage: 33 tests pass with the project's established Node 22 runtime. The shell's default Node 16 cannot run existing t.after tests; it was not used for acceptance.
- Verified all transitions on an isolated real tmux server, including stale busy title after process exit. Compiled detector correctly recognizes the real affected pane without touching user sessions.
- Follow-up: Max demonstrated active Claude sessions still green. The 1.3.2 repair only covered Codex and was incomplete for Claude. Added native Claude busy/idle/waiting registry support with PID, UTC process-birth, interactive-kind and tmux-session validation. It includes delegated tasks and needs no global hooks, screen heuristics or timeout.
- Added exact tmux-client adoption on extension-host restart so lazy startup can retain existing terminals and split layout during the update, without launching dormant sessions.
- Added loaded-version and per-pane ownership diagnostics. Packaged and installed 1.3.2; all installed JavaScript matches the tested output. Developer: Reload Window logged activation of 1.3.2 and three working sessions, including the affected contact pane. All 33 original tmux pane-root PIDs survived. The workspace lazy-start policy detached the terminals; 20 of 33 were reattached before native UI automation stopped reliably delivering further actions. The other 13 remain alive/detached, with their original pane-root PIDs.

## Oct 9, 2026 — group project folders

- Added a searchable native project picker to Add Group, including named recent folders, full paths, browse, typed paths and project aliases.
- Added Choose Project Folder on group rows; new-chat commands inherit the explicit group cwd even when the group is empty. Fixed plain terminals to receive their session cwd.
- Added bounded asynchronous workspace-folder discovery with separate budgets per root and name-ranked suggestions. Actual Work Root search uncovered competition from broad runtime trees and hundreds of reference folders; independent budgets and shorter-name ranking keep Reels discoverable.
- Preserved existing chat folders and resume identities when assigning group defaults or moving chats. Missing explicit folders block a new chat until repaired.
- `[DECISION]` Group projects define future-chat defaults, while session cwd remains conversation-specific recovery data; recent project aliases are shared across windows in a separate local cache.
- Recorded TASK-015 and GOAL-02 in the established repository planning store; retained historical tasks and did not migrate the store.
- Compiled, passed all 27 tests on Node 22.22.2, packaged and installed public PTT 1.3.0, and verified the installed changed JavaScript matches the tested build byte for byte. Actual `re` search finds the three Reels folders at ranks 7–9. Live visual confirmation awaits Max's deliberate window reload.
