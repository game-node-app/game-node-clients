import posthog from "posthog-js";

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  ui_host: "https://app.posthog.com",
  defaults: "2025-05-24",
  debug: process.env.NODE_ENV === "development",
});
