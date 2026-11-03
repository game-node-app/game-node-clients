import { useCallback, useMemo, useState } from "react";
import { Button, Text, Title } from "@mantine/core";
import dayjs from "dayjs";
import { useI18nContext, useTranslation } from "@repo/locales";
import {
  FindGamesByCollectionTypeRequestDto,
  Game,
} from "@repo/wrapper/server";
import { Link } from "#@/util";
import { useGamesByCollectionType } from "#@/components/game/hooks/useGamesByCollectionType";
import { getCoverUrl } from "#@/components/game/util/getCoverUrl";
import {
  getSizedImageUrl,
  ImageSize,
} from "#@/components/game/util/getSizedImageUrl";
import { ConsoleGameRow, getGameArtUrl } from "./ConsoleGameRow";
import { ConsoleReleaseCalendar } from "./ConsoleReleaseCalendar";
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
    ? dayjs(focused.firstReleaseDate)
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

const RecentReleasesRow = () => {
  const { t } = useTranslation();
  const gameIds = useCollectionGameIds(CollectionType.RECENTLY_RELEASED, 12);

  return (
    <ConsoleGameRow
      title={t("game.collectionTypes.recentReleases")}
      gameIds={gameIds}
      onFocusGame={() => {}}
    />
  );
};

/** Xbox home's upcoming / recently released section, in place of the two GameCollectionTypeView lists. */
const ConsoleReleases = () => (
  <>
    <ConsoleUpcomingHero />
    <ConsoleReleaseCalendar />
    <RecentReleasesRow />
  </>
);

export { ConsoleReleases };
