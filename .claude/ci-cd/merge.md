# Merge — PTT

Read [central CI/CD](ci-cd.md) and [PR handoff](pr.md). Target: main. Effects: validation/candidate packaging only, no publication/install/deploy. Entry: authorized qualified PR, including the existing automatic owning-session integration policy for completed in-scope implementation.

1. **Audit exact PR and authority.** Verify repository, owner/task, PR head/base, actual main, readiness evidence and outstanding findings. Do not merge a different task or inherit release ownership.
2. **Reconcile current main.** Integrate current main in the owned checkout; review interactions. Refresh affected checks/source evidence after changes; preserve independent checkouts and WIP.
3. **Pass merge admission.** Require clean reviewed source, all seven engineering checks and exact-head current Quality. Run `node scripts/quality-gate.cjs check merge`. Preserve actual PR/status protection and zero mandatory human approvals. Stale/missing/failed proof holds this stage even if a later release will test.
4. **Merge and verify.** Use only `node scripts/quality-gate.cjs merge PR_NUMBER` with the actual PR number. It validates current-main ancestry, exact head/base and CI before guarded gh merge. Read back PR state/result, fetch actual origin/main, verify main CI and integrated source. Squash/rebase needs resulting patch identity, not ancestry alone.
5. **Record integration and handoff.** Save merge/target/PR identities, risk, checks/skips, compatibility and journeys for the next release. Record source integration separately from broader acceptance. Release the claim and close out the owned worktree after preservation/consumer gates. A later release consumes the durable task/PR without needing this chat or checkout.

Exit: **merged; release handled separately**, unless delivery was also requested. If an observed release already includes the merge, report its verified version instead of delivering twice. A separate release's blocked installation does not require retaining a merged feature checkout. Keep original product tasks open for specific broader acceptance gaps.
