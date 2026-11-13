import posthog from "posthog-js";
import type { DiagnosticCode } from "./diagnostics";

function isPostHogConfigured() {
  return Boolean(
    import.meta.env.VITE_PUBLIC_POSTHOG_PROJECT_TOKEN && import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
  );
}

export function logApplicationStarted() {
  if (!isPostHogConfigured()) return;
  posthog.logger.info("application_started");
}

export function logApplicationDiagnostic(diagnosticCode: DiagnosticCode) {
  if (!isPostHogConfigured()) return;
  posthog.logger.warn("application_diagnostic_recorded", { diagnostic_code: diagnosticCode });
}
