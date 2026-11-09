# Persistent Terminal Tabs 1.5.6

Saved Codex tabs now retain the conversation ID and its profile, including separate CLI profiles. Reopening a stopped session uses that saved identity instead of leaving an empty shell or looking for a Claude conversation.

Per-tab binding records survive older workspace snapshots. Missing or ambiguous history keeps the saved tab and reports the problem. Recaps use the exact bound conversation rather than choosing the newest conversation in a folder.

Validation: 76 automated tests, strict type checking, lint and package verification. Native VS Code lifecycle checks cover reattachment, extension reactivation and cold restore with a controlled CLI fixture; live Codex identity discovery was checked separately. These checks do not establish every provider authentication flow or resolve the existing normal-workload freezing report.

Download `persistent-terminal-tabs-1.5.6.vsix` and use **Extensions: Install from VSIX**, then **Developer: Restart Extensions**. The `ptt-install-bundle-1.5.6.zip` includes the VSIX, installation prompt, README, status guide and checksums. Existing saved tabs and conversation files are retained. No account login or session migration is performed by this update.

Marketplace publication remains pending Microsoft publisher authentication. GitHub VSIX updates are installed manually.
