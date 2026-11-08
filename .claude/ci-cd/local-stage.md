# Local to staging — PTT

Read [central CI/CD](ci-cd.md). **Not applicable:** there is no configured hosted staging, staging branch/URL or cloud backend. CI artifacts and disposable VS Code QA profiles are qualification surfaces, not a staging deployment.

1. **Verify applicability.** Inspect actual workflows and requested target; do not infer staging from a candidate or invent a deploy command.
2. **Use the supported route.** Source follows [PR](pr.md)/[merge](merge.md); authorized extension delivery follows [release](release.md) and [local-prod](local-prod.md).
3. **Record the boundary.** Mark this stage N/A with its verified reason and direct-route handoff. A request for real staging remains unsupported until separately scoped; do not silently install on the production user profile instead.

Exit: explicit N/A and correct handoff, with no environment creation, data transfer, deployment or claimed staging acceptance.
