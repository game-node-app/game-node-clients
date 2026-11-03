import { useMemo, useState } from "react";
import { ActionIcon, Skeleton, Text } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import dayjs, { Dayjs } from "dayjs";
import { useI18nContext, useTranslation } from "@repo/locales";
import {
  FindGamesByCollectionTypeRequestDto,
  Game,
} from "@repo/wrapper/server";
import { Link } from "#@/util";
import { useGamesByCollectionType } from "#@/components/game/hooks/useGamesByCollectionType";
import { getCoverUrl } from "#@/components/game/util/getCoverUrl";
import { getReleaseDay } from "#@/components/game/util/getLocalizedFirstReleaseDate";
import {
  getSizedImageUrl,
  ImageSize,
} from "#@/components/game/util/getSizedImageUrl";
import CollectionType = FindGamesByCollectionTypeRequestDto.collectionType;

// shortcut: only the next 100 upcoming games are placed; page the request if this month's later days look empty
const CALENDAR_LIMIT = 100;
export const DAY_KEY = "YYYY-MM-DD";

/** Every day shown for `month`: whole weeks, Sunday first, so the grid starts and ends on full rows. */
export const getCalendarDays = (month: Dayjs): Dayjs[] => {
  const start = month.startOf("month").startOf("week");
  const end = month.endOf("month").endOf("week");
  const days: Dayjs[] = [];
  for (let day = start; !day.isAfter(end, "day"); day = day.add(1, "day")) {
    days.push(day);
  }
  return days;
};

/** Upcoming games grouped by release day (DAY_KEY), shared by the calendar and the Xbox release strip. */
export const useUpcomingReleasesByDay = () => {
  const query = useGamesByCollectionType({
    collectionType: CollectionType.UPCOMING,
    limit: CALENDAR_LIMIT,
    relations: { cover: true, platforms: true },
  });

  const gamesByDay = useMemo(() => {
    const map = new Map<string, Game[]>();
    for (const game of query.data?.data ?? []) {
      if (!game.firstReleaseDate) continue;
      const key = getReleaseDay(game.firstReleaseDate).format(DAY_KEY);
      map.set(key, [...(map.get(key) ?? []), game]);
    }
    return map;
  }, [query.data]);

  return { query, gamesByDay };
};

/** The selected day's release in the side panel: cover, name, platforms and summary. */
const AgendaGame = ({ game }: { game: Game }) => {
  const platforms = game.platforms
    ?.map((platform) => platform.abbreviation)
    .filter(Boolean);
  const cover =
    getSizedImageUrl(getCoverUrl(game), ImageSize.COVER_BIG) ??
    "/img/game_placeholder.jpeg";
  return (
    <Link href={`/game/${game.id}`} className={"gn-agenda-game"}>
      {/* the cover, blurred, tints the whole panel behind the card */}
      <img className={"gn-agenda-backdrop"} src={cover} alt={""} aria-hidden />
      <img src={cover} alt={""} loading={"lazy"} />
      <span className={"gn-agenda-game-info"}>
        <span className={"gn-agenda-game-name"}>{game.name}</span>
        {platforms && platforms.length > 0 && (
          <span className={"gn-agenda-game-platforms"}>
            {platforms.map((platform) => (
              <span key={platform}>{platform}</span>
            ))}
          </span>
        )}
        {game.summary && (
          <span className={"gn-agenda-game-summary"}>{game.summary}</span>
        )}
      </span>
    </Link>
  );
};

/** This month as a compact grid (release count per day) beside the selected day's releases. */
const ConsoleReleaseCalendar = () => {
  const { t } = useTranslation();
  const { language } = useI18nContext();
  const today = dayjs();
  const month = today.startOf("month");
  // the clicked day, whose games fill the agenda panel
  const [selectedKey, setSelectedKey] = useState<string>();
  const [index, setIndex] = useState(0);
  const { query, gamesByDay } = useUpcomingReleasesByDay();

  const [weekdayFormat, dayFormat] = useMemo(
    () => [
      new Intl.DateTimeFormat(language, { weekday: "short" }),
      new Intl.DateTimeFormat(language, {
        weekday: "long",
        day: "numeric",
        month: "long",
      }),
    ],
    [language],
  );

  if (query.isError || query.data?.data.length === 0) return null;

  const days = getCalendarDays(month);
  const title = t("game.releaseCalendar.title");
  // until a day is clicked: the month's first upcoming day with releases
  const selected =
    selectedKey ??
    days
      .find(
        (day) =>
          day.isSame(month, "month") &&
          !day.isBefore(today, "day") &&
          gamesByDay.has(day.format(DAY_KEY)),
      )
      ?.format(DAY_KEY);
  const selectedGames = (selected && gamesByDay.get(selected)) || [];
  // the day's games are shown one at a time, wrapping around
  const gameIndex = selectedGames.length ? index % selectedGames.length : 0;
  const step = (direction: number) =>
    setIndex(
      (gameIndex + direction + selectedGames.length) % selectedGames.length,
    );

  return (
    <section className={"gn-calendar"} aria-label={title}>
      <Text className={"gn-console-row-title"}>{title}</Text>
      <div className={"gn-calendar-layout"}>
        <div className={"gn-calendar-grid"}>
          {days.slice(0, 7).map((day) => (
            <span key={day.day()} className={"gn-calendar-weekday"}>
              {weekdayFormat.format(day.toDate())}
            </span>
          ))}
          {days.map((day) => {
            const key = day.format(DAY_KEY);
            const games = gamesByDay.get(key) ?? [];
            return (
              <div
                key={key}
                className={"gn-calendar-day"}
                data-outside={!day.isSame(month, "month") || undefined}
                data-past={day.isBefore(today, "day") || undefined}
                data-today={day.isSame(today, "day") || undefined}
                data-selected={key === selected || undefined}
              >
                {/* the whole cell selects the day (base.css stretches the button over it) */}
                <button
                  type={"button"}
                  className={"gn-calendar-select"}
                  disabled={games.length === 0}
                  aria-pressed={key === selected}
                  aria-label={`${dayFormat.format(day.toDate())}, ${t("game.releaseCalendar.gamesCount", { count: games.length })}`}
                  onClick={() => {
                    setSelectedKey(key);
                    setIndex(0);
                  }}
                >
                  <time className={"gn-calendar-date"} dateTime={key}>
                    {day.date()}
                  </time>
                  {games.length > 0 && (
                    <span className={"gn-calendar-count"} aria-hidden>
                      {games.length}
                    </span>
                  )}
                </button>
                {query.isLoading && day.isSame(today, "day") && (
                  <Skeleton h={16} w={24} />
                )}
              </div>
            );
          })}
        </div>
        {selected && selectedGames.length > 0 && (
          <div className={"gn-calendar-agenda"} aria-live={"polite"}>
            <div className={"gn-calendar-agenda-panel"}>
              <div className={"gn-calendar-agenda-header"}>
                <Text className={"gn-calendar-agenda-title"}>
                  {dayFormat.format(dayjs(selected).toDate())}
                  <span>
                    {t("game.releaseCalendar.gamesCount", {
                      count: selectedGames.length,
                    })}
                  </span>
                </Text>
                {selectedGames.length > 1 && (
                  <div className={"gn-calendar-agenda-nav"}>
                    <ActionIcon
                      variant={"default"}
                      size={"lg"}
                      aria-label={t("game.releaseCalendar.previousGame")}
                      onClick={() => step(-1)}
                    >
                      <IconChevronLeft size={18} />
                    </ActionIcon>
                    <span>
                      {gameIndex + 1} / {selectedGames.length}
                    </span>
                    <ActionIcon
                      variant={"default"}
                      size={"lg"}
                      aria-label={t("game.releaseCalendar.nextGame")}
                      onClick={() => step(1)}
                    >
                      <IconChevronRight size={18} />
                    </ActionIcon>
                  </div>
                )}
              </div>
              {/* keyed so each game fades in instead of swapping in place */}
              <AgendaGame
                key={selectedGames[gameIndex].id}
                game={selectedGames[gameIndex]}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export { ConsoleReleaseCalendar };
