// Visual order of the mobile tab bar.
export const MOBILE_TABS = [
  "library",
  "explore",
  "home",
  "notifications",
  "profile",
];

/**
 * Retrieves a route with the current tab prefix appended to it.
 * Falls back to the home tab when the current URL is not inside a tab
 * (e.g. the not-found page rendered for an unknown path).
 * @param targetUrl
 */
export function getTabAwareHref(targetUrl: string): string {
  const pathname = window.location.pathname;
  const paths = pathname.split("/");
  const tab = MOBILE_TABS.includes(paths[1]) ? paths[1] : "home";
  const normalizedTarget = targetUrl.startsWith("/")
    ? targetUrl
    : `/${targetUrl}`;
  return `/${tab}${normalizedTarget}`;
}
