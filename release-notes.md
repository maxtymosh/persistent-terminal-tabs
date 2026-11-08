# Persistent Terminal Tabs 1.5.5

Opening a running chat now reconnects directly to tmux. It skips cold conversation discovery and configuration rewrites. Opening one missing pane preserves existing separate terminals and the correctly ordered split prefix, instead of rebuilding the entire group.

Automatic AI recaps yield before inspecting history and run one provider at a time. They use established conversation identities; manual recap can still discover an unbound conversation. Failed live attachment retains the saved chat.

All 67 automated checks pass. The 50-chat regression fixtures use in-memory terminal objects; they do not launch 50 real terminals or agents. Native workload acceptance remains open, so this release does not claim that every cause of system-wide freezing is resolved.

Download `persistent-terminal-tabs-1.5.5.vsix` and use **Extensions: Install from VSIX**. Restart extensions to load it. The `ptt-install-bundle-1.5.5.zip` contains the VSIX, install prompt, README, status guide and checksums. Marketplace submission still requires Microsoft publisher authentication.
