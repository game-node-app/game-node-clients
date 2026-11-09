// @vitest-environment jsdom
import { MantineProvider } from "@mantine/core";
import { cleanup, render, screen, within } from "@testing-library/react";
import { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SupporterFeatureCatalog } from "../../../../../packages/ui/src/components/supporter/settings/SupporterFeatureCatalog";

vi.mock("@repo/locales", () => ({
  useTranslation: () => ({
    t: (key: string, values?: { year?: number; count?: number }) =>
      values?.year !== undefined ? `${key}:${values.year}` : key,
  }),
  useI18nContext: () => ({ language: "en" }),
}));

const mocks = vi.hoisted(() => ({
  profile: {
    data: { username: "cassio", banner: null, avatar: null },
    isLoading: false,
  } as Record<string, unknown>,
}));

vi.mock(
  "../../../../../packages/ui/src/components/auth/hooks/useUserId",
  () => ({ useUserId: () => "user-1" }),
);

vi.mock(
  "../../../../../packages/ui/src/components/profile/hooks/useUserProfile",
  () => ({
    useUserProfile: () => mocks.profile,
  }),
);

vi.mock(
  "../../../../../packages/ui/src/components/follow/hooks/useInfiniteFollowInfo",
  () => ({
    useInfiniteFollowInfo: () => ({
      data: { pages: [{ pagination: { totalItems: 3 } }] },
    }),
  }),
);

vi.mock(
  "../../../../../packages/ui/src/components/collection/collection-entry/hooks/useFavoriteCollectionEntriesForUserId",
  () => ({
    useFavoriteCollectionEntriesForUserId: () => ({ data: { data: [] } }),
  }),
);

vi.mock(
  "../../../../../packages/ui/src/components/game/hooks/useGames",
  () => ({ useGames: () => ({ data: [] }) }),
);

function renderCatalog(ui: ReactElement) {
  return render(<MantineProvider>{ui}</MantineProvider>);
}

beforeEach(() => {
  mocks.profile = {
    data: { username: "cassio", banner: null, avatar: null },
    isLoading: false,
  };
  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  });
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

describe("SupporterFeatureCatalog", () => {
  it("shows every upcoming feature as Coming soon for a free user", () => {
    renderCatalog(
      <SupporterFeatureCatalog isSupporter={false} supporterSince={null} />,
    );

    expect(screen.getByText("supporter.features.descriptionFree")).toBeTruthy();
    expect(
      screen.queryByText("supporter.features.descriptionSupporter"),
    ).toBeNull();

    const catalog = screen.getByTestId("supporter-feature-catalog");

    expect(
      within(catalog).getAllByText("settings.badges.comingSoon"),
    ).toHaveLength(7);
    expect(
      within(catalog).getAllByText(/supporter\.benefits\.upcoming\./),
    ).toHaveLength(7);
    expect(
      within(catalog).getAllByText(/supporter\.features\..*\.description/),
    ).toHaveLength(7);
    expect(within(catalog).queryByText(/videoCover/)).toBeNull();
  });

  it("keeps every upcoming feature as Coming soon for supporters", () => {
    renderCatalog(
      <SupporterFeatureCatalog
        isSupporter
        supporterSince={"2023-05-10T00:00:00.000Z"}
      />,
    );

    expect(
      screen.getByText("supporter.features.descriptionSupporter"),
    ).toBeTruthy();
    expect(screen.queryByText("supporter.features.descriptionFree")).toBeNull();

    const catalog = screen.getByTestId("supporter-feature-catalog");

    expect(
      within(catalog).getAllByText("settings.badges.comingSoon"),
    ).toHaveLength(7);
    expect(
      screen.queryByText(/supporter\.features\.preview\.since/),
    ).not.toBeNull();
    expect(
      screen.getByText(/supporter\.features\.preview\.since:2023/),
    ).toBeTruthy();
  });

  it("renders grouped, non-interactive rows with no switch, checkbox or focus target", () => {
    renderCatalog(
      <SupporterFeatureCatalog isSupporter={false} supporterSince={null} />,
    );

    expect(screen.getByText("supporter.features.groups.profile")).toBeTruthy();
    expect(screen.getByText("supporter.features.groups.library")).toBeTruthy();
    expect(
      screen.getByText("supporter.features.groups.community"),
    ).toBeTruthy();

    const catalog = screen.getByTestId("supporter-feature-catalog");

    expect(within(catalog).queryAllByRole("switch")).toHaveLength(0);
    expect(within(catalog).queryAllByRole("checkbox")).toHaveLength(0);
    expect(within(catalog).queryAllByRole("button")).toHaveLength(0);
    expect(
      catalog.querySelectorAll(
        "button, a, input, select, textarea, [tabindex]",
      ),
    ).toHaveLength(0);
    // Violet premium tiles, one per feature row.
    expect(
      catalog.querySelectorAll(
        '[class*="size-9"][class*="rgba(151,71,255,0.16)"]',
      ),
    ).toHaveLength(7);
  });

  it("labels the preview body as decorative and keeps the caption readable", () => {
    renderCatalog(
      <SupporterFeatureCatalog isSupporter={false} supporterSince={null} />,
    );

    expect(screen.getByText("supporter.features.preview.caption")).toBeTruthy();

    const preview = screen.getByTestId("supporter-profile-preview");

    expect(preview.getAttribute("aria-hidden")).toBe("true");
    expect(screen.getByText("supporter.features.preview.badge")).toBeTruthy();
  });

  it("does not show a since line when the server returns null", () => {
    renderCatalog(
      <SupporterFeatureCatalog isSupporter={false} supporterSince={null} />,
    );

    expect(
      screen.queryByText(/supporter\.features\.preview\.since/),
    ).toBeNull();
  });

  it("shows the username skeleton only while loading and hides it on error", () => {
    mocks.profile = { data: undefined, isLoading: true };

    renderCatalog(
      <SupporterFeatureCatalog isSupporter={false} supporterSince={null} />,
    );

    expect(
      screen.getByTestId("supporter-preview-username-loading"),
    ).toBeTruthy();

    cleanup();

    // e.g. GET /profiles/:id answered 404: no data will ever arrive.
    mocks.profile = {
      data: undefined,
      isLoading: false,
      isError: true,
      error: { code: 404 },
    };
    renderCatalog(
      <SupporterFeatureCatalog isSupporter={false} supporterSince={null} />,
    );

    expect(
      screen.queryByTestId("supporter-preview-username-loading"),
    ).toBeNull();
    expect(screen.getByText("supporter.features.preview.badge")).toBeTruthy();
    expect(screen.queryByText("cassio")).toBeNull();
  });
});
