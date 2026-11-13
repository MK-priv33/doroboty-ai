# PostHog integration for the hosted prototype

## Intent and acceptance

The owner requested connecting PostHog to https://doroboty-ai-sage.vercel.app/ after the local wizard successfully delivered events to EU project 348050. Publish the reviewed wizard integration to the existing Vercel project, preserving synthetic-only usage and the existing app flows.

- Configure the public project token and EU ingestion host for production builds without committing the local .env.
- Keep analytics optional: an unconfigured participant checkout must still run offline.
- Capture fixed event names and bounded metadata rather than application answers, notes, search strings or CV contents in custom events/logs.
- Describe replay accurately: the owner chose Normal masking, so visible non-input synthetic content can be recorded.
- Execute the existing verification gate, review the diff separately, deploy the reviewed revision and verify event receipt from the public domain.

## Scope and review notes

The wizard added SDK initialization, persona identification, product events and fixed-code diagnostics. Persona IDs are shared synthetic identities: Anna across browsers aggregates into the same PostHog person; these are not unique participant counts or real authenticated users. Reset occurs on persona change. No real data is permitted.

Remove the wizard's development-only configuration exception so baseline setup and CI remain service-independent. Report caught render errors using a fixed event name instead of sending arbitrary exception text. Update the existing privacy paragraph without changing composition or styles. FEATURES.md SYS-03 and current limits require updating. Preserve the selected replay masking and console/network preferences managed in PostHog.

## Validation and publication

Verification on 2026-11-13: formatting, immutable design-system integrity and its 6 checks, lint, TypeScript, unit tests, baseline packet verification and static build passed. The full verify gate reached browser tests, where sandbox port binding was denied (EPERM); the browser suite was rerun with approval outside the sandbox using installed Chrome: 46 passed in 22.2s. Baseline checks explicitly blanked both analytics variables so CI does not send exercise events. Build retains a nonfatal bundle-size warning.

A separate source review checked custom event payloads, configuration fallback, synthetic identity/reset, diagnostics and error text, dependency lock consistency, ignored .env and the existing privacy copy. No visual composition or tokens were changed. The fixed synthetic persona identity is a documented measurement limitation.

Both public PostHog build variables were saved as Config values for Production in the existing Vercel project. The browser confirmed successful save; deployment and production event verification remain pending.

Vercel project `mk-c47e/doroboty-ai` deploys `MK-priv33/doroboty-ai` main. Previous production deployment: `FbMY3iLZBPL91dGsBb4UmtBqjAiB`, source `d1b151614f8d733e4013654485674380e28f2e6d`.

## Publication handoff

Reviewed implementation committed locally as `022c494` on `feat/posthog-integration`, based on `origin/main` (`d1b1516`). `git push origin HEAD:main` failed because no GitHub credential is available to the terminal (`could not read Username`). The owner signed in to the browser. Publishing the reviewed files through the GitHub upload UI on feat/posthog-integration, then merging into this fork main; no code is sent to the upstream repository. Both Production Config variables are already saved on Vercel. No need to save them again or redeploy the old source. Local verification included 36 unit tests and 46 browser journeys.

## Production publication evidence

The first Vercel preview failed in npm ci: the wizard's 13 new lockfile URLs referenced an inaccessible corporate npm mirror. Replaced only those resolved URLs with registry.npmjs.org, retaining versions and integrity hashes. A clean installation with a fresh npm cache against the public registry passed. The updated production build also passed.

Published through GitHub UI after owner login; fetched remote files matched the local reviewed worktree. PR #2 in MK-priv33/doroboty-ai was merged after Vercel's two checks passed. Production commit: 83684b598d539fa0a46283b1cd8a41cece27293a. Vercel deployment 3yWcULRwXUTVy3smo5ABHF3bFsfh is Ready and serves doroboty-ai-sage.vercel.app. The public release.json buildId exactly matches the final local production build: cb4aa1a55d60bc5808dc601a63e4fc36e29d55bc9c9304f3178a46a7024a624e. The production DOM loads the EU PostHog project config, recorder and survey assets for the configured public token. A synthetic Anna selection was performed on the public domain. After owner sign-in, PostHog Activity showed person_selected for candidate-anna (Anna Kowalska), with Current URL https://doroboty-ai-sage.vercel.app/. Receipt from the production domain is verified. The same table also contains localhost events; the domain was checked explicitly.
