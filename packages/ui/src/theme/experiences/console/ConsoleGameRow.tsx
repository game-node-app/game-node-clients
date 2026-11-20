import { useEffect, useMemo, useRef, useState } from "react";
import { Skeleton, Stack, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { Game } from "@repo/wrapper/server";
import { Link } from "#@/util";
import { useGames } from "#@/components/game/hooks/useGames";
import { getCoverUrl } from "#@/components/game/util/getCoverUrl";
import {
  getSizedImageUrl,
  ImageSize,
} from "#@/components/game/util/getSizedImageUrl";
import { handleConsoleRowKeyDown } from "./consoleRowNavigation";
import classes from "./ConsoleGameRow.module.css";

export { getGameArtUrl } from "./gameArt";

// long enough for the focused game's trailer (3s delay in ConsoleHome) to play a few seconds
const AUTOPLAY_MS = 8000;
// the console tile grows over 200ms; scroll once the previous one has shrunk back
const TILE_RESIZE_MS = 220;
// Tab focus needs the new tile in view as soon as its grow transition ends
const FOCUS_RESIZE_MS = 170;

export const CONSOLE_GAME_RELATIONS = {
  cover: true,
  artworks: true,
  screenshots: true,
};

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export interface ConsoleGameRowProps {
  title: string;
  /** undefined while the source (trending, playtime…) is still loading */
  gameIds: number[] | undefined;
  /** `seed` is true when a row just loaded, so the home only uses it if nothing is focused yet. */
  onFocusGame: (game: Game, seed?: boolean) => void;
  /** Carousel mode (mobile hero): the selection advances by itself and the selected tile scrolls to the first position. */
  autoplay?: boolean;
  /** Hides the row heading when the surrounding hero already names the source. */
  hideTitle?: boolean;
}

/**
 * One horizontal row of focusable game tiles. Arrow keys move focus inside the
 * row (and to the matching tile in the row above/below); the active tile is
 * exposed through `data-active` so experiences can enlarge it.
 */
const ConsoleGameRow = ({
  title,
  gameIds,
  onFocusGame,
  autoplay,
  hideTitle,
}: ConsoleGameRowProps) => {
  const { t } = useTranslation();
  const rowRef = useRef<HTMLDivElement>(null);
  // bumped by touches/clicks on the row, so the countdown restarts while the user is browsing
  const [interaction, setInteraction] = useState(0);
  const gamesQuery = useGames({ gameIds, relations: CONSOLE_GAME_RELATIONS });

  // keeps the source order (trending/recently played), which the API doesn't
  const gameIdsKey = gameIds?.join(",") ?? null;
  const games = useMemo(
    () =>
      (gameIdsKey ? gameIdsKey.split(",").map(Number) : [])
        .map((id) => gamesQuery.data?.find((game) => game.id === id))
        .filter((game): game is Game => game != undefined),
    [gameIdsKey, gamesQuery.data],
  );

  // the selected tile; experiences like Xbox render it as the big labelled card
  const [activeId, setActiveId] = useState<number>();
  const firstGame = games.at(0);
  const active = activeId ?? firstGame?.id;

  const select = (game: Game) => {
    setActiveId(game.id);
    onFocusGame(game);
  };

  // Tab focus can land on a tile that is only partly visible at the row edge;
  // wait for the focus scale to finish, then keep the tile and its ring inside
  // the row's scroll padding.
  const scrollFocusedTile = (tile: HTMLElement) => {
    const row = rowRef.current;
    if (!row) return;
    window.setTimeout(() => {
      if (!row.isConnected || !tile.isConnected) return;
      const styles = getComputedStyle(row);
      const paddingLeft = Number.parseFloat(styles.paddingLeft) || 0;
      const paddingRight = Number.parseFloat(styles.paddingRight) || 0;
      const rowRect = row.getBoundingClientRect();
      const tileRect = tile.getBoundingClientRect();
      // layout-less test environments report zero-sized boxes
      if (rowRect.width === 0 || tileRect.width === 0) return;
      const ring = 4;
      const leftEdge = rowRect.left + paddingLeft + ring;
      const rightEdge = rowRect.right - paddingRight - ring;
      const scrollBy = (left: number) => {
        const behavior = prefersReducedMotion() ? "auto" : "smooth";
        if (typeof row.scrollBy === "function") {
          row.scrollBy({ left, behavior });
        } else {
          row.scrollLeft += left;
        }
      };
      if (tileRect.left < leftEdge) {
        scrollBy(tileRect.left - leftEdge);
      } else if (tileRect.right > rightEdge) {
        scrollBy(tileRect.right - rightEdge);
      }
    }, FOCUS_RESIZE_MS);
  };

  useEffect(() => {
    if (firstGame) onFocusGame(firstGame, true);
  }, [firstGame, onFocusGame]);

  useEffect(() => {
    if (!autoplay || games.length < 2 || prefersReducedMotion()) return;

    const index = games.findIndex((game) => game.id === active);
    const nextGame = games[(index + 1) % games.length];
    const timeout = setTimeout(() => {
      setActiveId(nextGame.id);
      onFocusGame(nextGame);
    }, AUTOPLAY_MS);
    return () => clearTimeout(timeout);
  }, [autoplay, active, games, interaction, onFocusGame]);

  useEffect(() => {
    const row = rowRef.current;
    if (!autoplay || !row) return;

    const timeout = setTimeout(() => {
      const tile = row.querySelector<HTMLElement>("[data-active]");
      if (!tile) return;
      const padding = Number.parseFloat(getComputedStyle(row).paddingLeft);
      // only the row scrolls (scrollIntoView could also move the page while the user reads below)
      row.scrollTo?.({
        left:
          row.scrollLeft +
          tile.getBoundingClientRect().left -
          row.getBoundingClientRect().left -
          (Number.isFinite(padding) ? padding : 0),
        behavior: prefersReducedMotion() ? "auto" : "smooth",
      });
    }, TILE_RESIZE_MS);
    return () => clearTimeout(timeout);
  }, [autoplay, active]);

  const isLoading = gameIds == undefined || gamesQuery.isLoading;

  if (!isLoading && games.length === 0) return null;

  return (
    <Stack className={classes.rowGroup}>
      {!hideTitle && (
        <Text component="h2" className={classes.rowTitle}>
          {title}
        </Text>
      )}
      <span className={classes.hint}>{t("console.a11y.row")}</span>
      <div
        ref={rowRef}
        data-console-row
        className={classes.row}
        onKeyDown={handleConsoleRowKeyDown}
        onPointerDown={
          autoplay ? () => setInteraction((n) => n + 1) : undefined
        }
      >
        {isLoading &&
          Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className={classes.tile} />
          ))}
        {games.map((game) => (
          <Link
            key={game.id}
            href={`/game/${game.id}`}
            data-console-tile
            className={classes.tile}
            aria-label={game.name}
            data-active={game.id === active || undefined}
            onFocus={(event) => {
              select(game);
              scrollFocusedTile(event.currentTarget);
            }}
            onMouseEnter={() => select(game)}
          >
            <img
              src={
                // 2x: the focused tile grows past COVER_BIG's 264px on HiDPI screens
                getSizedImageUrl(getCoverUrl(game), ImageSize.COVER_BIG_2X) ??
                "/img/game_placeholder.jpeg"
              }
              alt={""}
              loading={"lazy"}
            />
            {/* shown by experiences that label tiles (Xbox shows it on the active hero tile) */}
            <span className={classes.tileLabel} data-console-tile-label>
              {game.name}
            </span>
          </Link>
        ))}
      </div>
    </Stack>
  );
};

export { ConsoleGameRow };
