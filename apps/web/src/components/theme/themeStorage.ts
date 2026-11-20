import {
  getThemeCatalogEntry,
  isThemeId,
  type ThemeId,
  type ThemeStorage,
} from "@repo/ui";

/**
 * Web theme persistence (design decision 5).
 *
 * The choice is per device and never sent to GameNode's API:
 *
 * - `gn-theme` cookie: host-only (no `Domain`), `Path=/`, `SameSite=Lax`,
 *   one year, not `HttpOnly` so the inline head script can read it before the
 *   first paint. `_document` reads the same cookie on the server.
 * - `gn-theme` localStorage entry: mirror written by the same adapter. It is
 *   only consulted when the cookie is missing or does not name a catalog
 *   theme (for example the browser blocked cookies or the user cleared one
 *   store), so the cookie stays the source of truth the server can also read.
 *
 * Invalid or removed ids never throw: reads return `null` and the provider
 * falls back to `gamenode` (the generated catalog default). Invalid values are
 * not rewritten until the user picks a theme again.
 */
export const GN_THEME_COOKIE = "gn-theme";
export const GN_THEME_STORAGE_KEY = "gn-theme";
export const GN_THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export type ThemeRequestLike = {
  cookies?: Record<string, string | undefined>;
  headers?: { cookie?: string };
};

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

/** Parses a `Cookie` header without depending on a cookie library. */
export function parseCookieHeader(
  header: string | null | undefined,
): Record<string, string> {
  if (!header) return {};

  const cookies: Record<string, string> = {};
  for (const part of header.split(";")) {
    const separator = part.indexOf("=");
    if (separator < 0) continue;

    const name = part.slice(0, separator).trim();
    if (!name) continue;

    const rawValue = part.slice(separator + 1).trim();
    try {
      cookies[name] = decodeURIComponent(rawValue);
    } catch {
      cookies[name] = rawValue;
    }
  }

  return cookies;
}

/** Theme id from an explicit cookie map or a raw request header. */
export function readRequestThemeId(
  request: ThemeRequestLike | null | undefined,
): ThemeId {
  const raw =
    request?.cookies?.[GN_THEME_COOKIE] ??
    parseCookieHeader(request?.headers?.cookie)[GN_THEME_COOKIE];

  return getThemeCatalogEntry(raw).id;
}

function readCookieThemeId(): ThemeId | null {
  if (!isBrowser()) return null;

  const value = parseCookieHeader(document.cookie)[GN_THEME_COOKIE];
  return isThemeId(value) ? value : null;
}

function readMirrorThemeId(): ThemeId | null {
  if (!isBrowser()) return null;

  try {
    const value = window.localStorage.getItem(GN_THEME_STORAGE_KEY);
    return isThemeId(value) ? value : null;
  } catch {
    return null;
  }
}

/** Valid stored id, cookie first and localStorage as the fallback. */
export function readStoredThemeId(): ThemeId | null {
  return readCookieThemeId() ?? readMirrorThemeId();
}

function writeCookieThemeId(themeId: ThemeId): void {
  if (!isBrowser()) return;

  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${GN_THEME_COOKIE}=${encodeURIComponent(
    themeId,
  )}; Path=/; Max-Age=${GN_THEME_COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
}

function writeMirrorThemeId(themeId: ThemeId): void {
  if (!isBrowser()) return;

  try {
    window.localStorage.setItem(GN_THEME_STORAGE_KEY, themeId);
  } catch {
    // Storage can be unavailable (private mode, quota); the cookie still works.
  }
}

/** Injected through `UIHookRegistry.themeStorage` in `_app`. */
export const webThemeStorage: ThemeStorage = {
  get() {
    return readStoredThemeId();
  },
  set(themeId) {
    if (!isBrowser()) return;

    const resolved = getThemeCatalogEntry(themeId).id;
    writeCookieThemeId(resolved);
    writeMirrorThemeId(resolved);
  },
};
