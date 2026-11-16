import {
  formatNumber,
  formatPlaytimeHours,
} from "#@/components/events/util/format";
import type { YearRecap } from "#@/components/recap/types";
import { getUtcMonthName } from "#@/components/recap/stories/recapStories";
import { RecapStoryFrame } from "#@/components/recap/stories/RecapStoryFrame";
import { RecapCover } from "#@/components/wrapped/card/RecapCover";
import {
  at,
  displayStyle,
  monoStyle,
  RECAP_COLORS,
} from "#@/components/wrapped/card/recapCardTheme";
import type { Game } from "@repo/wrapper/server";
import { useTranslation } from "@repo/locales";

interface Props {
  recap: YearRecap;
  games: Game[];
  /** Display name of the Recap owner, from the profile read. */
  username: string | undefined;
  locale: string;
}

function FinalStat({ value }: { value: string }) {
  return (
    <div
      style={{
        width: 458,
        minHeight: 150,
        borderRadius: 24,
        background: RECAP_COLORS.panel,
        padding: 26,
        display: "flex",
        alignItems: "center",
      }}
    >
      <span style={displayStyle(50, RECAP_COLORS.cream, 600)}>{value}</span>
    </div>
  );
}

/**
 * Story 5 — "Seu ano em um card": the share card with the handle, hours, top
 * five covers and the year's figures (frame `5413:983`). The actions live in
 * the viewer chrome, outside the exported node.
 */
export function RecapStoryFinal({ recap, games, username, locale }: Props) {
  const { t } = useTranslation();
  const hours = formatPlaytimeHours(recap.totalPlaytimeSeconds, locale) ?? "0";
  const gameCount = formatNumber(recap.topGames.length, locale) ?? "0";
  const finishedCount = formatNumber(recap.totalFinishedGames, locale) ?? "0";
  const topGame = recap.topGames[0];
  const topGameName = topGame
    ? games.find((item) => item.id === topGame.gameId)?.name
    : undefined;
  const topMonth = recap.calendar?.topMonth?.month;
  const topMonthName = topMonth
    ? getUtcMonthName(recap.year, topMonth, locale)
    : null;

  return (
    <RecapStoryFrame
      storyId={"final"}
      eyebrow={t("recap.stories.final.eyebrow")}
    >
      {username && (
        <div style={at(64, 190, 952)}>
          <span style={monoStyle(36, RECAP_COLORS.brand)}>@{username}</span>
        </div>
      )}

      <div style={at(64, 260, 952)}>
        <div style={displayStyle(150)}>
          {t("recap.stories.final.hours", {
            hours,
            year: recap.year,
          })}
        </div>
      </div>

      <div
        style={{
          ...at(64, 520, 952),
          display: "flex",
          gap: 18,
        }}
      >
        {recap.topGames.slice(0, 5).map((top) => {
          const game = games.find((item) => item.id === top.gameId);
          return (
            <RecapCover
              key={top.gameId}
              game={game}
              width={176}
              height={240}
              radius={18}
            />
          );
        })}
      </div>

      <div
        style={{
          ...at(64, 860, 952),
          display: "flex",
          flexWrap: "wrap",
          gap: 36,
        }}
      >
        <FinalStat
          value={t("recap.stories.final.games", { count: gameCount })}
        />
        <FinalStat
          value={t("recap.stories.final.finished", { count: finishedCount })}
        />
        {topMonthName && (
          <FinalStat
            value={t("recap.stories.final.topMonth", { month: topMonthName })}
          />
        )}
        {topGameName && (
          <FinalStat
            value={t("recap.stories.final.goty", { game: topGameName })}
          />
        )}
      </div>
    </RecapStoryFrame>
  );
}
