// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import React, { isValidElement } from "react";
import { matchPath } from "react-router";
import { afterEach, expect, it, vi } from "vitest";

type SupporterRouteProps = {
  exact?: boolean;
  path?: string;
  render: () => React.ReactElement;
};

afterEach(cleanup);

function routePath(route: React.ReactNode) {
  return isValidElement<{ path?: string }>(route)
    ? route.props.path
    : undefined;
}

/**
 * Mirrors `@ionic/react-router`'s `matchRoute`: it walks every outlet child and
 * keeps the **last** match, not the first. A catch-all route registered after
 * an exact one therefore wins, which is why `/preferences/supporter` must not
 * match `/preferences/:category`.
 */
function lastMatchingRoutePath(routes: React.ReactNode[], pathname: string) {
  let matchedPath: string | undefined;

  for (const route of routes) {
    if (!isValidElement<{ exact?: boolean; path?: string }>(route)) continue;

    const { exact, path } = route.props;
    if (!path) continue;

    if (matchPath(pathname, { path, exact })) matchedPath = path;
  }

  return matchedPath;
}

async function loadCommonRoutes() {
  for (const page of [
    "game",
    "profile/profile",
    "profile/stats",
    "profile/review_list",
    "feats",
    "auth",
    "importer/importer",
    "importer/source",
    "activity",
    "activity/detail",
    "posts.tsx",
    "blog",
    "blog/detail",
    "blog/archive.tsx",
    "collection_entry.tsx",
    "preferences.tsx",
    "search.tsx",
    "awards/vote.tsx",
    "awards/nominees.tsx",
    "library/library",
    "library/library_collections",
    "library/collection",
    "library/collection_reorder",
    "awards",
    "awards/result",
    "awards/nominations",
    "wrapped/wrapped_home",
    "recap/recap_stats",
    "recap/stories",
    "journal/journal_achievements",
    "journal/journal",
    "connection_callback",
    "daily/index",
    "daily/play",
    "daily/archive",
    "daily/ranking",
    "daily/weekly",
    "daily/practice",
    "guild",
    "mcp",
  ]) {
    vi.doMock(`@/pages/${page}`, () => ({ default: () => null }));
  }
  vi.doMock("@/pages/preferences_supporter", () => ({
    default: () => <div>preferences-supporter-page</div>,
  }));

  const { getCommonRoutes, getPreferencesCategoryPath, DAILY_MODE_PARAM } =
    await import("../../pages/routes/getCommonRoutes");

  return { getCommonRoutes, getPreferencesCategoryPath, DAILY_MODE_PARAM };
}

it.each(["/home", "/library"])(
  "registers an exact %s/preferences/supporter route that wins over the preferences category route",
  async (prefix) => {
    const { getCommonRoutes, getPreferencesCategoryPath } =
      await loadCommonRoutes();
    const routes = getCommonRoutes(prefix);

    const supporterPath = `${prefix}/preferences/supporter`;
    const categoryPath = getPreferencesCategoryPath(prefix);

    const supporterIndex = routes.findIndex(
      (candidate) => routePath(candidate) === supporterPath,
    );
    const categoryIndex = routes.findIndex(
      (candidate) => routePath(candidate) === categoryPath,
    );

    expect(supporterIndex).toBeGreaterThanOrEqual(0);
    expect(categoryIndex).toBeGreaterThanOrEqual(0);
    expect(supporterIndex).toBeLessThan(categoryIndex);

    const route = routes[
      supporterIndex
    ] as React.ReactElement<SupporterRouteProps>;
    expect(route.key).toBe(`${prefix}-preferences-supporter`);
    expect(route.props.exact).toBe(true);

    // Regression: Ionic keeps the last match, so the category route must not
    // match the supporter URL at all.
    expect(
      matchPath(supporterPath, { path: categoryPath, exact: true }),
    ).toBeNull();
    expect(lastMatchingRoutePath(routes, supporterPath)).toBe(supporterPath);

    // Real categories still reach the Preferences list.
    expect(
      matchPath(`${prefix}/preferences/connections`, {
        path: categoryPath,
        exact: true,
      }),
    ).not.toBeNull();
    expect(
      lastMatchingRoutePath(routes, `${prefix}/preferences/connections`),
    ).toBe(categoryPath);

    render(route.props.render());
    expect(screen.getByText("preferences-supporter-page")).toBeTruthy();

    cleanup();
  },
);

it.each(["/home", "/library"])(
  "does not register a standalone %s/supporter route",
  async (prefix) => {
    const { getCommonRoutes } = await loadCommonRoutes();

    expect(
      getCommonRoutes(prefix).some(
        (candidate) => routePath(candidate) === `${prefix}/supporter`,
      ),
    ).toBe(false);
  },
);

it.each(["/home", "/library"])(
  "routes %s/daily/ranking to the ranking, not the play page",
  async (prefix) => {
    const { getCommonRoutes, DAILY_MODE_PARAM } = await loadCommonRoutes();
    const routes = getCommonRoutes(prefix);
    const playPath = `${prefix}/daily/${DAILY_MODE_PARAM}`;

    expect(lastMatchingRoutePath(routes, `${prefix}/daily/ranking`)).toBe(
      `${prefix}/daily/ranking`,
    );
    expect(lastMatchingRoutePath(routes, `${prefix}/daily/ranking/`)).toBe(
      `${prefix}/daily/ranking`,
    );
    expect(lastMatchingRoutePath(routes, `${prefix}/daily/cover`)).toBe(
      playPath,
    );
    expect(lastMatchingRoutePath(routes, `${prefix}/daily/specs`)).toBe(
      playPath,
    );
    expect(lastMatchingRoutePath(routes, `${prefix}/daily/weekly`)).toBe(
      `${prefix}/daily/weekly`,
    );
    expect(
      lastMatchingRoutePath(routes, `${prefix}/daily/specs/practice`),
    ).toBe(`${prefix}/daily/${DAILY_MODE_PARAM}/practice`);
    expect(lastMatchingRoutePath(routes, `${prefix}/daily/cover/archive`)).toBe(
      `${prefix}/daily/${DAILY_MODE_PARAM}/archive`,
    );
  },
);
