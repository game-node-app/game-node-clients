export type SessionDeviceKind = "desktop" | "mobile" | "tablet";

export interface SessionDevice {
  kind: SessionDeviceKind;
  /** The GameNode mobile app (Capacitor WebView) rather than a browser. */
  isApp: boolean;
  browser?: string;
  os?: string;
}

const BROWSERS: [RegExp, string][] = [
  [/Edg(e|A|iOS)?\//, "Edge"],
  [/OPR\/|Opera/, "Opera"],
  [/SamsungBrowser\//, "Samsung Internet"],
  [/Firefox\/|FxiOS\//, "Firefox"],
  [/Chrome\/|CriOS\//, "Chrome"],
  [/Version\/[\d.]+.*Safari\//, "Safari"],
];

function getOs(ua: string): { os?: string; kind: SessionDeviceKind } {
  if (/iPad/.test(ua)) return { os: "iPad", kind: "tablet" };
  if (/iPhone|iPod/.test(ua)) return { os: "iPhone", kind: "mobile" };
  if (/Android/.test(ua)) {
    return { os: "Android", kind: /Mobile/.test(ua) ? "mobile" : "tablet" };
  }
  if (/Windows/.test(ua)) return { os: "Windows", kind: "desktop" };
  if (/CrOS/.test(ua)) return { os: "ChromeOS", kind: "desktop" };
  if (/Mac OS X|Macintosh/.test(ua)) return { os: "macOS", kind: "desktop" };
  if (/Linux/.test(ua)) return { os: "Linux", kind: "desktop" };
  return { kind: "desktop" };
}

/**
 * Tells the app apart from a browser: an explicit Capacitor/GameNode token,
 * the Android WebView marker (`; wv)`) or an iOS WebKit UA without `Safari/`.
 */
function isAppUserAgent(ua: string) {
  if (/Capacitor|GameNode/i.test(ua)) return true;
  if (/Android/.test(ua) && /;\s?wv\)/.test(ua)) return true;
  return (
    /iPhone|iPad|iPod/.test(ua) &&
    /AppleWebKit/.test(ua) &&
    !/Safari\//.test(ua)
  );
}

/** Small best-effort parser for the session list (browser + OS). */
export function parseSessionUserAgent(
  userAgent: string | null | undefined,
): SessionDevice {
  const ua = userAgent ?? "";
  const { os, kind } = getOs(ua);
  const isApp = ua.length > 0 && isAppUserAgent(ua);
  const browser = isApp
    ? undefined
    : BROWSERS.find(([pattern]) => pattern.test(ua))?.[1];

  return {
    kind: isApp && kind === "desktop" ? "mobile" : kind,
    isApp,
    browser,
    os,
  };
}
