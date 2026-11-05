import { useRouter } from "#@/util";
import {
  isSettingsTab,
  SettingsTab,
} from "#@/components/settings/settingsTabs";

export const SETTINGS_QUERY_PARAM = "settings";
export const SETTINGS_SECTION_QUERY_PARAM = "section";

function buildHref(pathname: string, query: URLSearchParams) {
  const search = query.toString();
  return search ? `${pathname}?${search}` : pathname;
}

/**
 * The settings modal lives in the URL (`?settings=<tab>&section=<id>`), so it
 * can be deep linked, survives OAuth/locale round-trips and closes on "back".
 */
export function useSettingsModalState() {
  const router = useRouter();
  const rawTab = router.query.get(SETTINGS_QUERY_PARAM);
  const tab: SettingsTab | null = isSettingsTab(rawTab) ? rawTab : null;
  const section = router.query.get(SETTINGS_SECTION_QUERY_PARAM);

  const navigate = (
    next: { tab: SettingsTab | null; section?: string | null },
    replace: boolean,
  ) => {
    const query = new URLSearchParams(router.query.toString());
    query.delete(SETTINGS_QUERY_PARAM);
    query.delete(SETTINGS_SECTION_QUERY_PARAM);
    if (next.tab) {
      query.set(SETTINGS_QUERY_PARAM, next.tab);
      if (next.section) {
        query.set(SETTINGS_SECTION_QUERY_PARAM, next.section);
      }
    }

    void router.push(buildHref(router.pathname, query), {
      replace,
      shallow: true,
      scroll: false,
    });
  };

  return {
    opened: tab !== null,
    tab,
    section,
    /** Opens the modal (pushes a history entry, so "back" closes it). */
    open: (nextTab: SettingsTab, nextSection?: string) =>
      navigate({ tab: nextTab, section: nextSection }, false),
    /** Switches tab/section while open, without stacking history entries. */
    select: (nextTab: SettingsTab, nextSection?: string) =>
      navigate({ tab: nextTab, section: nextSection }, true),
    close: () => navigate({ tab: null }, true),
  };
}
