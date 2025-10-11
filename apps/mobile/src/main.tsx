import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";

posthog.init(import.meta.env.VITE_PUBLIC_POSTHOG_KEY, {
  api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
  defaults: "2025-05-24",
  debug: import.meta.env.NODE_ENV === "development",
});

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <PostHogProvider client={posthog}>
      <App />
    </PostHogProvider>
  </React.StrictMode>,
);
