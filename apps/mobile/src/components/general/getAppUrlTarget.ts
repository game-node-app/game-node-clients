const APP_SCHEME = "app.gamenode:";

/**
 * Maps an `appUrlOpen` URL to an in-app route, or null when the URL needs no navigation.
 * `app.gamenode://<path>?error=…` is a failed native sign-in; `?cookie=` URLs are consumed by better-auth-capacitor.
 */
export function getAppUrlTarget(rawUrl: string): string | null {
  const url = new URL(rawUrl);
  if (isBrowserOAuthUrl(rawUrl)) return null;
  if (url.protocol !== APP_SCHEME) {
    return `${url.pathname}${url.search}${url.hash}`;
  }
  if (url.searchParams.has("cookie") || !url.searchParams.has("error")) {
    return null;
  }
  // In a custom scheme the first path segment parses as the host: app.gamenode://m/auth -> host "m", path "/auth".
  return `/${url.host}${url.pathname}${url.search}${url.hash}`;
}

/** OAuth uses the canonical browser session, even when Android intercepts an App Link. */
export function isBrowserOAuthUrl(rawUrl: string) {
  const url = new URL(rawUrl);
  const path = url.pathname
    .replace(/^\/(?:en|pt-BR)(?=\/)/, "")
    .replace(/\/$/, "");
  return (
    url.origin === "https://gamenode.app" &&
    (path === "/oauth/consent" ||
      (path === "/auth" &&
        (url.searchParams.has("sig") ||
          url.searchParams.has("ba_param") ||
          url.searchParams.has("client_id"))))
  );
}
