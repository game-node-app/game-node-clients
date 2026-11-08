import { ApiError } from "@repo/wrapper/server";
import type { SupporterErrorKind } from "../types";

/**
 * Maps a billing failure to the state the supporter UI must render. Billing
 * errors stay inline on the supporter surface, so this is the shared mapping
 * used by the views and tests instead of matching `ApiError` inline.
 */
export function getSupporterErrorKind(error: unknown): SupporterErrorKind {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 401:
        return "unauthorized";
      case 404:
        return "notFound";
      case 409:
        return "conflict";
      case 503:
        return "unavailable";
      // The wrapper has no response to attach when the request never reached
      // the server; some fetch polyfills surface that as status 0.
      case 0:
        return "network";
      default:
        return "unknown";
    }
  }

  // `fetch` rejects with a TypeError when the request fails without a response.
  if (error instanceof TypeError) return "network";

  return "unknown";
}
