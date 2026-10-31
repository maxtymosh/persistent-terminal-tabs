# Daily changelog — Persistent Terminal Tabs

## Oct 31, 2026 — recurring blue-dot repair

- Reproduced the screenshot's false green against the running contact-form pane: tmux reported zsh while its live Codex child emitted the busy spinner. Both processes shared the pane's foreground group.
- `[DECISION]` Replaced the exact foreground-command gate with verified pane ancestry, TTY and foreground-group ownership, reusing the RAM process snapshot. Kept the native Codex title signal; no screen heuristics, activity clock or hold timer. Other agents retain attachment colors.
- Added lifecycle and process-topology regression coverage: 33 tests pass with the project's established Node 22 runtime. The shell's default Node 16 cannot run existing t.after tests; it was not used for acceptance.
- Verified all transitions on an isolated real tmux server, including stale busy title after process exit. Compiled detector correctly recognizes the real affected pane without touching user sessions.
- Added loaded-version and per-pane ownership diagnostics. Packaged and installed 1.3.2; all installed JavaScript matches the tested output. Developer: Reload Window logged activation of 1.3.2 and three working sessions, including the affected contact pane. All 33 original tmux pane-root PIDs survived. The workspace lazy-start policy detached the terminals; 20 of 33 were reattached before native UI automation stopped reliably delivering further actions. The other 13 remain alive/detached, with their original pane-root PIDs.

## Oct 9, 2026 — group project folders

- Added a searchable native project picker to Add Group, including named recent folders, full paths, browse, typed paths and project aliases.
- Added Choose Project Folder on group rows; new-chat commands inherit the explicit group cwd even when the group is empty. Fixed plain terminals to receive their session cwd.
- Added bounded asynchronous workspace-folder discovery with separate budgets per root and name-ranked suggestions. Actual Work Root search uncovered competition from broad runtime trees and hundreds of reference folders; independent budgets and shorter-name ranking keep Reels discoverable.
- Preserved existing chat folders and resume identities when assigning group defaults or moving chats. Missing explicit folders block a new chat until repaired.
- `[DECISION]` Group projects define future-chat defaults, while session cwd remains conversation-specific recovery data; recent project aliases are shared across windows in a separate local cache.
- Recorded TASK-015 and GOAL-02 in the established repository planning store; retained historical tasks and did not migrate the store.
- Compiled, passed all 27 tests on Node 22.22.2, packaged and installed public PTT 1.3.0, and verified the installed changed JavaScript matches the tested build byte for byte. Actual `re` search finds the three Reels folders at ranks 7–9. Live visual confirmation awaits Max's deliberate window reload.

- Requested independent Opus 5.5 review via the authenticated local Claude CLI with tools disabled. Three attempts returned no review: initial request cancelled after more than ten minutes, subsequent attempts timed out at 150 and 90 seconds. Debug evidence verified API dispatch to claude-opus-5-5 and stream start, not a completed review. No Opus endorsement is claimed.
