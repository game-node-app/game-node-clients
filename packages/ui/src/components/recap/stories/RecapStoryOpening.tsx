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
  locale: string;
}

/**
 * Story 1 — "Abertura": the year's hours, games and finished count, the
 * monthly strip and the first four covers (frame `5413:862`).
 */
export function RecapStoryOpening({ recap, games, locale }: Props) {
  const { t } = useTranslation();
  const hours = formatPlaytimeHours(recap.totalPlaytimeSeconds, locale) ?? "0";
  const gameCount = recap.topGames.length;
  const gamesLabel = formatNumber(gameCount, locale) ?? "0";
  const finishedLabel = formatNumber(recap.totalFinishedGames, locale) ?? "0";
  const monthly = recap.calendar?.monthlyPlaytimeSeconds ?? null;
  const topMonth = recap.calendar?.topMonth?.month ?? null;
  const maxMonthly = monthly ? Math.max(...monthly, 1) : 1;

  return (
    <RecapStoryFrame
      storyId={"opening"}
      eyebrow={t("recap.stories.opening.eyebrow", { year: recap.year })}
    >
      <div style={at(64, 212, 952)}>
        <div style={displayStyle(164)}>
          {t("recap.stories.opening.hours", { hours })}
        </div>
      </div>

      <div style={at(64, 560, 900)}>
        <div style={displayStyle(54, RECAP_COLORS.muted, 600)}>
          {t("recap.stories.opening.summary", {
            games: gamesLabel,
            finished: finishedLabel,
            nodes: gamesLabel,
          })}
        </div>
      </div>

      {monthly && (
        <div style={at(64, 820, 952)}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 14,
              height: 320,
            }}
          >
            {monthly.map((seconds, monthIndex) => {
              const label = getUtcMonthName(
                recap.year,
                monthIndex + 1,
                locale,
                "short",
              );
              return (
                <div
                  key={monthIndex}
                  style={{
                    flex: 1,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      height: Math.max(
                        seconds > 0 ? 14 : 6,
                        Math.round((seconds / maxMonthly) * 260),
                      ),
                      borderRadius: 10,
                      background:
                        topMonth === monthIndex + 1
                          ? RECAP_COLORS.brand
                          : RECAP_COLORS.panel,
                    }}
                  />
                  <div
                    style={{
                      ...monoStyle(18, RECAP_COLORS.dim),
                      textAlign: "center",
                    }}
                  >
                    {label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div
        style={{
          ...at(64, 1270, 952),
          display: "flex",
          gap: 24,
        }}
      >
        {recap.topGames.slice(0, 4).map((top) => {
          const game = games.find((item) => item.id === top.gameId);
          return (
            <div key={top.gameId} style={{ width: 220 }}>
              <RecapCover game={game} width={220} height={300} radius={20} />
              <div
                className={"truncate"}
                style={{ ...monoStyle(20, RECAP_COLORS.muted), marginTop: 14 }}
              >
                {game?.name ?? ""}
              </div>
            </div>
          );
        })}
      </div>
    </RecapStoryFrame>
  );
}
