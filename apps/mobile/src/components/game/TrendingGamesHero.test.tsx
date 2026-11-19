// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import type { Game } from "@repo/wrapper/server";
import { TrendingGamesHero } from "../../../../../packages/ui/src/components/game/trending/TrendingGamesHero";

vi.mock("@repo/locales", () => ({
  useTranslation: () => ({
    t: (key: string, o?: Record<string, unknown>) =>
      o ? `${key}:${Object.values(o).join(",")}` : key,
  }),
}));
vi.mock("@mantine/hooks", () => ({
  useReducedMotion: () => false,
  useIntersection: () => ({ ref: () => {}, entry: undefined }),
}));
vi.mock("../../../../../packages/ui/src/util", () => ({
  Link: ({ href, className, children }: Record<string, never>) => (
    <a href={href} className={className}>
      {children}
    </a>
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

afterEach(cleanup);

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
