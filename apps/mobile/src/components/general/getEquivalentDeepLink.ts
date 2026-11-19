import {
  getTabAwareHref,
  LEGACY_WRAPPED_PATH,
  MOBILE_TABS,
  WRAPPED_TAB_PATH,
} from "@/util/getTabAwareHref";
import { matchPath } from "react-router-dom";

const TAB_PREFIX = new RegExp(`^/(?:${MOBILE_TABS.join("|")})(?=/)`);

/**
 * Open shared routes in the current tab. Wrapped links from widgets and the
 * website address the dedicated Wrapped tab.
 */
export function getEquivalentDeepLink(slug: string) {
  if (slug.startsWith("/search")) {
    return "/home";
  }
  if (slug.startsWith("/m/auth")) {
    return slug;
  }

  const pathname = slug.split(/[?#]/, 1)[0];
  if (matchPath(pathname, { path: LEGACY_WRAPPED_PATH, exact: true })) {
    return WRAPPED_TAB_PATH + slug.slice(pathname.length);
  }
  if (
    pathname === WRAPPED_TAB_PATH ||
    pathname.startsWith(`${WRAPPED_TAB_PATH}/`)
  ) {
    return slug;
  }

  return getTabAwareHref(slug.replace(TAB_PREFIX, ""));
}
