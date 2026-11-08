# Daily changelog — Persistent Terminal Tabs

## Nov 7, 2026 — live status recovery follow-up

- 1.5.3 was verified loaded, but Max reported persistent lag and grey/color flicker. Removed the remaining blocking startup/diagnostic/status consumers and client adoption. History metadata no longer gates panel startup; automatic legacy fd discovery is removed from startup as well as ticks.
- Async probes allow eight seconds and emit failure diagnostics. Transport errors retain last observed attachment but clear work to unknown; cleanup skips failed evidence and unavailable adoption evidence cannot close existing terminals.
- Fourteen targeted checks pass. Full serial suite passes 60/61 plus the unchanged timeout fixture separately under contention. Six reads of 29 real live sessions take 106–116 ms, all known; native Restart Extensions loaded 1.5.4 at 00:28:43 UTC and adopted 26 attachments. A real 2112 ms read kept all 28 states known. Final-baseline pane PIDs retained; earlier unattributed pane change remains recorded. Latest GitHub 1.5.4 and all four anonymous assets/nested checksums verified.

## Nov 7, 2026 — polling at 50 open chats

- Replaced repeated blocking background tmux/process reads with one shared async snapshot; click refresh and startup catch-ups use the same in-flight read. Guard stale/shutdown results and keep slow history metadata independent from status polling.
- Background Codex binding reuses cached native titles. Legacy Grok/Antigravity fd discovery stays on startup/explicit recap paths; saved identities and all native status interpretation remain intact.
- 50-open/73-sleeping activation and 50/100-session probe fixtures verified. Measured local 10-session event-loop delay fell from 224 ms to 1 ms. Compile and 59-check acceptance verified; final full runs passed 58 and the unchanged provider-timeout check passed alone under extreme host contention.
- Packaged and installed 1.5.3 without restarting VS Code or closing user chats. Latest public GitHub 1.5.3 targets 8c3a967. All four anonymous downloads, nested VSIX/checksums and GitHub digests verified. Source pushed to origin/main; temporary worktree closeout is linked from TASK-024.

## Nov 6, 2026 — blank Uncombine icon

- Fixed the unsupported `ungroup` icon name in the Uncombine action; use VS Code's built-in `multiple-windows` glyph. Verified the installed registry and visually inspected a render made with VS Code's actual font.
- All 55 tests pass; packaged and installed 1.5.2 with manifest/runtime parity. Published latest public 1.5.2 from 8fb41eb; all four anonymous downloads, public manifest icon, nested VSIX and bundled checksums verified. No window reload or live user-terminal operation performed.

## Nov 6, 2026 — new-user terminal docking

- New installs place Sessions beside the terminals inside the Terminal panel on first activation. Existing saved state and later manual moves stay untouched. Added Dock Beside Terminal for explicit repositioning and changed the shortcut to focus the actual view.
- `[DECISION]` Use the native move-view command plus a one-time per-profile marker; keep stable view/container IDs and avoid rewriting VS Code settings/storage. Legacy saved state marks an upgrade rather than triggering a move.
- All 55 tests pass. Native docking completed in an isolated VS Code Extension Development Host (renderer PTT_NATIVE_DOCK_SUCCEEDED); user terminals/layout were not moved by that test. Packaged and installed 1.5.1; all 18 runtime modules match tested output. No forced reload; the new-user policy will preserve Max's existing state/layout when activated.
- Published latest public release 1.5.1 from 2b832e7. All four anonymous downloads match local assets; nested VSIX and bundled checksums verified. Removed the exact empty QA workspace slice/index entry. Marketplace remains pending publisher authentication.

## Nov 6, 2026 — reversible split groups

- Published the public 1.5.0 download, installation prompt and bundle as the latest GitHub release at tag b249074. Runtime matches the tested/installed build; all 17 modules verified. All four public assets downloaded anonymously and matched byte-for-byte, including nested VSIX and bundled checksums. Rechecked Marketplace access after Max's explicit publishing request: no configured publisher authentication, public gallery query returns no PTT listing. Microsoft publisher sign-in/ownership remains required; no browser takeover.
- Added Uncombine Group into Separate Tabs beside Combine, in the group context menu and Command Palette. It uses native Unsplit without disposing running shells, retains pane order and focused group chat, and leaves sleeping chats closed.
- `[DECISION]` Persist per-group split/separate layout; new and reopened chats respect separation until an explicit Combine. Legacy groups stay split; canceled large-group Combine leaves the preference unchanged.
- Registered-command coverage verifies repeated separation, native group ordering, unchanged session metadata, unrelated groups, new/reopened chats, explicit recombination, canceled Combine, empty/stale groups and menu wiring. Compile and all 50 tests passed on Node 22.22.2.
- Packaged and installed 1.5.0; all 17 JavaScript modules in the VSIX and installed extension match tested output. No window reload or manipulation of live user terminals; activation awaits Restart Extensions. Public downloadable release subsequently updated to 1.5.0 as recorded above.

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
