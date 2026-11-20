import React, { useCallback, useEffect, useRef, useState } from "react";
import { Stack, Title } from "@mantine/core";
import { useMediaQuery, useReducedMotion } from "@mantine/hooks";
import { useTranslation } from "@repo/locales";
import { FindAllPlaytimeFiltersDto, Game } from "@repo/wrapper/server";
import { buildPresenterComponent } from "#@/context";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { useGame } from "#@/components/game/hooks/useGame";
import { getCoverUrl } from "#@/components/game/util/getCoverUrl";
import {
  getSizedImageUrl,
  ImageSize,
} from "#@/components/game/util/getSizedImageUrl";
import { DEFAULT_SEARCH_TRENDING_GAMES_DTO } from "#@/components/game/trending/TrendingGamesList";
import type { HomeViewProps } from "#@/components/home/HomeView";
import { usePlaytimeForUser } from "#@/components/playtime/hooks/usePlaytimeForUser";
import { useRecommendations } from "#@/components/recommendation/hook/useRecommendations";
import { useTrendingGames } from "#@/components/statistics/hooks/useTrendingGames";
import { ConsoleGameRow } from "./ConsoleGameRow";
import { ConsoleReviewRow } from "./ConsoleReviewRow";
import { getGameArtUrl } from "./gameArt";
import classes from "./ConsoleHome.module.css";

// hovering a tile shows its art first; the trailer only replaces it once the focus settles
const TRAILER_DELAY_MS = 3000;
const TRAILER_START_S = 30;

const TrailerFrame = ({
  videoId,
  title,
}: {
  videoId: string;
  title?: string;
}) => {
  const frameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const frame = frameRef.current;
    const send = (message: object) =>
      frame?.contentWindow?.postMessage(JSON.stringify(message), "*");
    // loop=1 needs a playlist (prev/next buttons) and restarting after the end flashes the pause bezel,
    // so seek back to the start point just before the end, while still playing
    let duration = 0;
    const onMessage = (message: MessageEvent) => {
      if (message.source !== frame?.contentWindow) return;
      try {
        const info = JSON.parse(message.data).info;
        duration = info?.duration ?? duration;
        if (duration && info?.currentTime >= duration - 1) {
          send({
            event: "command",
            func: "seekTo",
            args: [TRAILER_START_S, true],
          });
        }
      } catch {
        // not a player message
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <iframe
      ref={frameRef}
      src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1&mute=1&controls=0&playsinline=1&rel=0&disablekb=1&enablejsapi=1&start=${TRAILER_START_S}&modestbranding=1&iv_load_policy=3&fs=0`}
      title={title}
      allow={"autoplay; encrypted-media"}
      tabIndex={-1}
      onLoad={() =>
        frameRef.current?.contentWindow?.postMessage(
          JSON.stringify({ event: "listening" }),
          "*",
        )
      }
    />
  );
};

type RowProps = {
  onFocusGame: (game: Game, seed?: boolean) => void;
  autoplay?: boolean;
};

const RecentlyPlayedRow = ({
  userId,
  fallback,
  ...others
}: RowProps & { userId: string; fallback: React.ReactNode }) => {
  const { t } = useTranslation();
  const playtimeQuery = usePlaytimeForUser({
    userId,
    period: FindAllPlaytimeFiltersDto.period.ALL,
    orderBy: { lastPlayedDate: "DESC" },
    limit: 10,
  });
  const gameIds = playtimeQuery.data?.data.map((playtime) => playtime.gameId);

  // no synced playtime yet: the hero still needs a row
  if (playtimeQuery.isError || gameIds?.length === 0) return fallback;

  return (
    <ConsoleGameRow
      title={t("profile.recent.recentlyPlayed")}
      gameIds={gameIds && Array.from(new Set(gameIds))}
      {...others}
    />
  );
};

const RecommendedRow = (props: RowProps) => {
  const { t } = useTranslation();
  const recommendationsQuery = useRecommendations("played", 10);

  return (
    <ConsoleGameRow
      title={t("recommendation.basedOnPlayed")}
      gameIds={
        recommendationsQuery.isError ? [] : recommendationsQuery.data?.gameIds
      }
      {...props}
    />
  );
};

// Resolved through the presenter registry so a theme screen pack can override
// them; the empty fallback keeps the console pack independent from the default
// release/blog implementations (the experience pack always provides these).
const HomeReleasesPresenter = buildPresenterComponent(
  "HomeReleases",
  () => null,
);
const RecentBlogPostsPresenter = buildPresenterComponent(
  "RecentBlogPostsCarousel",
  () => null,
);

/**
 * Console home used by every theme with the `console` experience: the focused
 * game's art fills the hero behind horizontal rows of tiles. The per-theme look
 * comes from tokens and CSS Modules; the screen pack can restyle the same
 * `data-console-*` hooks.
 *
 * `search` sits under the hero row so searching starts in the first viewport.
 * Releases and the blog section come from their presenters (so a theme screen
 * pack can override them); `extras` keeps platform-only sections such as
 * events and activities. The rest of `children` is intentionally not rendered:
 * the console composition replaces those sections instead of duplicating them.
 */
const ConsoleHome = ({ search, extras }: HomeViewProps) => {
  const { t } = useTranslation();
  const userId = useUserId();
  const reduceMotion = useReducedMotion();
  const [focused, setFocused] = useState<Game>();
  const [trailerGameId, setTrailerGameId] = useState<number>();
  // last game the hero focused, so a theme switch (A -> B -> A) restarts the
  // trailer wait while focusing the same tile again keeps it playing
  const focusedIdRef = useRef<number | undefined>(undefined);
  // same breakpoint as the hero's mobile height: there the games sit at the bottom of the art
  const isCompact = useMediaQuery("(max-width: 61.99em)", false);
  // own request: a server without the `videos` relation fails only this one, not the rows
  const videoQuery = useGame(focused?.id, { relations: { videos: true } });
  const videoId = videoQuery.data?.videos?.at(0)?.videoId;

  useEffect(() => {
    if (!focused || !videoId || reduceMotion) return;
    const timeout = setTimeout(
      () => setTrailerGameId(focused.id),
      TRAILER_DELAY_MS,
    );
    return () => clearTimeout(timeout);
  }, [focused, videoId, reduceMotion]);

  // A -> B -> A must wait for the trailer again: the first game's trailer is
  // dropped as soon as another game takes the hero. Focusing the same tile
  // again (or a row finishing its seed) keeps the current wait/playback.
  const onFocusGame = useCallback((game: Game, seed?: boolean) => {
    if (seed && focusedIdRef.current != null) return;
    if (focusedIdRef.current !== game.id) {
      focusedIdRef.current = game.id;
      setTrailerGameId(undefined);
    }
    setFocused(game);
  }, []);

  const trendingQuery = useTrendingGames({
    ...DEFAULT_SEARCH_TRENDING_GAMES_DTO,
    limit: 10,
  });
  const trendingGameIds = trendingQuery.isError
    ? []
    : trendingQuery.data?.items
        .map((item) => item.sourceId)
        .filter((id): id is number => typeof id === "number");

  const trendingRow = (autoplay?: boolean) => (
    <ConsoleGameRow
      title={t("home.trendingGames")}
      gameIds={trendingGameIds}
      onFocusGame={onFocusGame}
      autoplay={autoplay}
    />
  );

  const backdrop =
    focused &&
    (getGameArtUrl(focused, ImageSize.FULL_HD) ??
      getSizedImageUrl(getCoverUrl(focused), ImageSize.FULL_HD));

  return (
    <Stack className={classes.home} data-console-home>
      <section className={classes.hero} data-console-hero>
        <div
          className={classes.backdrop}
          data-console-backdrop
          style={backdrop ? { backgroundImage: `url(${backdrop})` } : undefined}
          aria-hidden
        />
        {videoId && !reduceMotion && trailerGameId === focused?.id && (
          <div className={classes.trailer} data-console-trailer aria-hidden>
            <TrailerFrame videoId={videoId} title={focused?.name} />
          </div>
        )}
        <Title order={2} className={classes.focusedTitle}>
          {focused?.name ?? <>&nbsp;</>}
        </Title>
        {userId ? (
          <RecentlyPlayedRow
            userId={userId}
            onFocusGame={onFocusGame}
            fallback={trendingRow(isCompact)}
            autoplay={isCompact}
          />
        ) : (
          trendingRow(isCompact)
        )}
        {search && (
          <section
            className={classes.search}
            data-console-search
            aria-label={t("console.search.title")}
          >
            {search}
          </section>
        )}
      </section>
      {userId && trendingRow()}
      {userId && <RecommendedRow onFocusGame={onFocusGame} />}
      <ConsoleReviewRow />
      <HomeReleasesPresenter />
      <RecentBlogPostsPresenter />
      {extras}
    </Stack>
  );
};

export { ConsoleHome };
