import {
  formatPercentage,
  formatPlaytimeHours,
  formatRating,
  formatUtcDate,
} from "#@/components/events/util/format";
import type { YearRecap } from "#@/components/recap/types";
import { RecapStoryFrame } from "#@/components/recap/stories/RecapStoryFrame";
import {
  RecapBackdrop,
  RecapCover,
} from "#@/components/wrapped/card/RecapCover";
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
 * Story 2 — "Jogo do ano": the most played game with its hours, share of the
 * year, finish date and rating (frame `5413:917`).
 */
export function RecapStoryTopGame({ recap, games, locale }: Props) {
  const { t } = useTranslation();
  const top = recap.topGames[0]!;
  const game = games.find((item) => item.id === top.gameId);
  const hours = formatPlaytimeHours(top.totalPlaytimeSeconds, locale) ?? "0";
  const percentage = formatPercentage(top.share, locale);
  const finishedAt = formatUtcDate(top.finishedAt, locale, {
    day: "numeric",
    month: "long",
  });
  const rating = formatRating(top.rating, locale);

  return (
    <RecapStoryFrame
      storyId={"topGame"}
      eyebrow={t("recap.stories.topGame.eyebrow", { year: recap.year })}
      backdrop={
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.45,
          }}
        >
          <RecapBackdrop game={game} />
        </div>
      }
    >
      <div style={at(64, 220, 952)}>
        <div style={displayStyle(124)}>{game?.name ?? ""}</div>
      </div>

      <div style={at(64, 540, 952)}>
        <div style={displayStyle(232)}>
          {t("recap.stories.topGame.hoursValue", { hours })}
        </div>
      </div>

      {percentage && (
        <div style={at(64, 810, 952)}>
          <div style={displayStyle(52, RECAP_COLORS.muted, 600)}>
            {t("recap.stories.topGame.line", { hours, percentage })}
          </div>
        </div>
      )}

      {finishedAt && (
        <div style={at(64, 930, 952)}>
          <div style={displayStyle(46, RECAP_COLORS.cream, 600)}>
            {t("recap.stories.topGame.finished", { date: finishedAt })}
          </div>
        </div>
      )}

      {rating && (
        <div style={at(64, 1030, 952)}>
          <span style={monoStyle(38, RECAP_COLORS.brand)}>
            {t("recap.stories.topGame.rating", { rating })}
          </span>
        </div>
      )}

      <div
        style={{
          ...at(0, 1160, 1080),
          display: "flex",
          justifyContent: "center",
        }}
      >
        <RecapCover game={game} width={400} height={540} radius={28} />
      </div>
    </RecapStoryFrame>
  );
}
