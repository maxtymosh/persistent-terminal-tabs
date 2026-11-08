# Persistent Terminal Tabs 1.5.4

Follow-up to the live 1.5.3 lag and grey-dot report.

- Startup, diagnostic/status refresh, session reports and client adoption now avoid blocking process snapshots on the extension host.
- History metadata loads independently from panel startup. Automatic startup/ticks skip legacy per-pane open-file discovery; explicit recap retains it.
- Asynchronous probes allow up to eight seconds under temporary load and log failures without conversation text.
- A failed tmux transport does not mark every chat stopped. Work becomes unknown until a successful read, and unavailable adoption evidence cannot authorize closing existing terminals.

Fixtures cover 50 open chats, 100-session reads, a slow 2.1-second successful read, failed reads/recovery, stale/shutdown results and retention after unavailable client evidence. Fourteen focused checks pass. The full serial suite passed 60/61 under host contention; the unchanged provider-timeout check passed separately.

This repairs specific PTT startup/read failures; it does not establish that all system-wide lag is resolved. No cached-blue hold or title-only work inference was added.

Download `persistent-terminal-tabs-1.5.4.vsix` and use **Extensions: Install from VSIX**. Restart extensions to load it. The `ptt-install-bundle-1.5.4.zip` contains the VSIX, install prompt, README, status guide and checksums. Marketplace submission still requires Microsoft publisher authentication.
