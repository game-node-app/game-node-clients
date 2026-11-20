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
import { CONSOLE_GAME_RELATIONS, ConsoleGameRow } from "./ConsoleGameRow";
import { ConsoleReleaseStrip } from "./ConsoleReleaseStrip";
import { getGameArtUrl } from "./gameArt";
import classes from "./ConsoleReleases.module.css";
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
    <section
      className={`${classes.hero} ${classes.upcomingHero}`}
      data-console-upcoming-hero
      aria-label={title}
    >
      {/* keyed so each game's art fades in instead of swapping abruptly */}
      <div
        key={art}
        className={classes.upcomingArt}
        style={art ? { backgroundImage: `url(${art})` } : undefined}
        aria-hidden
      />
      <div className={classes.upcomingInfo}>
        <span className={classes.upcomingEyebrow}>{title}</span>
        <Title order={2} className={classes.upcomingTitle}>
          {focused?.name ?? <>&nbsp;</>}
        </Title>
        {releaseDate && (
          <Text className={classes.upcomingDate}>
            <time dateTime={releaseDate.format("YYYY-MM-DD")}>
              {dateFormat.format(releaseDate.toDate())}
            </time>
            <span className={classes.upcomingCountdown}>
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
            className={classes.upcomingCta}
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
        hideTitle
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

  if (isLoading) return <Skeleton className={classes.recentHero} />;
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
      className={classes.recentHero}
      data-console-recent-hero
      aria-label={title}
      aria-roledescription={"carousel"}
    >
      {/* keyed so each game's art fades in instead of swapping abruptly */}
      <div
        key={art}
        className={classes.upcomingArt}
        style={art ? { backgroundImage: `url(${art})` } : undefined}
        aria-hidden
      />
      <img
        className={classes.recentHeroCover}
        src={
          getSizedImageUrl(getCoverUrl(game), ImageSize.COVER_BIG) ??
          "/img/game_placeholder.jpeg"
        }
        alt={""}
      />
      <div className={classes.recentHeroInfo} aria-live={"polite"}>
        <span className={classes.upcomingEyebrow}>{title}</span>
        <Title order={2} className={classes.recentHeroTitle}>
          {game.name}
        </Title>
        {releaseDate && (
          <time
            className={classes.releaseCardDate}
            dateTime={releaseDate.format("YYYY-MM-DD")}
          >
            {releaseDate
              .toDate()
              .toLocaleDateString(language, { dateStyle: "long" })}
          </time>
        )}
        {game.summary && (
          <Text className={classes.recentHeroSummary}>{game.summary}</Text>
        )}
        <Button
          component={Link}
          href={`/game/${game.id}`}
          className={classes.upcomingCta}
        >
          {t("collectionEntry.buttons.viewGame")}
        </Button>
      </div>
      {games.length > 1 && (
        <div className={classes.recentHeroPager}>
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
              className={classes.recentHeroDot}
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

export { ConsoleReleases, ConsoleUpcomingHero, RecentReleasesHero };
