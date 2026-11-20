// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import type { Game } from "@repo/wrapper/server";
import { TrendingGamesHero } from "../../../../../packages/ui/src/components/game/trending/TrendingGamesHero";

let thumbsWidth = 0;

vi.mock("@repo/locales", () => ({
  useTranslation: () => ({
    t: (key: string, o?: Record<string, unknown>) =>
      o ? `${key}:${Object.values(o).join(",")}` : key,
  }),
}));
vi.mock("@mantine/hooks", () => ({
  useElementSize: () => ({ ref: () => {}, width: thumbsWidth }),
  useReducedMotion: () => false,
  useIntersection: () => ({ ref: () => {}, entry: undefined }),
}));
vi.mock("../../../../../packages/ui/src/util", () => ({
  RATING_STAR_COLOR: "#F5C518",
  Link: ({ children, ...props }: Record<string, never>) => (
    <a {...props}>{children}</a>
  ),
}));
vi.mock(
  "../../../../../packages/ui/src/components/game/hooks/useGameCoverImage",
  () => ({ useGameCoverImage: () => ({ src: "/c.jpg", onError: () => {} }) }),
);

const game = (id: number, name: string): Game =>
  ({
    id,
    name,
    summary: `${name} summary`,
    genres: [{ name: "RPG" }],
    videos: [],
    artworks: [],
  }) as unknown as Game;
const games = [game(1, "One"), game(2, "Two"), game(3, "Three")];

afterEach(() => {
  cleanup();
  thumbsWidth = 0;
  vi.restoreAllMocks();
});

/** jsdom has no real focus-visible heuristics: decide it per test. */
const mockFocusVisible = (value: boolean) => {
  const original = Element.prototype.matches;
  vi.spyOn(Element.prototype, "matches").mockImplementation(function (
    this: Element,
    selector: string,
  ) {
    return selector === ":focus-visible"
      ? value
      : original.call(this, selector);
  });
};

it("features the first game and switches on thumbnail press", () => {
  render(<TrendingGamesHero games={games} />);
  expect(screen.getByRole("heading").textContent).toBe("One");
  fireEvent.click(screen.getByLabelText("home.trendingSelectGame:Three"));
  expect(screen.getByRole("heading").textContent).toBe("Three");
});

it("advances to the next game when the 10s progress ends and wraps around", () => {
  const { container } = render(<TrendingGamesHero games={games} />);
  const advance = () =>
    fireEvent.animationEnd(
      container.querySelector('[aria-current="true"] span:last-child span')!,
    );
  advance();
  expect(screen.getByRole("heading").textContent).toBe("Two");
  advance();
  advance();
  expect(screen.getByRole("heading").textContent).toBe("One");
});

const fillOf = (container: HTMLElement) =>
  container.querySelector<HTMLElement>(
    '[aria-current="true"] span:last-child span',
  )!;

it("fits ranked thumbnails to the row width and rotates through the visible games", () => {
  const rankedGames = Array.from({ length: 15 }, (_, index) =>
    game(index + 1, `Game ${index + 1}`),
  );
  thumbsWidth = 1300;
  const { container, rerender } = render(
    <TrendingGamesHero games={rankedGames} responsive />,
  );
  expect(screen.getAllByLabelText(/home\.trendingSelectGame/)).toHaveLength(15);
  fireEvent.click(screen.getByLabelText("home.trendingSelectGame:Game 15"));

  thumbsWidth = 850;
  rerender(<TrendingGamesHero games={rankedGames} responsive />);
  expect(screen.getAllByLabelText(/home\.trendingSelectGame/)).toHaveLength(10);
  expect(screen.getByText("home.trendingRank:5")).toBeDefined();

  fireEvent.click(screen.getByLabelText("home.trendingSelectGame:Game 10"));
  fireEvent.animationEnd(fillOf(container));
  expect(screen.getByRole("heading").textContent).toBe("Game 1");

  thumbsWidth = 224;
  rerender(<TrendingGamesHero games={rankedGames} responsive />);
  expect(screen.getAllByLabelText(/home\.trendingSelectGame/)).toHaveLength(5);
});

it("hides the thumbnails and the pause toggle when there is a single game", () => {
  const { container } = render(<TrendingGamesHero games={[games[0]]} />);
  expect(screen.getByRole("heading").textContent).toBe("One");
  expect(screen.queryByLabelText(/home\.trendingSelectGame/)).toBeNull();
  expect(screen.queryByLabelText("home.trendingPause")).toBeNull();
  expect(container.querySelector("button")).toBeNull();
});

it("pauses and resumes the rotation with the toggle", () => {
  const { container } = render(<TrendingGamesHero games={games} />);
  expect(fillOf(container).style.animationPlayState).toBe("running");

  fireEvent.click(screen.getByLabelText("home.trendingPause"));
  expect(fillOf(container).style.animationPlayState).toBe("paused");
  // the toggle now offers to resume
  expect(screen.queryByLabelText("home.trendingPause")).toBeNull();

  fireEvent.click(screen.getByLabelText("home.trendingPlay"));
  expect(fillOf(container).style.animationPlayState).toBe("running");
});

it("keeps the toggle paused after picking another game", () => {
  const { container } = render(<TrendingGamesHero games={games} />);
  fireEvent.click(screen.getByLabelText("home.trendingPause"));
  fireEvent.click(screen.getByLabelText("home.trendingSelectGame:Two"));
  expect(fillOf(container).style.animationPlayState).toBe("paused");
});

it("holds the rotation while keyboard focus is inside the hero", () => {
  mockFocusVisible(true);
  const { container } = render(<TrendingGamesHero games={games} />);
  const cta = screen.getByText("home.trendingViewGame");

  fireEvent.focus(cta);
  expect(fillOf(container).style.animationPlayState).toBe("paused");

  // focus moving between controls inside the hero keeps it held
  fireEvent.blur(cta, {
    relatedTarget: screen.getByLabelText("home.trendingPause"),
  });
  expect(fillOf(container).style.animationPlayState).toBe("paused");

  // leaving the hero releases it
  fireEvent.blur(cta, { relatedTarget: document.body });
  expect(fillOf(container).style.animationPlayState).toBe("running");
});

it("does not hold the rotation for non-keyboard (pointer) focus", () => {
  mockFocusVisible(false);
  const { container } = render(<TrendingGamesHero games={games} />);
  fireEvent.focus(screen.getByLabelText("home.trendingSelectGame:Two"));
  expect(fillOf(container).style.animationPlayState).toBe("running");
});

it("exposes a single named link to the game: the cover link is hidden from tab order and a11y tree", () => {
  const { container } = render(<TrendingGamesHero games={games} />);
  const links = container.querySelectorAll("a");
  expect(links).toHaveLength(2);
  const [cover, cta] = Array.from(links);
  expect(cover.getAttribute("aria-hidden")).toBe("true");
  expect(cover.getAttribute("tabindex")).toBe("-1");
  expect(cta.getAttribute("aria-hidden")).toBeNull();
  expect(screen.getAllByRole("link")).toHaveLength(1);
  expect(screen.getByRole("link").textContent).toBe("home.trendingViewGame");
});
