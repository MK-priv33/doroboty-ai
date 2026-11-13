import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import posthog from "posthog-js";
import { PostHogProvider } from "@posthog/react";
import { App } from "./features/prototype/app";
import "./app/globals.css";
import { RecoveryBoundary } from "./features/prototype/recovery-boundary";
import { installRuntimeDiagnostics, recordDiagnostic } from "./features/prototype/diagnostics";
import { logApplicationStarted } from "./features/prototype/posthog-logs";
import { posthogPrivacyConfig } from "./features/prototype/posthog-privacy";

const posthogToken = import.meta.env.VITE_PUBLIC_POSTHOG_PROJECT_TOKEN;
const posthogHost = import.meta.env.VITE_PUBLIC_POSTHOG_HOST;
const posthogConfigured = Boolean(posthogToken && posthogHost);

if (posthogToken && posthogHost) {
  posthog.init(posthogToken, {
    api_host: posthogHost,
    defaults: "2026-08-30",
    ...posthogPrivacyConfig,
    logs: {
      serviceName: "doroboty-ai-web",
      environment: import.meta.env.MODE,
    },
  });
  logApplicationStarted();
}

installRuntimeDiagnostics(window);
createRoot(document.getElementById("root")!, {
  onCaughtError: () => {
    if (posthogConfigured) posthog.capture("application_render_error");
    recordDiagnostic("render-error");
  },
  onUncaughtError: () => recordDiagnostic("runtime-error"),
  onRecoverableError: () => recordDiagnostic("recoverable-render-error"),
}).render(
  <StrictMode>
    <PostHogProvider client={posthog}>
      <RecoveryBoundary>
        <App />
      </RecoveryBoundary>
    </PostHogProvider>
  </StrictMode>,
);
