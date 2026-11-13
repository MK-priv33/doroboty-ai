import { describe, expect, it } from "vitest";
import {
  canonicalAnalyticsPerson,
  isPrivateAnalyticsRoute,
  maskReplayAttribute,
  sanitizeAnalyticsEvent,
  sanitizeAnalyticsUrl,
} from "./posthog-privacy";

describe("analytics privacy boundaries", () => {
  it("excludes account, application and persona screens without excluding public offers", () => {
    for (const route of [
      "/app",
      "/app/profil/podglad",
      "/app/kandydaci/private-id",
      "/aplikuj/job",
      "/auth/sign-in",
    ])
      expect(isPrivateAnalyticsRoute(route)).toBe(true);
    for (const route of ["/", "/oferty", "/oferty/ai-product-manager", "/metodologia"])
      expect(isPrivateAnalyticsRoute(route)).toBe(false);
  });

  it("removes search text and fragments from event and person URL properties", () => {
    const privateUrl = "https://example.test/?email=PRIVATE_EMAIL#/oferty?query=PRIVATE_CV";
    const event = sanitizeAnalyticsEvent({
      uuid: "privacy-test",
      event: "$autocapture",
      properties: {
        $current_url: privateUrl,
        nested: [{ attr__href: privateUrl }],
        role: "candidate",
      },
      $set: { $initial_current_url: privateUrl },
      $set_once: { $initial_referrer: privateUrl },
    });
    expect(JSON.stringify(event)).not.toContain("PRIVATE_");
    expect(event?.properties.$current_url).toBe("https://example.test/");
    expect(event?.properties.role).toBe("candidate");
    expect(sanitizeAnalyticsUrl("mailto:private@example.test")).toBe("");
    expect(sanitizeAnalyticsUrl("not-a-url")).toBe("");
    expect(sanitizeAnalyticsEvent(null)).toBeNull();
  });

  it("keeps layout classes but redacts descriptive attributes, destinations and file values", () => {
    for (const name of [
      "title",
      "aria-label",
      "placeholder",
      "value",
      "src",
      "data-person",
      "id",
      "name",
    ])
      expect(maskReplayAttribute(name, "PRIVATE_PROBE")).toBe("");
    expect(maskReplayAttribute("href", "https://example.test/cv/PRIVATE_PROBE.pdf")).toBe("");
    expect(maskReplayAttribute("href", "https://example.test/a.css?token=PRIVATE_PROBE")).toBe("");
    expect(maskReplayAttribute("href", "https://example.test/assets/a.css")).toContain("a.css");
    expect(maskReplayAttribute("class", "nav-link")).toBe("nav-link");
  });

  it("only obtains identity labels from the shipped synthetic personas", () => {
    expect(canonicalAnalyticsPerson("candidate-anna")).toEqual({
      name: "Anna Kowalska",
      role: "candidate",
    });
    expect(canonicalAnalyticsPerson("private-imported-person")).toBeUndefined();
  });
});
