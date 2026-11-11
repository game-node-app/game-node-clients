// @vitest-environment jsdom
import type { ReactNode } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { createMemoryHistory } from "history";
import { IonReactMemoryRouter } from "@ionic/react-router";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { setupDom } from "@/components/mcp/testUtils";

/**
 * Every page is stubbed so the test exercises the real route table
 * (`Tabs` + `getCommonRoutes`) without pulling in their data layers.
 * `not_found` itself is not stubbed: it renders through `AppPage`, and only
 * the shared view is replaced with a marker.
 */
vi.mock("@repo/locales", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@repo/ui", () => ({
  NotFoundView: ({
    homeHref,
    searchHref,
  }: {
    homeHref?: string;
    searchHref: string;
  }) => <div>{`not-found-view:${homeHref}:${searchHref}`}</div>,
}));

vi.mock("@/components/general/AppPage.tsx", () => ({
  AppPage: ({ title, children }: { title?: string; children?: ReactNode }) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  ),
}));

vi.mock("@/components/sidebar/MobileSidebarMenu.tsx", () => ({
  MobileSidebarMenu: () => null,
}));

const PAGE_MODULES = [
  "explore",
  "home",
  "library/library",
  "notifications",
  "profile/profile",
  "search.tsx",
  "auth",
  "mcp",
  "game",
  "profile/stats",
  "profile/review_list",
  "feats",
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
  "preferences_supporter",
  "awards/vote.tsx",
  "awards/nominees.tsx",
  "library/library_collections",
  "library/collection",
  "library/collection_reorder",
  "awards",
  "awards/result",
  "recap/recap_stats",
  "journal/journal_achievements",
  "journal/journal",
  "connection_callback",
  "daily",
  "daily/play",
  "daily/archive",
];

const NOT_FOUND_TEXT = "not-found-view:/:/search";

async function renderAt(path: string) {
  const { default: Tabs } = await import("../Tabs");
  const history = createMemoryHistory({ initialEntries: [path] });

  return render(
    <IonReactMemoryRouter history={history}>
      <Tabs />
    </IonReactMemoryRouter>,
  );
}

beforeEach(() => {
  setupDom();
});

beforeAll(() => {
  for (const page of PAGE_MODULES) {
    vi.doMock(`@/pages/${page}`, () => {
      const Page = () => <div>{`page:${page}`}</div>;
      // A few common routes import named page exports instead of defaults.
      return {
        default: Page,
        PostsPage: Page,
        BlogPostsPage: Page,
        BlogPostDetailPage: Page,
        BlogPostsArchivePage: Page,
      };
    });
  }
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("mobile not-found route", () => {
  it("renders the not-found page for an unknown path", async () => {
    await renderAt("/this-does-not-exist");

    expect(screen.getByText(NOT_FOUND_TEXT)).toBeTruthy();
    expect(screen.getByText("notFoundPage.title")).toBeTruthy();
    expect(screen.queryByText(/^page:/)).toBeNull();
  });

  it("does not render the not-found page for a known tab route", async () => {
    await renderAt("/home");

    expect(screen.getByText("page:home")).toBeTruthy();
    expect(screen.queryByText(NOT_FOUND_TEXT)).toBeNull();
  });

  it("does not render the not-found page for a common nested route", async () => {
    await renderAt("/home/preferences");

    expect(screen.getByText("page:preferences.tsx")).toBeTruthy();
    expect(screen.queryByText(NOT_FOUND_TEXT)).toBeNull();
  });

  it("does not render the not-found page for a parameterized common route", async () => {
    await renderAt("/home/game/12");

    expect(screen.getByText("page:game")).toBeTruthy();
    expect(screen.queryByText(NOT_FOUND_TEXT)).toBeNull();
  });

  it("does not render the not-found page for a top-level route outside the tabs", async () => {
    await renderAt("/m/auth");

    expect(screen.getByText("page:auth")).toBeTruthy();
    expect(screen.queryByText(NOT_FOUND_TEXT)).toBeNull();
  });
});
