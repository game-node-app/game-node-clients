import {
  formatNumber,
  formatPercentage,
  formatRating,
} from "#@/components/events/util/format";
import type {
  RecapCommunityHighlight,
  YearRecap,
} from "#@/components/recap/types";
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

interface HighlightCardProps {
  value: string;
  label: string;
}

function HighlightCard({ value, label }: HighlightCardProps) {
  return (
    <div
      style={{
        width: 458,
        height: 216,
        borderRadius: 24,
        background: RECAP_COLORS.panel,
        padding: 26,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 10,
      }}
    >
      <span style={displayStyle(120)}>{value}</span>
      <span style={monoStyle(24, RECAP_COLORS.muted)}>{label}</span>
    </div>
  );
}

function CoverWithName({
  game,
  name,
}: {
  game: Game | undefined;
  name: string;
}) {
  return (
    <div style={{ width: 220 }}>
      <RecapCover game={game} width={220} height={300} radius={20} />
      <div
        className={"truncate"}
        style={{ ...monoStyle(20, RECAP_COLORS.muted), marginTop: 14 }}
      >
        {name}
      </div>
    </div>
  );
}

function findGame(games: Game[], highlight: RecapCommunityHighlight) {
  return games.find((item) => item.id === highlight.gameId);
}

/**
 * Story 4 — "Opinião minoritária": the user's rating against the community in
 * the game where they went against the majority, plus the in-tune highlight
 * when the Recap stored one (frame `5413:945`).
 */
export function RecapStoryCommunity({ recap, games, locale }: Props) {
  const { t } = useTranslation();
  const minority = recap.communityHighlights?.minority;
  if (!minority) return null;

  const minorityGame = findGame(games, minority);
  const inTune = recap.communityHighlights?.inTune ?? null;
  const inTuneGame = inTune ? findGame(games, inTune) : undefined;

  const minorityRating = formatRating(minority.userRating, locale) ?? "";
  const minorityAverage = formatRating(minority.communityAverage, locale) ?? "";
  const inTuneRating = inTune
    ? (formatRating(inTune.userRating, locale) ?? "")
    : "";
  const inTuneAverage = inTune
    ? (formatRating(inTune.communityAverage, locale) ?? "")
    : "";
  const sameRangeCount = inTune
    ? (formatNumber(inTune.sameRangeCount, locale) ?? "")
    : "";
  const beyondPercentage = formatPercentage(minority.beyondShare, locale);
  const beyondRating = formatRating(minority.userRating, locale, {
    maximumFractionDigits: 0,
  });

  return (
    <RecapStoryFrame
      storyId={"community"}
      eyebrow={t("recap.stories.community.eyebrow")}
    >
      <div style={at(64, 200, 952)}>
        <div style={displayStyle(94)}>
          {minorityGame
            ? t("recap.stories.community.title", {
                game: minorityGame.name,
              })
            : t("recap.stories.community.titleNoGame")}
        </div>
      </div>

      <div
        style={{
          ...at(64, 520, 952),
          display: "flex",
          gap: 36,
        }}
      >
        <HighlightCard
          value={minorityRating}
          label={t("recap.stories.community.yourRating")}
        />
        <HighlightCard
          value={minorityAverage}
          label={t("recap.stories.community.average")}
        />
      </div>

      {beyondPercentage && beyondRating && (
        <div style={at(64, 800, 952)}>
          <div style={displayStyle(48, RECAP_COLORS.cream, 600)}>
            {t("recap.stories.community.beyond", {
              percentage: beyondPercentage,
              rating: beyondRating,
            })}
          </div>
        </div>
      )}

      {inTune && (
        <>
          <div
            aria-hidden
            style={{
              ...at(64, 950, 952),
              height: 2,
              background: RECAP_COLORS.hairline,
            }}
          />
          <div style={at(64, 1010, 952)}>
            <div style={displayStyle(46, RECAP_COLORS.cream, 600)}>
              {inTuneGame
                ? t("recap.stories.community.inTuneTitle", {
                    game: inTuneGame.name,
                    userRating: inTuneRating,
                    average: inTuneAverage,
                  })
                : t("recap.stories.community.sameRange", {
                    count: sameRangeCount,
                  })}
            </div>
            {inTuneGame && (
              <div
                style={{
                  ...displayStyle(40, RECAP_COLORS.muted, 500),
                  marginTop: 12,
                }}
              >
                {t("recap.stories.community.sameRange", {
                  count: sameRangeCount,
                })}
              </div>
            )}
          </div>
        </>
      )}

      <div
        style={{
          ...at(64, 1220, 952),
          display: "flex",
          gap: 24,
        }}
      >
        <CoverWithName game={minorityGame} name={minorityGame?.name ?? ""} />
        {inTune && (
          <CoverWithName game={inTuneGame} name={inTuneGame?.name ?? ""} />
        )}
      </div>
    </RecapStoryFrame>
  );
}
