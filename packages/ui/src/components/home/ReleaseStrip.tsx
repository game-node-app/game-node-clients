import classes from "./ReleaseCalendar.module.css";
import { useMemo, useState } from "react";
import { Button, Collapse, Skeleton, Text } from "@mantine/core";
import { useReducedMotion } from "@mantine/hooks";
import { IconBookmark, IconCalendar } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useI18nContext, useTranslation } from "@repo/locales";
import { Game } from "@repo/wrapper/server";
import { Link } from "#@/util";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { useOwnCollectionEntryForGameId } from "#@/components/collection/collection-entry/hooks/useOwnCollectionEntryForGameId";
import { getCoverUrl } from "#@/components/game/util/getCoverUrl";
import {
  getSizedImageUrl,
  ImageSize,
} from "#@/components/game/util/getSizedImageUrl";
import {
  ReleaseCalendar,
  DAY_KEY,
  useUpcomingReleasesByDay,
} from "./ReleaseCalendar";

// games listed per day column before collapsing into "+N"
const GAMES_PER_DAY = 3;
// the strip scrolls sideways; 7 columns are visible at once on desktop
const STRIP_DAYS = 30;
const VISIBLE_DAYS = 7;

const StripGame = ({ game }: { game: Game }) => {
  const { t } = useTranslation();
  const userId = useUserId();
  const { data: entry } = useOwnCollectionEntryForGameId(
    game.id,
    userId != undefined,
  );
  const platforms = game.platforms
    ?.map((platform) => platform.abbreviation)
    .filter(Boolean)
    .join(" · ");

  return (
    <Link href={`/game/${game.id}`} className={classes.stripGame}>
      <img
        src={
          getSizedImageUrl(getCoverUrl(game), ImageSize.COVER_SMALL) ??
          "/img/game_placeholder.jpeg"
        }
        alt={""}
        loading={"lazy"}
      />
      <span className={classes.stripGameInfo}>
        <span className={classes.stripGameName}>{game.name}</span>
        {platforms && (
          <span className={classes.stripGamePlatforms}>{platforms}</span>
        )}
        {entry && (
          <span className={classes.stripGameBadge}>
            <IconBookmark size={12} aria-hidden />
            {t("game.releaseCalendar.inLibrary")}
          </span>
        )}
      </span>
    </Link>
  );
};

/** The next 30 days of releases, with the month calendar available on demand. */
const ReleaseStrip = () => {
  const { t } = useTranslation();
  const { language } = useI18nContext();
  const [showCalendar, setShowCalendar] = useState(false);
  const reduceMotion = useReducedMotion();
  const { query, gamesByDay } = useUpcomingReleasesByDay();

  const weekdayFormat = useMemo(
    () => new Intl.DateTimeFormat(language, { weekday: "short" }),
    [language],
  );

  if (query.isError || query.data?.data.length === 0) return null;

  const today = dayjs();
  const todayKey = today.format(DAY_KEY);
  // every day of the week shows, even without releases, so the timeline stays continuous
  const days = Array.from({ length: STRIP_DAYS }, (_, i) =>
    today.add(i, "day").format(DAY_KEY),
  );
  const title = t("game.collectionTypes.upcoming");

  return (
    <>
      <section className={classes.strip} aria-label={title}>
        <div className={classes.stripHeader}>
          <Text className={classes.title}>{title}</Text>
          <Button
            variant={"default"}
            size={"xs"}
            leftSection={<IconCalendar size={16} aria-hidden />}
            aria-expanded={showCalendar}
            onClick={() => setShowCalendar((shown) => !shown)}
          >
            {t(
              showCalendar
                ? "game.releaseCalendar.hideCalendar"
                : "game.releaseCalendar.showCalendar",
            )}
          </Button>
        </div>
        <div className={classes.stripDays}>
          {query.isLoading &&
            Array.from({ length: VISIBLE_DAYS }, (_, i) => (
              <Skeleton key={i} className={classes.stripDay} h={180} />
            ))}
          {!query.isLoading &&
            days.map((key) => {
              const day = dayjs(key);
              const games = gamesByDay.get(key) ?? [];
              const extra = games.length - GAMES_PER_DAY;
              const isToday = key === todayKey;
              return (
                <div
                  key={key}
                  className={classes.stripDay}
                  data-today={isToday || undefined}
                  data-empty={games.length === 0 || undefined}
                >
                  <time className={classes.stripDayHead} dateTime={key}>
                    <span className={classes.stripDayDot}>{day.date()}</span>
                    <span className={classes.stripDayLabel}>
                      {isToday
                        ? t("game.releaseCalendar.today")
                        : weekdayFormat.format(day.toDate())}
                    </span>
                  </time>
                  {games.length === 0 && (
                    <span className={classes.stripDayEmpty}>
                      {t("game.releaseCalendar.noReleases")}
                    </span>
                  )}
                  {games.slice(0, GAMES_PER_DAY).map((game) => (
                    <StripGame key={game.id} game={game} />
                  ))}
                  {extra > 0 && (
                    <button
                      type={"button"}
                      className={classes.stripMore}
                      onClick={() => setShowCalendar(true)}
                    >
                      {t("game.releaseCalendar.more", { count: extra })}
                    </button>
                  )}
                </div>
              );
            })}
        </div>
      </section>
      {/* slides down (height + fade) and back up when hidden */}
      <Collapse
        w={"100%"}
        expanded={showCalendar}
        transitionDuration={reduceMotion ? 0 : 400}
      >
        <ReleaseCalendar />
      </Collapse>
    </>
  );
};

export { ReleaseStrip };
