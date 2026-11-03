import { useCallback, useMemo, useState } from "react";
import { ActionIcon, Button, Skeleton, Text, Title } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useI18nContext, useTranslation } from "@repo/locales";
import {
  FindGamesByCollectionTypeRequestDto,
  Game,
} from "@repo/wrapper/server";
import { Link } from "#@/util";
import { useGames } from "#@/components/game/hooks/useGames";
import { useGamesByCollectionType } from "#@/components/game/hooks/useGamesByCollectionType";
import { getCoverUrl } from "#@/components/game/util/getCoverUrl";
import { getReleaseDay } from "#@/components/game/util/getLocalizedFirstReleaseDate";
import {
  getSizedImageUrl,
  ImageSize,
} from "#@/components/game/util/getSizedImageUrl";
import {
  CONSOLE_GAME_RELATIONS,
  ConsoleGameRow,
  getGameArtUrl,
} from "./ConsoleGameRow";
import { ConsoleReleaseStrip } from "./ConsoleReleaseStrip";
import CollectionType = FindGamesByCollectionTypeRequestDto.collectionType;

// the desktop row shares the hero's right column, more covers would shrink below thumbnail size
const UPCOMING_LIMIT = 6;

const useCollectionGameIds = (
  collectionType: CollectionType,
  limit: number,
) => {
  const query = useGamesByCollectionType({ collectionType, limit });
  return query.isError ? [] : query.data?.data.map((game) => game.id);
};

/** Xbox "coming soon" spotlight: the selected upcoming game's art, name and release date over its cover row. */
const ConsoleUpcomingHero = () => {
  const { t } = useTranslation();
  const { language } = useI18nContext();
  const gameIds = useCollectionGameIds(CollectionType.UPCOMING, UPCOMING_LIMIT);
  const [focused, setFocused] = useState<Game>();
  const onFocusGame = useCallback((game: Game, seed?: boolean) => {
    setFocused((previous) => (seed && previous ? previous : game));
  }, []);

  const [dateFormat, relativeFormat] = useMemo(
    () => [
      new Intl.DateTimeFormat(language, { dateStyle: "long" }),
      new Intl.RelativeTimeFormat(language, { numeric: "auto" }),
    ],
    [language],
  );

  if (gameIds?.length === 0) return null;

  const title = t("game.collectionTypes.upcoming");
  const art =
    focused &&
    (getGameArtUrl(focused, ImageSize.FULL_HD) ??
      getSizedImageUrl(getCoverUrl(focused), ImageSize.FULL_HD));
  const releaseDate = focused?.firstReleaseDate
    ? getReleaseDay(focused.firstReleaseDate)
    : undefined;

  return (
    <section className={"gn-console-hero gn-upcoming-hero"} aria-label={title}>
      {/* keyed so each game's art fades in instead of swapping abruptly */}
      <div
        key={art}
        className={"gn-upcoming-art"}
        style={{ backgroundImage: art && `url(${art})` }}
        aria-hidden
      />
      <div className={"gn-upcoming-info"}>
        <span className={"gn-upcoming-eyebrow"}>{title}</span>
        <Title order={2} className={"gn-upcoming-title"}>
          {focused?.name ?? <>&nbsp;</>}
        </Title>
        {releaseDate && (
          <Text className={"gn-upcoming-date"}>
            <time dateTime={releaseDate.format("YYYY-MM-DD")}>
              {dateFormat.format(releaseDate.toDate())}
            </time>
            <span className={"gn-upcoming-countdown"}>
              {relativeFormat.format(
                releaseDate.startOf("day").diff(dayjs().startOf("day"), "day"),
                "day",
              )}
            </span>
          </Text>
        )}
        {focused && (
          <Button
            component={Link}
            href={`/game/${focused.id}`}
            className={"gn-upcoming-cta"}
          >
            {t("collectionEntry.buttons.viewGame")}
          </Button>
        )}
      </div>
      <ConsoleGameRow
        title={title}
        gameIds={gameIds}
        onFocusGame={onFocusGame}
        autoplay
      />
    </section>
  );
};

// enough to page through without the dots turning into a progress bar
const RECENT_LIMIT = 6;

/** Recently released games as one hero banner: the selected game's art behind its cover, date, name and summary, paged with arrows and dots. */
const RecentReleasesHero = () => {
  const { t } = useTranslation();
  const { language } = useI18nContext();
  const [index, setIndex] = useState(0);
  const gameIds = useCollectionGameIds(
    CollectionType.RECENTLY_RELEASED,
    RECENT_LIMIT,
  );
  const gamesQuery = useGames({ gameIds, relations: CONSOLE_GAME_RELATIONS });
  // keeps the collection's order, which the API doesn't
  const games = (gameIds ?? [])
    .map((id) => gamesQuery.data?.find((game) => game.id === id))
    .filter((game): game is Game => game != undefined);
  const isLoading = gameIds == undefined || gamesQuery.isLoading;
  const title = t("game.collectionTypes.recentReleases");

  if (isLoading) return <Skeleton className={"gn-recent-hero"} />;
  if (games.length === 0) return null;

  const game = games[Math.min(index, games.length - 1)];
  const art =
    getGameArtUrl(game, ImageSize.FULL_HD) ??
    getSizedImageUrl(getCoverUrl(game), ImageSize.FULL_HD);
  const releaseDate = game.firstReleaseDate
    ? getReleaseDay(game.firstReleaseDate)
    : undefined;
  const go = (step: number) =>
    setIndex((current) => (current + step + games.length) % games.length);

  return (
    <section
      className={"gn-recent-hero"}
      aria-label={title}
      aria-roledescription={"carousel"}
    >
      {/* keyed so each game's art fades in instead of swapping abruptly */}
      <div
        key={art}
        className={"gn-upcoming-art"}
        style={{ backgroundImage: art && `url(${art})` }}
        aria-hidden
      />
      <img
        className={"gn-recent-hero-cover"}
        src={
          getSizedImageUrl(getCoverUrl(game), ImageSize.COVER_BIG) ??
          "/img/game_placeholder.jpeg"
        }
        alt={""}
      />
      <div className={"gn-recent-hero-info"} aria-live={"polite"}>
        <span className={"gn-upcoming-eyebrow"}>{title}</span>
        <Title order={2} className={"gn-recent-hero-title"}>
          {game.name}
        </Title>
        {releaseDate && (
          <time
            className={"gn-release-card-date"}
            dateTime={releaseDate.format("YYYY-MM-DD")}
          >
            {releaseDate
              .toDate()
              .toLocaleDateString(language, { dateStyle: "long" })}
          </time>
        )}
        {game.summary && (
          <Text className={"gn-recent-hero-summary"}>{game.summary}</Text>
        )}
        <Button
          component={Link}
          href={`/game/${game.id}`}
          className={"gn-upcoming-cta"}
        >
          {t("collectionEntry.buttons.viewGame")}
        </Button>
      </div>
      {games.length > 1 && (
        <div className={"gn-recent-hero-pager"}>
          <ActionIcon
            variant={"subtle"}
            color={"gray"}
            aria-label={t("game.releaseCalendar.previousGame")}
            onClick={() => go(-1)}
          >
            <IconChevronLeft />
          </ActionIcon>
          {games.map((item, i) => (
            <button
              key={item.id}
              type={"button"}
              className={"gn-recent-hero-dot"}
              data-active={i === index || undefined}
              aria-label={item.name}
              aria-current={i === index || undefined}
              onClick={() => setIndex(i)}
            />
          ))}
          <ActionIcon
            variant={"subtle"}
            color={"gray"}
            aria-label={t("game.releaseCalendar.nextGame")}
            onClick={() => go(1)}
          >
            <IconChevronRight />
          </ActionIcon>
        </div>
      )}
    </section>
  );
};

/** Xbox home's upcoming / recently released section, in place of the two GameCollectionTypeView lists. */
const ConsoleReleases = () => (
  <>
    <ConsoleUpcomingHero />
    <ConsoleReleaseStrip />
    <RecentReleasesHero />
  </>
);

export { ConsoleReleases };
