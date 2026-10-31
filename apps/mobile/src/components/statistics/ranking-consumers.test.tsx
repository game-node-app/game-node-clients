// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { GameInfoReviewList } from "../../../../../packages/ui/src/components/game/info/review/GameInfoReviewList";
import { TrendingGamesList } from "../../../../../packages/ui/src/components/game/trending/TrendingGamesList";
import { TrendingReviewCarousel } from "../../../../../packages/ui/src/components/review/trending/TrendingReviewCarousel";

const state = vi.hoisted(() => ({
  gameItems: [2, 1] as number[],
  reviewItems: ["pinned", "other"] as string[],
  reviewsArgs: vi.fn(),
  gameArgs: vi.fn(),
  rankingArgs: vi.fn(),
}));
vi.mock("@repo/locales", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("@mantine/core", async () => {
  const React = await import("react");
  const actual =
    await vi.importActual<typeof import("@mantine/core")>("@mantine/core");
  const C = ({ children }: import("react").PropsWithChildren) =>
    React.createElement("div", null, children);
  return {
    ...actual,
    SimpleGrid: C,
    Skeleton: C,
    Group: C,
    Stack: C,
    Pagination: ({
      total,
      onChange,
    }: {
      total: number;
      onChange: (page: number) => void;
    }) =>
      React.createElement(
        "button",
        { onClick: () => onChange(2) },
        String(total),
      ),
  };
});
vi.mock("@mantine/carousel", async () => {
  const React = await import("react");
  const C = ({ children }: import("react").PropsWithChildren) =>
    React.createElement("div", null, children);
  C.Slide = C;
  return { Carousel: C };
});
vi.mock(
  "../../../../../packages/ui/src/components/general/DetailsBox",
  async () => {
    const React = await import("react");
    return {
      DetailsBox: ({
        children,
        enabled = true,
      }: import("react").PropsWithChildren<{ enabled?: boolean }>) =>
        enabled ? React.createElement("div", null, children) : null,
    };
  },
);
vi.mock(
  "../../../../../packages/ui/src/components/game/figure/GameGridItem",
  async () => {
    const React = await import("react");
    return {
      GameGridItem: ({ game }: { game: import("@repo/wrapper/server").Game }) =>
        React.createElement("span", null, game.name),
    };
  },
);
vi.mock(
  "../../../../../packages/ui/src/components/general/card/TrendingReviewCard",
  async () => {
    const React = await import("react");
    return {
      TrendingReviewCard: ({ reviewId }: { reviewId: string }) =>
        React.createElement("span", null, reviewId),
    };
  },
);
vi.mock(
  "../../../../../packages/ui/src/components/general/hooks/useOnMobile",
  () => ({ useOnMobile: () => false }),
);
vi.mock(
  "../../../../../packages/ui/src/components/auth/hooks/useUserId",
  () => ({ useUserId: () => "actor" }),
);
vi.mock(
  "../../../../../packages/ui/src/components/statistics/hooks/useTrendingGames",
  () => ({
    useTrendingGames: () => ({
      data: { items: state.gameItems.map((sourceId) => ({ sourceId })) },
      isLoading: false,
    }),
  }),
);
vi.mock(
  "../../../../../packages/ui/src/components/statistics/hooks/useTrendingReviews",
  () => ({
    useTrendingReviews: (
      dto: Parameters<typeof import("@repo/ui").useTrendingReviews>[0],
    ) => {
      state.rankingArgs(dto);
      return {
        data: {
          items: state.reviewItems.map((sourceId) => ({ sourceId })),
          pagination: {
            total: 20000,
            limit: 7,
            offset: dto.offset,
            hasNextPage: true,
          },
        },
        isLoading: false,
      };
    },
  }),
);
vi.mock(
  "../../../../../packages/ui/src/components/game/hooks/useGames",
  () => ({
    useGames: (dto: Parameters<typeof import("@repo/ui").useGames>[0]) => {
      state.gameArgs(dto);
      return {
        data: dto.gameIds?.length
          ? [
              { id: 1, name: "first" },
              { id: 2, name: "second" },
            ]
          : [],
        isLoading: false,
      };
    },
  }),
);
vi.mock(
  "../../../../../packages/ui/src/components/review/hooks/useReviews",
  () => ({
    useReviews: (ids: Parameters<typeof import("@repo/ui").useReviews>[0]) => {
      state.reviewsArgs(ids);
      return {
        data: ids ? [{ id: "other" }, { id: "pinned" }] : [],
        isLoading: false,
      };
    },
  }),
);
vi.mock("../../../../../packages/ui/src/components/index", async () => {
  const React = await import("react");
  return {
    CenteredErrorMessage: ({ message }: { message: string }) =>
      React.createElement("span", null, message),
    CenteredLoading: () => null,
    ReviewListItem: ({
      review,
    }: {
      review: import("@repo/wrapper/server").Review;
    }) => React.createElement("span", null, review.id),
    ReviewListItemModal: () => null,
  };
});
afterEach(() => {
  cleanup();
  state.gameItems = [2, 1];
  state.reviewItems = ["pinned", "other"];
  state.reviewsArgs.mockClear();
  state.gameArgs.mockClear();
  state.rankingArgs.mockClear();
});

it("renders home games and reviews in ranking order and hides an empty ranking", () => {
  const games = render(<TrendingGamesList />);
  expect(games.container.textContent).toBe("secondfirst");
  games.unmount();
  const reviews = render(<TrendingReviewCarousel />);
  expect(reviews.container.textContent).toBe("pinnedother");
  reviews.unmount();
  state.gameItems = [];
  const empty = render(<TrendingGamesList />);
  expect(empty.container.textContent).toBe("");
  expect(state.gameArgs).toHaveBeenLastCalledWith(
    expect.objectContaining({ gameIds: [] }),
  );
});

it("keeps eligible pins in order, respects exclusion and bounds numbered pages", () => {
  const page = render(
    <GameInfoReviewList gameId={5} targetReviewId="pinned" />,
  );
  expect(page.container.textContent).toContain("pinnedother");
  expect(state.rankingArgs).toHaveBeenLastCalledWith(
    expect.objectContaining({
      gameId: 5,
      reviewId: "pinned",
      excludeOwn: true,
      period: "all",
      offset: 0,
    }),
  );
  fireEvent.click(screen.getByText("1429"));
  expect(state.rankingArgs).toHaveBeenLastCalledWith(
    expect.objectContaining({ offset: 7 }),
  );
  state.reviewItems = ["other"];
  page.rerender(<GameInfoReviewList gameId={6} targetReviewId="pinned" />);
  expect(state.rankingArgs).toHaveBeenLastCalledWith(
    expect.objectContaining({ gameId: 6, offset: 0 }),
  );
  expect(page.container.textContent).not.toContain("pinned");
  state.reviewItems = [];
  page.rerender(<GameInfoReviewList gameId={6} />);
  expect(state.reviewsArgs).toHaveBeenLastCalledWith(undefined);
});
