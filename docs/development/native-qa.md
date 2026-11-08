# Native VS Code acceptance

Run affected cases on the actual candidate VSIX in a disposable profile and home, with a distinct tmux socket. Preserve the user's production window, agents, history and credentials. Record OS/architecture, VS Code version, source revision, package SHA-256, installed and loaded versions, tester/date and evidence. Mark each case PASS, FAIL, BLOCKED or NOT RUN with a reason. Use real providers only when that test is explicitly authorized; shell-only lifecycle tests do not qualify provider integration.

| Change area | Required native observation |
| --- | --- |
| Fresh install / docking | New profile lands beside Terminal; upgrading preserves an existing manual placement. |
| Combine / Uncombine | Group actions have visible icons; separate and recombine the same pane processes in saved order; sleeping chats stay closed during Uncombine. |
| Reattach / reload | Existing live session reattaches to the same pane process and conversation; extension restart preserves saved records and active agents. |
| Cold restore / cwd | Resume from the correct actual project folder; a missing folder does not silently create a different conversation. |
| Status dots | Actual supported agent transitions working/waiting/idle correctly; unknown evidence stays unknown; failures do not mark every session stopped. |
| Recaps | Manual recap uses the exact conversation; automatic opens remain responsive and start at most one automatic provider; shutdown rejects late results. |
| Performance | Observe the reported interaction (typing, scrolling, focus, reopen or layout), exact workload and event-loop/CPU evidence. Use mocks for large cardinalities; no dozens of fake sessions on the laptop. |
| Packaging / install | Downloaded and installed runtime bytes match the qualified package; activation confirms the expected version. |

Before/after session identity and saved-record counts establish preservation. Screenshots establish appearance, not process identity; fixture assertions establish code behavior, not real UI acceptance. Keep those evidence types separate.

A remaining blocked criterion keeps its parent acceptance open. Existing TASK-024 freezing acceptance remains open until the affected normal workload is observed; this pipeline does not close it.

The [release stage](../../.claude/ci-cd/release.md) selects combined journeys from its full inclusion inventory and consumes this checklist. A separate release owns unresolved native delivery; a completed feature merge does not require its original chat or checkout to remain open.
