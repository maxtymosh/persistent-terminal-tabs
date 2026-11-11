# Persistent Terminal Tabs 1.5.7

New Group no longer ends in an error. Since 1.3.0, creating a group from the Sessions panel saved the group and then showed `Error running command terminalTabs.newGroup`. The group worked, but the message looked like a failure.

After a group is created, its row is now selected in the Sessions view. If VS Code cannot select the row, the reason is written to the extension's output log and the group is still created.

Validation: 77 automated tests, strict type checking, lint and package verification. In actual VS Code, the published 1.5.6 package reproduced the error. This package, installed into a clean profile, created groups without it and selected the new row. Six tab lifecycle checks from 1.5.6 pass again on this package's modules with a controlled CLI fixture. These checks do not establish every provider authentication flow or resolve the existing normal-workload freezing report.

Download `persistent-terminal-tabs-1.5.7.vsix` and use **Extensions: Install from VSIX**, then **Developer: Restart Extensions**. The `ptt-install-bundle-1.5.7.zip` includes the VSIX, installation prompt, README, status guide and checksums. Existing saved tabs and conversation files are retained. No account login or session migration is performed by this update.

Marketplace publication remains pending Microsoft publisher authentication. GitHub VSIX updates are installed manually.
