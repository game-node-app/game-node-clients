import { useEffect, useRef, useState } from "react";
import { Skeleton, Stack, Text } from "@mantine/core";
import { Game } from "@repo/wrapper/server";
import { Link } from "#@/util";
import { useGames } from "#@/components/game/hooks/useGames";
import { getCoverUrl } from "#@/components/game/util/getCoverUrl";
import {
  getSizedImageUrl,
  ImageSize,
} from "#@/components/game/util/getSizedImageUrl";
import { handleConsoleRowKeyDown } from "./consoleRowNavigation";

export { getGameArtUrl } from "./gameArt";

// long enough for the focused game's trailer (3s delay in ConsoleHome) to play a few seconds
const AUTOPLAY_MS = 8000;
// the Xbox active tile grows over 200ms (themes.css); scroll once the previous one has shrunk back
const TILE_RESIZE_MS = 220;

export const CONSOLE_GAME_RELATIONS = {
  cover: true,
  artworks: true,
  screenshots: true,
};

interface Props {
  title: string;
  /** undefined while the source (trending, playtime…) is still loading */
  gameIds: number[] | undefined;
  /** `seed` is true when a row just loaded, so the home only uses it if nothing is focused yet. */
  onFocusGame: (game: Game, seed?: boolean) => void;
  /** Carousel mode (mobile hero): the selection advances by itself and the selected tile scrolls to the first position. */
  autoplay?: boolean;
}

const ConsoleGameRow = ({ title, gameIds, onFocusGame, autoplay }: Props) => {
  const rowRef = useRef<HTMLDivElement>(null);
  // bumped by touches/clicks on the row, so the countdown restarts while the user is browsing
  const [interaction, setInteraction] = useState(0);
  const gamesQuery = useGames({ gameIds, relations: CONSOLE_GAME_RELATIONS });

  // keeps the source order (trending/recently played), which the API doesn't
  const games = (gameIds ?? [])
    .map((id) => gamesQuery.data?.find((game) => game.id === id))
    .filter((game): game is Game => game != undefined);

  // the selected tile; themes like Xbox render it as the big labelled card
  const [activeId, setActiveId] = useState<number>();
  const firstGame = games.at(0);
  const active = activeId ?? firstGame?.id;
  const select = (game: Game) => {
    setActiveId(game.id);
    onFocusGame(game);
  };
  useEffect(() => {
    if (firstGame) onFocusGame(firstGame, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstGame?.id]);

  useEffect(() => {
    if (
      !autoplay ||
      games.length < 2 ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const index = games.findIndex((game) => game.id === active);
    const timeout = setTimeout(
      () => select(games[(index + 1) % games.length]),
      AUTOPLAY_MS,
    );
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, active, games.length, interaction]);

  useEffect(() => {
    const row = rowRef.current;
    if (!autoplay || !row) return;
    const timeout = setTimeout(() => {
      const tile = row.querySelector<HTMLElement>("[data-active]");
      if (!tile) return;
      const padding = Number.parseFloat(getComputedStyle(row).paddingLeft);
      // only the row scrolls (scrollIntoView could also move the page while the user reads below)
      row.scrollTo({
        left:
          row.scrollLeft +
          tile.getBoundingClientRect().left -
          row.getBoundingClientRect().left -
          padding,
        behavior: "smooth",
      });
    }, TILE_RESIZE_MS);
    return () => clearTimeout(timeout);
  }, [autoplay, active]);

  const isLoading = gameIds == undefined || gamesQuery.isLoading;

  if (!isLoading && games.length === 0) return null;

  return (
    <Stack className={"gap-xs w-full"}>
      <Text className={"gn-console-row-title"}>{title}</Text>
      <div
        ref={rowRef}
        data-console-row
        className={"gn-console-row"}
        onKeyDown={handleConsoleRowKeyDown}
        onPointerDown={
          autoplay ? () => setInteraction((n) => n + 1) : undefined
        }
      >
        {isLoading &&
          Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className={"gn-tile"} />
          ))}
        {games.map((game) => (
          <Link
            key={game.id}
            href={`/game/${game.id}`}
            data-console-tile
            className={"gn-tile"}
            aria-label={game.name}
            data-active={game.id === active || undefined}
            onFocus={() => select(game)}
            onMouseEnter={() => select(game)}
          >
            <img
              src={
                // 2x: the focused tile grows past COVER_BIG's 264px on HiDPI screens
                getSizedImageUrl(getCoverUrl(game), ImageSize.COVER_BIG_2X) ??
                "/img/game_placeholder.jpeg"
              }
              alt={game.name}
              loading={"lazy"}
            />
            {/* shown by themes that label tiles (themes.css) */}
            <span className={"gn-tile-label"}>{game.name}</span>
          </Link>
        ))}
      </div>
    </Stack>
  );
};

export { ConsoleGameRow };
