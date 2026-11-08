# Stage to production — PTT

Read [central CI/CD](ci-cd.md). **Not applicable:** no staging environment/develop branch or promotion trigger exists. Main is integration, not staging; GitHub VSIX assets have no Beta/Stable ring mapping here.

1. **Verify the actual topology.** Read source/workflows and target. Do not invent develop→main, staging→production, app rings or profile/data replacement.
2. **Route accepted source.** Qualified merged source enters [release](release.md), then [local-prod](local-prod.md) only for explicitly authorized immutable publication/installation.
3. **Record applicability and outcome.** State N/A and the verified source/target reason. Already published/installed identical bytes are verified rather than delivered twice. A real staging/promotion system is separate work requiring a factual contract update.

Exit: explicit N/A and direct-route handoff, without fabricated promotion, deployment or acceptance.
