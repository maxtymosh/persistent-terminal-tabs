# Tasks — Persistent Terminal Tabs

> Format: `- [ ] [P0|P1|P2|P3] [TASK-NNN] Action — why / relevant path (GOAL-NN)`.

## Current repair

- [ ] [P0] [TASK-027] Preserve Codex conversation identity and profile through reopen/restart — [task](items/task-027-codex-profile-persistence.md).

## Current mechanism — 1.4.1

A shared engine resolves working, waiting, idle or unknown from the verified foreground application. Blue means working, a bell means waiting, and a filled grey circle means unknown. Green means attached and yellow detached for known idle/waiting; hollow grey means suspended. Codex native thread/project titles now resolve idle instead of remaining unknown; missing/unrecognized titles stay unknown. Process ancestry, TTY, foreground group and process birth bind evidence to the correct live application.

Claude uses its native PID record; Codex uses native busy/approval titles; Gemini uses native dynamic titles after passive SessionStart registration. A reusable lifecycle reporter supports other clients, including local models. Grok remains deliberately unknown after failing real cancellation testing. Terminal animation, typing, transcript text, CPU and generic output changes are not work signals. No quiet-period hold is used. See docs/agent-status.md for setup and limits.

Name/recap lookup reads modern Codex paginated history through read-only local
app-server methods. Exact unique conversation names match full terminal titles,
including busy and approval decorations; known thread IDs remain persistent.

## Historical mechanism — superseded by 1.2.3

The former screen-change/busy-text heuristic below produced false positives and
is retained only as implementation history. It is not the current specification.

## Mechanism (decided — REVISED after live testing)

**First attempt (tmux `#{session_activity}`) was wrong** and is abandoned.
Measured on Max's real sessions: the activity clock sat **100–180 s stale**
while a Claude/Codex TUI was visibly working — modern agent TUIs batch their
redraws, so tmux's activity clock barely moves. Also found: the v1 build was
**never installed** (a window reload reloads the *old* packaged build). Both
fixed: bumped to **1.2.0** + a real install.

**Shipped mechanism — read the VISIBLE PANE per poll, two signals:**

1. **Busy marker** — `capturePane(id)` (tmux `capture-pane -p`, visible screen,
   works detached) then a `BUSY_MARKER` regex: `esc to interrupt`, its truncated
   `(2m 46s ·` elapsed-timer head, or `working…interrupt`. Every agent
   (Claude / Codex / Grok) shows this while a turn runs. Instant — no baseline
   poll needed. Live test: cleanly split 7 working / 24 live on Max's box.
2. **Pane changed** — whitespace-normalised, non-blank pane text differs from
   the last poll. Backstop for a narrow pane that truncated the marker away, or
   a plain build streaming in a shell. The non-blank guard kills the
   blank-pane-line-count false positive seen in testing.

Either fires → stamp `lastBusyMs[id]`; the dot then **holds blue for
`workingHoldSeconds`** (default 20) to bridge quiet gaps (long silent tool call,
between-turns pause) so it doesn't flap.

Cost: one small `capture-pane` per **live tmux session** (~24, not 100+ tabs)
per `workingPollSeconds`. Hooks still rejected for v1 (Claude-only, global
config mutation, no Codex/Grok coverage) — `TASK-007`.

Soft edges (acceptable — self-correct within `workingHoldSeconds`): a pane
literally showing the text "esc to interrupt" (catting a file, this note); a
shell with a live-clock prompt; the user mid-typing a long prompt.

**Config (`terminalTabs.*`):**
- `showWorkingDot` (bool, default true) — master switch; off ⇒ nothing is blue.
- `workingPollSeconds` (default 8, clamp 3–60) — poll cadence; also now drives
  the dot timer (was a hardcoded 15 s), so 🟡/⚪ transitions got snappier too.
- `workingHoldSeconds` (default 20, clamp 5–300) — blue linger after the pane
  last read busy.

**Dot precedence:** working → 🔵 `charts.blue` filled · else open → 🟢 · else
detached → 🟡 · else ⚪ outline.

## Now

- [x] [P2] [TASK-028] [Stop the New Group error toast](items/task-028-new-group-reveal.md) — the tree provider lacked `getParent`, so reveal rejected after the group was saved. Fixed in source with a reveal-contract regression and a native VS Code check. Released and installed as 1.5.7; it loads in Max's window after Restart Extensions.

- [x] [P1] [TASK-026] [Adapt the updated CI/CD stage bundle](items/task-026-ci-cd-stage-bundle.md) — separate PR/merge/delivery/release completion; explicit no-staging transitions; combined release inventory and preserved gates.


- [x] [P1] [TASK-025] [Apply MoonPress engineering and QA practices](items/task-025-development-quality-pipeline.md) — required CI, lint, dependency audit, exact-source admission, VSIX provenance and separate native QA.


- [ ] [P1] [TASK-024] [Remove blocking status polling](items/task-024-nonblocking-status-polling.md) — measured background stalls, async shared snapshot, 50/100-chat scale checks. Install/public release and worktree closeout evidence live in the task and release record.

- [x] [P1] [TASK-023] [Dock new installs beside Terminal](items/task-023-default-terminal-location.md) — once-per-profile default with legacy layout preservation; 55 tests and isolated native command smoke passed. Packaging and public release evidence live in the task and release record.

- [x] [P1] [TASK-022] [Add Uncombine Group beside Combine](items/task-022-uncombine-group.md) — native lossless separation plus saved layout; automated acceptance passed. Local package/activation status is recorded in the task.

- [x] [P1] [TASK-021] Correct false unknown Codex idle status and activate 1.4.1 — 48 tests pass, installed JavaScript matches tested output, all three reported Upwork panes resolve idle. VS Code Restart Extensions loaded 1.4.1 at 2026-11-03 04:45:25 UTC (Nov 2 local); refreshed panel has no question icons. All 19 live sessions remain open. (GOAL-01)

- [x] [P1] [TASK-018] Build and install shared state engine, Gemini integration and reusable local-client bridge as 1.4.0 — 47 tests pass; live Gemini and generic lifecycle tests pass; installed JavaScript matches compiled output. (GOAL-01)
- [x] [P1] [TASK-020] Verify loaded 1.4.0 activation — confirmed in diag.log on Nov 2 at 18:45:22 UTC. (GOAL-01)
- [ ] [P1] [TASK-019] Unblock Grok work-state integration — isolated actual 1.0.70 cancellation left both lifecycle hooks and native turn.started_at_ms stale after prompt return. Engine deliberately reports unknown. Require reliable cancellation/permission/idle lifecycle evidence before enabling; see docs/agent-status.md. (GOAL-01)

- [x] [P1] [TASK-017] Add missing Claude work-state integration and activate 1.3.3 — 40 tests pass; installed JavaScript matches compiled output; loaded-version log confirms 1.3.3. Real Claude interruption clears native busy, and live Solutions Pages transitioned busy to idle. Lazy-start terminal retention is covered by an activation regression test; it does not preserve transient terminals through a full window reload. (GOAL-01)

- [x] [P1] [TASK-016] Repair recurring Codex blue-dot failures — 1.3.2 verifies pane process ownership instead of requiring tmux to name Codex; 33 tests and isolated real tmux lifecycle pass. Installed JavaScript matches the tested build; loaded-version log and live working count verified. All 33 original pane-root PIDs survived reload. (GOAL-01)
- [x] [P2] Obtain requested Opus 5.5 review — completed design and actual-code reviews on Nov 1 via claude-opus-5-5. No concrete blocker found. Checked its startup questions: foreign-session binding does not populate liveTerminals, tmuxLaunch uses tmux directly as shellPath, and the non-lazy path disposes/rebuilds rather than duplicating adopted terminals.
- [x] [P2] Superseded: restore the old verification-reload attachment snapshot — by Nov 1 the user had continued working and the workspace had 36 live / 30 open sessions. Current panel state is authoritative; do not force the earlier 33-session attachment snapshot onto it.

This established legacy planning store has no v3 config or enabled GitHub issue mirror. Continue it in place; do not bulk-migrate historical records as part of this feature.

## Done — this round

- [x] [P1] [TASK-012] Refresh the dots on interaction, not just every
      `workingPollSeconds` — `pokeDots()` (deferred `refreshAlive()` + render)
      called from `openTab` (covers the already-open early-return), `openGroup`,
      and the Refresh command. `pokePending` flag coalesces rapid clicks.
      `src/extension.ts`. Note: an on-click refresh still respects
      `workingHoldSeconds` — a tab that finished < 20s ago stays 🔵 by design;
      lower `workingHoldSeconds` if that tail bothers Max.

## Someday — optional, outside the completed repair

- [x] [P3] [TASK-007] Superseded by TASK-017: Claude native runtime status provides work, wait and idle state without mutating global hooks.
- [x] [P3] [TASK-008] Shared waiting state and bell icon added in 1.4.0 for verified native approval signals and the generic reporter.
- [ ] [P3] [TASK-010] Verify a native Antigravity work-state signal before
      enabling blue for agy. Screen changes and busy-text guesses are retired.

## Blocked

## Done

- [x] [P1] [TASK-015] [Add named project folders to terminal groups](items/task-015-add-group-project-picker.md) — searchable folder picker, remembered names and explicit folder inheritance (GOAL-02). 27 tests passed; actual workspace `re` search finds Reels; installed 1.3.0 matches tested output. Live UI confirmation remains for Max after reload.

- [x] [P1] [TASK-001] Working-set tracking — `paneHash` + `lastBusyMs` maps,
      `workingCfg()` / `refreshWorking()` / `workingIds()` / `isWorkingCached()`;
      folded into the dot-timer poll; `refreshAlive()` returns a change when only
      the working set moved. `src/extension.ts`
- [x] [P1] [TASK-002] Blue dot — `isWorking` 5th ctor param on `TabsTree`, top
      precedence in `getTreeItem` (`circle-filled` + `charts.blue`), four-state
      tooltip line; wired `isWorkingCached` at the `new TabsTree(...)` call.
      `src/tree.ts`, `src/extension.ts`
- [x] [P1] [TASK-002b] Detection rewrite after live testing — `capturePane()` in
      `src/tmux.ts`; `BUSY_MARKER` + normalised pane-diff in `refreshWorking()`.
      tmux `session_activity` dropped from the calc (still used by
      `autoSuspendSweep`, untouched).
- [x] [P1] [TASK-003] Config — `showWorkingDot` (true), `workingPollSeconds`
      (8, 3–60), `workingHoldSeconds` (20, 5–300); `dotTimer` interval driven by
      `workingPollSeconds`. `package.json`, `src/extension.ts`
- [x] [P1] [TASK-004] `diagDots()` logs `working=`; Diagnose Dots toast +
      status-bar tooltip show the 🔵 tally. `src/extension.ts`
- [x] [P2] [TASK-005] Docs — README dot legend gains 🔵; CHANGELOG `## 1.2.0`
      entry; `.claude/**` added to `.vscodeignore`; `package.json` version
      1.1.3 → **1.2.0** (so VS Code actually reloads it).
- [x] [P1] [TASK-006] `npm run compile` clean · `npm test` 8/8 · `vsce package`
      → `persistent-terminal-tabs-1.2.0.vsix` (16 files) · unpacked into
      `~/.vscode/extensions/maxtymosh.persistent-terminal-tabs-1.2.0/` and
      verified the new symbols are in `out/extension.js`. `git status`: only my
      files touched; `src/recaps.ts` left as the other session's WIP; nothing
      staged, nothing committed.
- [x] [P1] [TASK-011] Live-validated the shipped mechanism against Max's real
      tmux socket: instant detection, 7/24 sessions flagged working, stable
      across 5 polls, this Claude session correctly among them.

### Historical verification — superseded by the 1.2.3 closeout

**Done:** compiles, tests 8/8, dot precedence + predicates read correctly,
`showWorkingDot:false` ⇒ `workingIds()` empty. Mechanism live-tested against the
real socket (TASK-011): the `BUSY_MARKER` + pane-diff logic, exactly as compiled
into `out/`, cleanly separated working from idle sessions and updated on the
first poll.

**Historical checklist (not pending for 1.2.3):**
1. **Reload Window** (Cmd+Shift+P → Developer: Reload Window). Full Cmd+Q +
   reopen if the dots don't change behaviour.
2. A tab with an agent mid-reply shows 🔵 within ≤ `workingPollSeconds` (8s);
   ~20s (`workingHoldSeconds`) after it finishes it returns to 🟢.
3. Close (detach) a mid-reply tab → its row still shows 🔵 (background work).
4. A ⚪ suspended tab never turns 🔵.
5. **Persistent Terminal Tabs: Diagnose Dots** → toast reports a 🔵 count and
   `~/.terminal-tabs/diag.log` has a `working=N` field.

---
*Never silently delete open work. Check it off, defer it with a reason, archive
it, or promote it to a linked project-lane plan.*

## Closeout — September 29, 2026

Source: [Max's closeout request](captures/2026-09-29-ptt-closeout.md).

- [x] [P1] [TASK-009] Updated extension loaded after reload; activation logged
  September 30 at 01:20 UTC (September 29 in New York). Max confirmed it seems working.
- [x] [P1] [TASK-013] Replace false-blue screen heuristics with native Codex
  work-state titles and remove the hold. Installed 1.2.3 matches the compiled
  JavaScript byte for byte; 16 tests pass. Commit `5d18cd6` is on origin/main.
- [x] [P1] [TASK-014] Restore modern Codex name/recap lookup, including busy
  and approval title decoration. Exact affected conversation read successfully;
  a real generation produced “Iryna — Shuttle Setup”. Conversation binding is
  saved. Live extension has also successfully saved other regenerated recaps.
  The affected tab still has its default “chat 12” title and no stored recap;
  its on-demand ✨ action can populate those. UI automation could not reliably
  target that action while the window was being used, so no live-state JSON
  was edited behind the running extension. This is a remaining optional
  per-tab generation, not an unresolved history lookup or release defect.

All 45 tmux sessions present before the install survived. No temporary worktree
was created. Optional TASK-007/008/010 remain deferred; they are not blockers
for closing this repair chat. The screen heuristic must not be reintroduced.
