const APP_SCHEME = "app.gamenode:";

/**
 * Maps an `appUrlOpen` URL to an in-app route, or null when the URL needs no navigation.
 * `app.gamenode://<path>?error=…` is a failed native sign-in; `?cookie=` URLs are consumed by better-auth-capacitor.
 */
export function getAppUrlTarget(rawUrl: string): string | null {
  const url = new URL(rawUrl);
  if (url.protocol !== APP_SCHEME) {
    return `${url.pathname}${url.search}${url.hash}`;
  }
  if (url.searchParams.has("cookie") || !url.searchParams.has("error")) {
    return null;
  }
  // In a custom scheme the first path segment parses as the host: app.gamenode://m/auth -> host "m", path "/auth".
  return `/${url.host}${url.pathname}${url.search}${url.hash}`;
}
