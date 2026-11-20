// @vitest-environment jsdom
import React from "react";
import type { ReactNode } from "react";
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nProvider } from "@repo/locales";
import { Game } from "@repo/wrapper/server";
import type { GameExternalStoreDto } from "@repo/wrapper/server";
import { cleanup, render, screen } from "@testing-library/react";
import Autoplay from "embla-carousel-autoplay";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UIProvider } from "../../../../packages/ui/src/context/UIProvider";
import type { LinkComponentProps } from "../../../../packages/ui/src/util";
import { setProjectContext } from "../../../../packages/ui/src/util/projectContext";
import { XboxGameInfoView } from "../../../../packages/ui/src/theme/themes/xbox/screens/XboxGameInfoView";
import { setupDom } from "../components/mcp/testUtils";

const state = vi.hoisted(() => ({
  game: null as Game | null,
}));

vi.mock("../../../../packages/ui/src/components/auth/authClient", () => ({
  authClient: {
    useSession: () => ({
      data: { user: { id: "viewer" } },
      isPending: false,
    }),
  },
}));

vi.mock("../../../../packages/ui/src/components/game/hooks/useGame", () => ({
  useGame: () => ({ data: state.game, isLoading: false }),
}));

vi.mock(
  "../../../../packages/ui/src/components/review/hooks/useReviewsScore",
  () => ({
    useReviewsScore: () => ({
      data: {
        median: 4.5,
        distribution: { "1": 0, "2": 1, "3": 1, "4": 2, "5": 6, total: 10 },
      },
      isLoading: false,
    }),
  }),
);

vi.mock(
  "../../../../packages/ui/src/components/game/hooks/useGameExternalStores",
  () => ({
    useGameExternalStores: () => ({
      data: [
        {
          id: 1,
          storeName: "Steam",
          icon: "steam",
          url: "https://store.example/game",
        },
      ] as GameExternalStoreDto[],
      isLoading: false,
    }),
  }),
);

vi.mock(
  "../../../../packages/ui/src/components/game/hooks/useGamePlatformIcons",
  () => ({
    useGamePlatformIcons: () => ({ data: [], isLoading: false }),
  }),
);

vi.mock(
  "../../../../packages/ui/src/components/game/ttb/useTimeToBeat",
  () => ({
    useTimeToBeat: () => ({
      data: {
        main: 10800,
        mainPlusSides: 18000,
        completionist: 36000,
        submitCount: 3,
      },
      isLoading: false,
    }),
  }),
);

vi.mock(
  "../../../../packages/ui/src/components/collection/collection-entry/hooks/useOwnCollectionEntryForGameId",
  () => ({
    useOwnCollectionEntryForGameId: () => ({
      data: null,
      isError: false,
      isLoading: false,
    }),
  }),
);

vi.mock(
  "../../../../packages/ui/src/components/preferred-platform/hooks/usePreferredPlatforms",
  () => ({
    usePreferredPlatforms: () => ({ data: [] }),
  }),
);

vi.mock("embla-carousel-autoplay", () => ({
  default: vi.fn(() => ({
    name: "autoplay",
    options: {},
    init: vi.fn(),
    destroy: vi.fn(),
  })),
}));

const LinkPresenter = ({ href, children, ...rest }: LinkComponentProps) => (
  <a href={href} {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
    {children as ReactNode}
  </a>
);

const hooks = {
  useRouter: () => ({
    pathname: "/",
    back: vi.fn(),
    push: async () => {},
    query: new URLSearchParams(),
  }),
};

const wrapper = ({ children }: { children: ReactNode }) => (
  <I18nProvider language="en">
    <MantineProvider>
      <QueryClientProvider
        client={
          new QueryClient({
            defaultOptions: { queries: { retry: false, retryDelay: 0 } },
          })
        }
      >
        <UIProvider hooks={hooks} presenters={{ Link: LinkPresenter }}>
          {children}
        </UIProvider>
      </QueryClientProvider>
    </MantineProvider>
  </I18nProvider>
);

const game = (overrides: Partial<Game> = {}): Game =>
  ({
    id: 42,
    name: "Starfield",
    summary: "A space adventure.",
    source: Game.source.MYSQL,
    firstReleaseDate: "2023-09-06T00:00:00.000Z",
    cover: {
      url: "//images.igdb.com/igdb/image/upload/t_cover_big/co42.jpg",
    },
    artworks: [
      {
        url: "//images.igdb.com/igdb/image/upload/t_1080p/art42.jpg",
        width: 1920,
        height: 1080,
      },
    ],
    screenshots: [
      {
        url: "//images.igdb.com/igdb/image/upload/t_screenshot_huge/shot42.jpg",
      },
    ],
    genres: [{ id: 12, name: "Role-playing" }],
    themes: [],
    gameModes: [],
    platforms: [{ id: 6, name: "PC", abbreviation: "PC" }],
    involvedCompanies: [
      {
        developer: true,
        publisher: false,
        company: { name: "Bethesda Game Studios" },
      },
    ],
    ...overrides,
  }) as unknown as Game;

beforeEach(() => {
  setupDom();
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    },
  );
  setProjectContext({
    client: "mobile",
    s3BucketUrl: "https://cdn.example.com",
    serverUrl: "https://api.example.com",
    searchUrl: "https://search.example.com",
  });
  state.game = game();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("xbox game info view", () => {
  it("renders the shared library actions and the fact-sheet children", () => {
    render(<XboxGameInfoView id={42} />, { wrapper });

    expect(screen.getByRole("button", { name: "Add to library" })).toBeTruthy();
    expect(screen.getByText("A space adventure.")).toBeTruthy();
    expect(screen.getByText("Bethesda Game Studios")).toBeTruthy();
    expect(screen.getByAltText("Steam")).toBeTruthy();
    expect(screen.getByText("User Rating")).toBeTruthy();
    expect(screen.getAllByText("4.5").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText("Role-playing").length).toBeGreaterThanOrEqual(
      2,
    );
    expect(document.querySelector("[data-xbox-game-media]")).toBeTruthy();
    expect(
      document
        .querySelector("[data-xbox-game-media]")
        ?.getAttribute("data-autoplay"),
    ).toBe("on");
    expect(
      document
        .querySelector("[data-xbox-game-media]")
        ?.getAttribute("data-plugins"),
    ).toBe("1");
  });

  it("uses the artwork as the backdrop when one is available", () => {
    render(<XboxGameInfoView id={42} />, { wrapper });

    const art = document.querySelector(
      "[data-xbox-game-art]",
    ) as HTMLElement | null;
    expect(art?.style.backgroundImage).toContain("art42.jpg");
  });

  it("omits the strip without screenshots and falls back to the cover", () => {
    state.game = game({ artworks: [], screenshots: [] });

    render(<XboxGameInfoView id={42} />, { wrapper });

    expect(document.querySelector("[data-xbox-game-media]")).toBeNull();
    expect(
      document.querySelector("[data-has-art]")?.getAttribute("data-has-art"),
    ).toBe("true");

    const art = document.querySelector(
      "[data-xbox-game-art]",
    ) as HTMLElement | null;
    expect(art?.style.backgroundImage).toContain("co42.jpg");
    expect(document.querySelector('img[src*="co42.jpg"]')).toBeTruthy();
  });

  it("does not autoplay screenshots under reduced motion", () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(<XboxGameInfoView id={42} />, { wrapper });

    expect(
      document
        .querySelector("[data-xbox-game-media]")
        ?.getAttribute("data-autoplay"),
    ).toBe("off");
    expect(
      document
        .querySelector("[data-xbox-game-media]")
        ?.getAttribute("data-plugins"),
    ).toBe("0");
    // hover pauses the strip when it does run
    expect(vi.mocked(Autoplay)).toHaveBeenCalledWith(
      expect.objectContaining({ stopOnMouseEnter: true }),
    );
  });
});
