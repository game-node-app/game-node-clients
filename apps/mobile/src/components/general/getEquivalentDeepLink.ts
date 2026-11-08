import { getTabAwareHref } from "@/util/getTabAwareHref";

/** Tab roots registered by `Tabs.tsx`; routes live below one of these. */
const TAB_PREFIX = /^\/(?:home|library|explore|notifications|profile)(?=\/)/;

/**
 * Ionic only registers routes under a tab prefix (`/home/...`, `/library/...`).
 * `getAppUrlTarget` may return an already tab-prefixed route, but the app keeps
 * the user on the tab they are on, so a named tab is replaced by the current
 * one. Targets without a tab (e.g. `/game/12`) are nested under the current tab.
 */
export function getEquivalentDeepLink(slug: string) {
  if (slug.startsWith("/search")) {
    return "/home";
  }
  if (slug.startsWith("/m/auth")) {
    return slug;
  }

  return getTabAwareHref(slug.replace(TAB_PREFIX, ""));
}
