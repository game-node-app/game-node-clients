const APP_SCHEME = "app.gamenode:";
/** The website may prefix routes with its locale; the app has no localized paths. */
const LOCALIZED_PATH_PREFIX = /^\/(?:en|pt-BR)(?=\/)/;
/**
 * The supporter surface lives in the app's Preferences, never on a standalone
 * page. Ionic routes only exist under a tab prefix, so this is the real
 * `/home/...` route rather than the tab-relative `/preferences/supporter`.
 */
const SUPPORTER_SETTINGS_PATH = "/home/preferences/supporter";

/**
 * Maps an `appUrlOpen` URL to an in-app route, or null when the URL needs no navigation.
 * `app.gamenode://<path>?error=…` is a failed native sign-in; `?cookie=` URLs are consumed by better-auth-capacitor.
 */
export function getAppUrlTarget(rawUrl: string): string | null {
  const url = new URL(rawUrl);
  if (isBrowserOAuthUrl(rawUrl)) return null;
  if (url.protocol !== APP_SCHEME) {
    const pathname = stripLocalePrefix(url.pathname);
    const supporterSettings = getSupporterSettingsTarget(pathname, url);
    if (supporterSettings) return supporterSettings;

    return `${pathname}${url.search}${url.hash}`;
  }
  if (url.searchParams.has("cookie") || !url.searchParams.has("error")) {
    return null;
  }
  // In a custom scheme the first path segment parses as the host: app.gamenode://m/auth -> host "m", path "/auth".
  return `/${url.host}${url.pathname}${url.search}${url.hash}`;
}

/**
 * Stripe returns to `/home?settings=premium[&checkout=success|cancel]`. The app
 * has no home-page settings modal, so it opens the Preferences Supporter
 * screen instead, keeping every query value except `settings`/`section`. The
 * result is a real tab-prefixed route (`/home/preferences/supporter`), because
 * Ionic only registers routes under a tab. Other `settings` tabs fall through
 * unchanged.
 */
function getSupporterSettingsTarget(pathname: string, url: URL): string | null {
  if (pathname.replace(/\/$/, "") !== "/home") return null;
  if (url.searchParams.get("settings") !== "premium") return null;

  const params = new URLSearchParams();
  for (const [key, value] of url.searchParams) {
    if (key === "settings" || key === "section") continue;
    params.append(key, value);
  }

  const search = params.toString();

  return `${SUPPORTER_SETTINGS_PATH}${search ? `?${search}` : ""}${url.hash}`;
}

/** OAuth uses the canonical browser session, even when Android intercepts an App Link. */
export function isBrowserOAuthUrl(rawUrl: string) {
  const url = new URL(rawUrl);
  const path = stripLocalePrefix(url.pathname).replace(/\/$/, "");
  return (
    url.origin === "https://gamenode.app" &&
    (path === "/oauth/consent" ||
      (path === "/auth" &&
        (url.searchParams.has("sig") ||
          url.searchParams.has("ba_param") ||
          url.searchParams.has("client_id"))))
  );
}

function stripLocalePrefix(pathname: string) {
  return pathname.replace(LOCALIZED_PATH_PREFIX, "");
}
