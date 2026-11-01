import type { CaptureResult } from "posthog-js";
import posthog from "posthog-js";

export function isPrivateAuthUrl(value: string) {
  try {
    const url = new URL(value, "https://local.invalid");
    return (
      /\/(?:auth|oauth\/consent)\/?$/.test(url.pathname) ||
      [
        "sig",
        "oauth_query",
        "access_token",
        "refresh_token",
        "id_token",
        "code",
        "cookie",
      ].some(
        (key) =>
          url.searchParams.has(key) ||
          new URLSearchParams(url.hash.slice(1)).has(key),
      )
    );
  } catch {
    return false;
  }
}

function scrubAuthUrls(value: unknown): unknown {
  if (typeof value === "string" && isPrivateAuthUrl(value))
    return "[authorization URL removed]";
  if (Array.isArray(value)) return value.map(scrubAuthUrls);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        /^(sig|oauth_query|ba_param|state|code|code_challenge|access_token|refresh_token|id_token|cookie)$/i.test(
          key,
        )
          ? "[removed]"
          : scrubAuthUrls(item),
      ]),
    );
  }
  return value;
}

export function beforeOAuthCapture(
  event: CaptureResult | null,
): CaptureResult | null {
  if (
    !event ||
    (typeof window !== "undefined" && isPrivateAuthUrl(window.location.href)) ||
    (typeof event.properties?.$current_url === "string" &&
      isPrivateAuthUrl(event.properties.$current_url))
  )
    return null;
  return {
    ...event,
    properties: scrubAuthUrls(event.properties) as CaptureResult["properties"],
  };
}

/** Called at routeChangeStart, before the private page or its query can be recorded. */
export function protectOAuthPage(url: string) {
  const privatePage = isPrivateAuthUrl(url);
  posthog.set_config({
    autocapture: !privatePage,
    disable_session_recording: privatePage,
  });
  if (privatePage) posthog.stopSessionRecording();
}
