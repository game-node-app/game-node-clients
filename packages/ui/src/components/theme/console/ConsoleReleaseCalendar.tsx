import { useMemo, useState } from "react";
import { Skeleton, Text } from "@mantine/core";
import dayjs, { Dayjs } from "dayjs";
import { useI18nContext, useTranslation } from "@repo/locales";
import { FindGamesByCollectionTypeRequestDto, Game } from "@repo/wrapper/server";
import { Link } from "#@/util";
import { useGamesByCollectionType } from "#@/components/game/hooks/useGamesByCollectionType";
import { getCoverUrl } from "#@/components/game/util/getCoverUrl";
import {
  getSizedImageUrl,
  ImageSize,
} from "#@/components/game/util/getSizedImageUrl";
import CollectionType = FindGamesByCollectionTypeRequestDto.collectionType;

// shortcut: only the next 100 upcoming games are placed; page the request if this month's later days look empty
const CALENDAR_LIMIT = 100;
// games listed per day before collapsing into "+N"
const GAMES_PER_DAY = 3;
const DAY_KEY = "YYYY-MM-DD";

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

const CalendarGame = ({ game }: { game: Game }) => (
  <Link
    href={`/game/${game.id}`}
    className={"gn-calendar-game"}
    title={game.name}
  >
    <img
      src={
        getSizedImageUrl(getCoverUrl(game), ImageSize.COVER_SMALL) ??
        "/img/game_placeholder.jpeg"
      }
      alt={""}
      loading={"lazy"}
    />
    <span className={"gn-calendar-game-name"}>{game.name}</span>
  </Link>
);

/** This month as a grid (Google Calendar style) with each upcoming game on its release day. */
const ConsoleReleaseCalendar = () => {
  const { t } = useTranslation();
  const { language } = useI18nContext();
  const today = dayjs();
  const month = today.startOf("month");
  // phones: the tapped day, whose games are listed under the grid
  const [selectedKey, setSelectedKey] = useState<string>();
  const query = useGamesByCollectionType({
    collectionType: CollectionType.UPCOMING,
    limit: CALENDAR_LIMIT,
    relations: { cover: true },
  });

  const gamesByDay = useMemo(() => {
    const map = new Map<string, Game[]>();
    for (const game of query.data?.data ?? []) {
      if (!game.firstReleaseDate) continue;
      const key = dayjs(game.firstReleaseDate).format(DAY_KEY);
      map.set(key, [...(map.get(key) ?? []), game]);
    }
    return map;
  }, [query.data]);


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
  // until a day is tapped: the month's first upcoming day with releases
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

  return (
    <section className={"gn-calendar"} aria-label={title}>
      <Text className={"gn-console-row-title"}>{title}</Text>
      <div className={"gn-calendar-grid"}>
        {days.slice(0, 7).map((day) => (
          <span key={day.day()} className={"gn-calendar-weekday"}>
            {weekdayFormat.format(day.toDate())}
          </span>
        ))}
        {days.map((day) => {
          const key = day.format(DAY_KEY);
          const games = gamesByDay.get(key) ?? [];
          const extra = games.length - GAMES_PER_DAY;
          return (
            <div
              key={key}
              className={"gn-calendar-day"}
              data-outside={!day.isSame(month, "month") || undefined}
              data-past={day.isBefore(today, "day") || undefined}
              data-today={day.isSame(today, "day") || undefined}
              data-selected={key === selected || undefined}
            >
              {/* phones: the whole cell selects the day (themes.css stretches it); desktop: just the date */}
              <button
                type={"button"}
                className={"gn-calendar-select"}
                disabled={games.length === 0}
                aria-pressed={key === selected}
                aria-label={`${dayFormat.format(day.toDate())}, ${t("game.releaseCalendar.gamesCount", { count: games.length })}`}
                onClick={() => setSelectedKey(key)}
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
                <Skeleton h={24} />
              )}
              {games.slice(0, GAMES_PER_DAY).map((game) => (
                <CalendarGame key={game.id} game={game} />
              ))}
              {extra > 0 && (
                <span className={"gn-calendar-more"}>+{extra}</span>
              )}
            </div>
          );
        })}
      </div>
      {selected && selectedGames.length > 0 && (
        <div className={"gn-calendar-agenda"} aria-live={"polite"}>
          <Text className={"gn-calendar-agenda-title"}>
            {dayFormat.format(dayjs(selected).toDate())}
            <span>
              {t("game.releaseCalendar.gamesCount", {
                count: selectedGames.length,
              })}
            </span>
          </Text>
          <div className={"gn-calendar-agenda-list"}>
            {selectedGames.map((game) => (
              <CalendarGame key={game.id} game={game} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export { ConsoleReleaseCalendar };
