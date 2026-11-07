# Persistent Terminal Tabs 1.5.3

Reduces periodic UI stalls when many terminal chats are open.

- Status checks and click refresh now read tmux/process state asynchronously, sharing one read across concurrent callers.
- Reuse a single session snapshot instead of taking four full-machine snapshots per background tick.
- Match Codex's cached native title without repeatedly capturing panes or probing their open files during each tick.
- Ignore stale results after explicit refresh or shutdown. Slow history metadata cannot hold up later status checks.

Controlled tests cover 50 open chats and a 100-chat stress fixture, with two child probes per snapshot. In a local 10-session comparison, measured event-loop delay fell from 224 ms to 1 ms; this is not a claim that all system-wide lag is resolved. The 59-check acceptance passed during development. Final verification passed 58 checks together and the remaining provider-timeout check separately under heavy host load.

Native status/attachment evidence and saved chat identities remain in place. Expensive legacy Grok/Antigravity transcript discovery stays on startup or explicit recap paths. Existing chats are not closed by this update.

Download `persistent-terminal-tabs-1.5.3.vsix` and use **Extensions: Install from VSIX**. Restart extensions to load the new code. The `ptt-install-bundle-1.5.3.zip` contains the VSIX, install prompt, README, status guide and checksums. Marketplace submission still requires Microsoft publisher authentication.
