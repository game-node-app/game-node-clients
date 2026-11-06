import React, { useCallback, useEffect, useRef, useState } from "react";
import { Stack, Title } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useTranslation } from "@repo/locales";
import { FindAllPlaytimeFiltersDto, Game } from "@repo/wrapper/server";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { GameBackdrop } from "#@/components/game/figure/GameBackdrop";
import { useGame } from "#@/components/game/hooks/useGame";
import { ImageSize } from "#@/components/game/util/getSizedImageUrl";
import { DEFAULT_SEARCH_TRENDING_GAMES_DTO } from "#@/components/game/trending/TrendingGamesList";
import { usePlaytimeForUser } from "#@/components/playtime/hooks/usePlaytimeForUser";
import { useRecommendations } from "#@/components/recommendation/hook/useRecommendations";
import { useTrendingGames } from "#@/components/statistics/hooks/useTrendingGames";
import { ConsoleGameRow, getGameArtUrl } from "./ConsoleGameRow";
import { ConsoleReviewRow } from "./ConsoleReviewRow";

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
          send({ event: "command", func: "seekTo", args: [TRAILER_START_S, true] });
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

/**
 * Console-style home used by every non-default app theme: the focused game's art fills the
 * hero behind horizontal rows of tiles. Look per theme lives in themes.css.
 * `search` sits under the hero row, so searching starts in the first viewport; reviews come last.
 */
const ConsoleHome = ({ search }: { search?: React.ReactNode }) => {
  const { t } = useTranslation();
  const userId = useUserId();
  const [focused, setFocused] = useState<Game>();
  const [trailerGameId, setTrailerGameId] = useState<number>();
  // same breakpoint as the hero's mobile height (themes.css): there the games sit at the bottom of the art
  const isCompact = useMediaQuery("(max-width: 61.99em)", false);
  // own request: a server without the `videos` relation fails only this one, not the rows
  const videoQuery = useGame(focused?.id, { relations: { videos: true } });
  const videoId = videoQuery.data?.videos?.at(0)?.videoId;

  useEffect(() => {
    if (
      !focused ||
      !videoId ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const timeout = setTimeout(
      () => setTrailerGameId(focused.id),
      TRAILER_DELAY_MS,
    );
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focused?.id, videoId]);

  const onFocusGame = useCallback((game: Game, seed?: boolean) => {
    setFocused((previous) => (seed && previous ? previous : game));
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

  return (
    <Stack className={"gn-console-home"}>
      <div className={"gn-console-hero"}>
        <GameBackdrop
          className={"gn-console-backdrop"}
          imageUrl={focused && getGameArtUrl(focused, ImageSize.FULL_HD)}
          style={{ zIndex: -1, opacity: 1 }}
        />
        {videoId && trailerGameId === focused?.id && (
          <div className={"gn-console-backdrop gn-console-trailer"} aria-hidden>
            <TrailerFrame videoId={videoId} title={focused?.name} />
          </div>
        )}
        <Title order={2} className={"gn-console-focused-title"}>
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
        {search}
      </div>
      {userId && trendingRow()}
      {userId && <RecommendedRow onFocusGame={onFocusGame} />}
      <ConsoleReviewRow />
    </Stack>
  );
};

export { ConsoleHome };
