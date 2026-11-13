import type { CaptureResult, PostHogConfig } from "posthog-js";
import people from "./data/people.json";

export const PRIVATE_SELECTOR =
  ".ph-no-capture, [data-ph-private], form, input, textarea, select, [contenteditable], iframe, object, embed, img, video, audio, canvas";

export function isPrivateAnalyticsRoute(pathname: string) {
  return /^\/(app|aplikuj|auth)(\/|$)/.test(pathname);
}

export function canonicalAnalyticsPerson(id: string) {
  const person = people.find((candidate) => candidate.id === id);
  return person ? { name: person.name, role: person.role } : undefined;
}

export function sanitizeAnalyticsUrl(value: string) {
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) return "";
    // Hash routes may contain free-text search parameters. Keep only the origin/path.
    return `${url.origin}${url.pathname}`;
  } catch {
    return "";
  }
}

export function sanitizeAnalyticsEvent(event: CaptureResult | null): CaptureResult | null {
  if (!event) return null;
  function scrub(value: unknown, key = ""): unknown {
    if (typeof value === "string" && /url|referrer|href/i.test(key))
      return sanitizeAnalyticsUrl(value);
    if (Array.isArray(value)) return value.map((item) => scrub(item));
    if (value && typeof value === "object")
      return Object.fromEntries(
        Object.entries(value).map(([childKey, childValue]) => [
          childKey,
          scrub(childValue, childKey),
        ]),
      );
    return value;
  }
  return {
    ...event,
    properties: scrub(event.properties) as CaptureResult["properties"],
    ...(event.$set ? { $set: scrub(event.$set) as CaptureResult["properties"] } : {}),
    ...(event.$set_once
      ? { $set_once: scrub(event.$set_once) as CaptureResult["properties"] }
      : {}),
  };
}

const structuralAttributes = new Set([
  "class",
  "role",
  "type",
  "tabindex",
  "disabled",
  "checked",
  "selected",
  "aria-hidden",
  "aria-expanded",
  "aria-selected",
  "aria-pressed",
  "aria-disabled",
  "width",
  "height",
  "viewBox",
  "d",
  "fill",
  "stroke",
  "stroke-width",
  "stroke-linecap",
  "stroke-linejoin",
  "xmlns",
  "rel",
  "crossorigin",
]);

export function maskReplayAttribute(name: string, value: string) {
  if (structuralAttributes.has(name)) return value;
  // Stylesheets are needed to replay the layout; other destinations/content stay hidden.
  if (name === "href" && /^https?:\/\/[^?#]+\.css$/.test(value)) return value;
  return "";
}

export const posthogPrivacyConfig: Partial<PostHogConfig> = {
  autocapture: {
    dom_event_allowlist: ["click"],
    element_allowlist: ["a", "button"],
    css_selector_allowlist: [".home-intro", "[data-ph-autocapture-safe]"],
    css_selector_ignorelist: [
      ".ph-no-autocapture",
      "[data-ph-no-autocapture]",
      ".ph-no-capture",
      "[data-ph-private]",
      "form",
      "input",
      "textarea",
      "select",
      "[contenteditable]",
    ],
    capture_copied_text: false,
    capture_value_css_selector_allowlist: [],
  },
  mask_all_text: true,
  mask_all_element_attributes: true,
  disable_capture_url_hashes: true,
  save_referrer: false,
  save_campaign_params: false,
  capture_performance: false,
  capture_exceptions: false,
  disable_session_recording: false,
  enable_recording_console_log: false,
  session_recording: {
    maskAllInputs: true,
    maskTextSelector: "*",
    blockSelector: PRIVATE_SELECTOR,
    maskAttributeFn: maskReplayAttribute,
    recordCrossOriginIframes: false,
    recordHeaders: false,
    recordBody: false,
    maskCapturedNetworkRequestFn: () => null,
    collectFonts: false,
  },
  before_send: sanitizeAnalyticsEvent,
};
