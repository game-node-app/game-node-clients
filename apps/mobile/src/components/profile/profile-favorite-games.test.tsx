// @vitest-environment jsdom
import { MantineProvider } from "@mantine/core";
import { cleanup, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Game } from "@repo/wrapper/server";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { ProfileFavoriteGames } from "../../../../../packages/ui/src/components/profile/view/ProfileFavoriteGames";
import { UIProvider } from "../../../../../packages/ui/src/context/UIProvider";
import { LinkComponentProps } from "../../../../../packages/ui/src/util/link";

vi.mock(
  "../../../../../packages/ui/src/components/auth/hooks/useUserId",
  () => ({ useUserId: () => "u1" }),
);

vi.mock("@repo/locales", () => ({
  useI18nContext: () => ({ language: "en" }),
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock(
  "../../../../../packages/ui/src/components/collection/collection-entry/hooks/useFavoriteCollectionEntriesForUserId",
  () => ({
    useFavoriteCollectionEntriesForUserId: () => ({
      data: {
        data: [{ gameId: 1, visibility: "public" }],
      },
      isLoading: false,
      isError: false,
    }),
  }),
);

const coverUrl = "https://images.igdb.com/igdb/image/upload/t_thumb/cover.jpg";

vi.mock(
  "../../../../../packages/ui/src/components/game/hooks/useGames",
  () => ({
    useGames: () => ({
      data: [
        {
          id: 1,
          name: "Favorite game",
          source: Game.source.MYSQL,
          cover: { url: coverUrl },
        } as unknown as Game,
      ],
      isLoading: false,
      isError: false,
    }),
  }),
);

const PresenterLink = ({ href, children, ...rest }: LinkComponentProps) => (
  <a href={href} {...rest}>
    {children}
  </a>
);

beforeEach(() => {
  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it("requests the 2x cover for the large favorite tiles", () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  render(
    <QueryClientProvider client={client}>
      <UIProvider
        presenters={{ Link: PresenterLink }}
        hooks={{
          useRouter: () => ({
            pathname: "",
            back: () => {},
            push: async () => {},
            query: new URLSearchParams(),
          }),
        }}
      >
        <MantineProvider>
          <ProfileFavoriteGames userId="u1" />
        </MantineProvider>
      </UIProvider>
    </QueryClientProvider>,
  );

  const image = screen.getByAltText("Favorite game");

  expect(image.getAttribute("src")).toBe(
    "https://images.igdb.com/igdb/image/upload/t_cover_big_2x/cover.jpg",
  );
});
