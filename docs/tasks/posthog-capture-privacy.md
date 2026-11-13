# Autocapture and session replay privacy

## Intent and acceptance

The owner requested checking and enabling Autocapture in code and project settings, excluding places where private information is entered or displayed, enabling session replay and identifying a simple test button.

- Make click capture and replay explicit in the SDK and active EU project 348050.
- Allow automatic clicks only in static public navigation/hero areas; exclude forms, editable controls and marked private regions.
- Block private route content, persona display, documents and embedded/media content from recordings. Mask remaining text and inputs; scrub descriptive attributes and URL parameters before transmission.
- Do not send edited profile names through identify; use canonical synthetic persona labels only.
- Verify an automatic click on the home-page “Zobacz oferty” control without adding a capture call to it; verify private probes do not leave the browser.
- Run the required project checks, publish the reviewed changes and verify production event/recording receipt.

## Initial findings

The existing initialization relied on SDK defaults rather than explicit Autocapture/privacy configuration. Activity already contained an automatic click from the public site. Project settings: autocapture_opt_out was null, session_recording_opt_in true, maskAllInputs true, console and performance/network capture false. The project was explicitly set to autocapture_opt_out false and session_recording_opt_in true; console and performance capture remain false. No retention, billing, sharing or access changes are requested.

## Privacy boundary

All /app, /aplikuj and /auth content is private by default and blocked in replay. Navigation outside those regions remains visible as masked structure. This deliberately trades visibility of private panels for stronger data exclusion. Public static navigation/hero clicks are allowlisted. The shared synthetic persona identity remains a documented limitation; no edited or imported personal display name is sent. Masking changes apply to new recordings only.

## Validation and publication

Formatting, immutable design-system integrity and six kit tests, lint, TypeScript, 40 unit tests, baseline packet verification and static build passed. The browser stage initially hit the sandbox's EPERM port restriction; the approved retry passed all 46 journeys in 17.8s.

The real installed posthog-js 1.447.7 SDK was tested in an isolated local Chrome page with the exported production policy bundled unchanged. Ingestion was intercepted before transmission; no external requests were allowed. Test-only overrides disabled transport/replay compression, admitted the headless user agent and forced recording controls, allowing direct inspection of the wire payload. One public hero-link click produced $autocapture and one replay batch. Clicks inside a marked private panel and a form produced no additional autocapture. A sentinel present in displayed text, editable values, document attributes and query/hash parameters was absent from all captured payloads. Evidence: ignored artifacts/posthog-privacy-verification.json; reproducible local harness: artifacts/check-posthog-privacy.mjs. Initial harness attempts were corrected for a port collision, headless-user-agent filtering and the SDK's batch envelope; the final run passed.

Separate review checked default-deny selectors, private-route coverage, replay attribute handling, URL scrubbing including person properties, canonical fixture-only identity, and no visual style/layout changes. No paid or access setting changed. Production publication and cloud receipt verification pending.
