# Agent status integrations

One engine accepts `working`, `waiting`, `idle`, or `unknown`. The integration belongs to the terminal application, not its selected model. Switching a supported client between hosted and local models needs no new detector.

## Visible states

Blue means verified working. The bell means waiting for input. A question mark means the work state is unknown; it never means idle. Green still means attached and yellow detached, including on question marks and bells. A grey outline means no live tmux session. `showWorkingDot` controls blue; status details remain available in tooltips.

## Built-in evidence

| Application | Source | Limits |
| --- | --- | --- |
| Claude Code | Native PID registry | Requires registry support; includes native delegated-work state. |
| Codex | Native OSC spinner / action-required title | A plain title clears blue but cannot prove idle, so becomes unknown. |
| Gemini CLI | Native dynamic OSC title, registered by a passive SessionStart hook | Requires dynamic titles and hook registration. Includes silent work, waiting and ready; disabled titles yield unknown. |
| Grok Build | Gated: unknown | Real Grok 1.0.70 cancellation retained native turn state and omitted the stop hook. Hook mappings remain testable, but the engine rejects them until cancellation passes. |
| Other agents / local clients | Shared lifecycle reporter | The client must report explicit transitions; unsupported apps stay unknown. |

No terminal screen scraping, output activity, CPU threshold, transcript scanning or guessed quiet-period timeout is used. A live process's reported state has no arbitrary expiry. A misbehaving client that omits its completion event can therefore still report stale work; adapters must cover completion, cancellation, error, permission wait/resume and exit. Missing evidence is unknown, not idle.

The shared process check binds PID, UTC/C-locale process birth, tmux session, pane ancestry, TTY and foreground group. Stopped, exited, background and reused processes cannot retain blue. Malformed/missing records fail closed. The bridge reads no prompts or tool arguments into its saved records.

## Install the passive bridge

Run with Node 20 or newer from the installed extension directory:

```sh
node out/status-setup.js
```

It creates `~/.terminal-tabs/status-bridge/ptt-status`, and one named Gemini SessionStart registration in `~/.gemini/settings.json`. Existing settings and unrelated hooks are preserved. A custom `GEMINI_CLI_HOME` home is honored; Gemini stores settings under its `.gemini/` child. Grok hooks/status-line settings are not installed while its adapter is gated. Configuration backups live in the bridge's `backups/` directory. JSONC configurations are refused rather than rewritten. Run setup again after an extension update to update the stable reporter copy.

Restart an agent normally to load new hooks; the installer never kills a live chat. For Gemini leave `ui.dynamicWindowTitle` enabled and `ui.hideWindowTitle` disabled. Gemini's end hook is deliberately not used as its authoritative state: cancellation paths can skip it.

To remove integration, delete only the `ptt-status-register` hook entry from Gemini settings. Do not restore an old entire settings backup over subsequent user changes. Remove the bridge folder only after removing those references. Claude and Codex native detection does not need this setup.

## Other terminal applications, including local models

The application invokes the helper as a child process, with its own PID and a stable session identifier:

```sh
~/.terminal-tabs/status-bridge/ptt-status report my-client working --pid CLIENT_PID --session SESSION_ID
```

Use `waiting` when requesting user input, `working` when continuing, `idle` after completion/cancellation/error, and `unknown` when the client cannot establish its state. Pass arguments as an argv array from application code, not interpolated prompt text. Report the actual interactive application's PID, never the long-lived login shell or a shared model server. The reporter verifies that the supplied PID is an ancestor in the foreground of a PTT pane.

Records are atomic and serialized per process. Older timestamped hook events cannot overwrite newer ones. PID/start-time validation invalidates records on exit/restart; records do not need cleanup for correctness. The interface is cooperative local observability, not a security boundary against software running as the same OS user.

The stored v1 JSON contract is implemented in `src/status-record.ts`. Third-party integrations should call the reporter instead of writing files. Adapter implementations return the same `AgentStatus` interface; they do not implement their own dot logic.

## ACP

ACP can supply turn start, permissions and completion through a client that owns the ACP connection. PTT does not own that connection for existing interactive terminals, so this release does not claim universal passive ACP interception. An ACP client can translate its own events into the reporter above.

## Verified source contracts

- [Gemini hooks](https://geminicli.com/docs/hooks/reference/), plus locally installed Gemini CLI 0.56.0 `computeTerminalTitle` and cancellation paths.
- [Grok hooks](https://docs.x.ai/build/features/hooks), plus Grok Build 1.0.41 embedded hook reference; actual interactive launcher ran 1.0.70 during isolated cancellation checks. Its native `pid_start` is epoch microseconds on macOS. The check found live PID binding works but cancellation state is unreliable.
- [ACP prompt turns](https://agentclientprotocol.com/protocol/prompt-turn).

## Release verification

Gemini CLI 0.56.0 passed an actual isolated tmux idle → working → user cancellation → idle cycle against a local fake provider; no cloud inference was used. A generic Node client passed working/waiting/idle/unknown/exit through the same reporter and engine. This verifies the integration transport, not any model's answer quality.

Grok 1.0.70 failed the same cancellation gate: the UI returned to its prompt, no stop hook arrived during observation, and native `turn.started_at_ms` remained set. Both hooks and a temporary native status-line observer were tested. Neither was enabled as production work evidence. Temporary test sessions were stopped; user sessions were not restarted.
