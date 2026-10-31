// @vitest-environment jsdom
import { act, cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import WebGamePage from "../../../../web/src/pages/game/[id]/index";
import MobileGamePage from "../../pages/game";

const state = vi.hoisted(() => ({
  router: { query: {} as Record<string, string>, isReady: true, push: vi.fn() },
  enter: () => {},
  leave: () => {},
  increment: vi.fn(),
}));
vi.mock("next/router", () => ({ useRouter: () => state.router }));
vi.mock("next/head", () => ({ default: () => null }));
vi.mock("../../../../web/src/components/general/OpenGraph", () => ({
  OpenGraph: () => null,
}));
vi.mock("../../components/general/AppPage.tsx", () => ({
  AppPage: () => null,
}));
vi.mock("@ionic/react", () => ({
  IonRefresher: () => null,
  IonRefresherContent: () => null,
  useIonViewWillEnter: (fn: () => void) => {
    state.enter = fn;
  },
  useIonViewWillLeave: (fn: () => void) => {
    state.leave = fn;
  },
}));
vi.mock("@mantine/core", () => {
  const C = () => null;
  return { Box: C, Container: C, Stack: C, Tabs: { Panel: C } };
});
vi.mock("@repo/locales", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("@repo/ui", () => {
  const C = () => null;
  return {
    DEFAULT_GAME_INFO_VIEW_DTO: {},
    GameExtraInfoView: C,
    GameInfoAchievementsScreen: C,
    GameInfoContentTitle: C,
    GameInfoPostsScreen: C,
    GameInfoReviewScreen: C,
    GameInfoTabs: C,
    GameInfoView: C,
    GameInfoTabValue: {
      overview: "overview",
      reviews: "reviews",
      discussion: "discussion",
      achievements: "achievements",
    },
    useGame: () => ({}),
    useUrlState: () => [{ tab: "overview" }, vi.fn()],
    useUserView: () => [0, false, state.increment],
    getSizedImageUrl: vi.fn(),
    ImageSize: {},
  };
});
vi.mock("@tanstack/react-query", async () => {
  const actual = await vi.importActual<typeof import("@tanstack/react-query")>(
    "@tanstack/react-query",
  );
  return { ...actual, useQueryClient: () => ({ invalidateQueries: vi.fn() }) };
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  state.increment.mockClear();
  state.router.query = {};
});

it("web creates a view per valid game navigation but not per tab or render", async () => {
  let count = 0;
  vi.spyOn(crypto, "randomUUID").mockImplementation(
    (() =>
      ("visit-" + ++count) as unknown as
        | string
        | Promise<string>) as unknown as typeof crypto.randomUUID,
  );
  state.router.query = { id: "1" };
  const page = render(<WebGamePage />);
  await waitFor(() => expect(state.increment).toHaveBeenCalledWith("visit-1"));
  state.router.query = { id: "1", tab: "reviews" };
  page.rerender(<WebGamePage />);
  expect(count).toBe(1);
  state.router.query = { id: "2" };
  page.rerender(<WebGamePage />);
  state.router.query = { id: "1" };
  page.rerender(<WebGamePage />);
  expect(count).toBe(3);
  state.router.query = { id: "invalid" };
  page.rerender(<WebGamePage />);
  expect(count).toBe(3);
});

it("mobile creates a new view for retained entries and changed IDs", () => {
  let count = 0;
  vi.spyOn(crypto, "randomUUID").mockImplementation(
    (() =>
      ("visit-" + ++count) as unknown as
        | string
        | Promise<string>) as unknown as typeof crypto.randomUUID,
  );
  const page = render(<MobileGamePage gameId={1} />);
  act(() => state.enter());
  expect(state.increment).toHaveBeenLastCalledWith("visit-1");
  page.rerender(<MobileGamePage gameId={1} />);
  expect(count).toBe(1);
  page.rerender(<MobileGamePage gameId={2} />);
  expect(state.increment).toHaveBeenLastCalledWith("visit-2");
  act(() => {
    state.leave();
    state.enter();
  });
  expect(state.increment).toHaveBeenLastCalledWith("visit-3");
});
