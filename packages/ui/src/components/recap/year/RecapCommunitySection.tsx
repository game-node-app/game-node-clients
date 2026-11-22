import {
  formatNumber,
  formatPercentage,
  formatRating,
  formatRatingCompact,
  useFormatLocale,
} from "#@/components/events/util/format";
import { useGames } from "#@/components/game/hooks/useGames";
import {
  GAME_COVER_PLACEHOLDER,
  useGameCoverImage,
} from "#@/components/game/hooks/useGameCoverImage";
import { ImageSize } from "#@/components/game/util/getSizedImageUrl";
import type {
  RecapCommunityHighlight,
  YearRecap,
} from "#@/components/recap/types";
import {
  hasRecapDistribution,
  RecapGenresPlatformsSection,
} from "#@/components/recap/year/RecapGenresPlatformsSection";
import {
  RecapEyebrow,
  RecapHeading,
  RecapSection,
  RecapSurface,
} from "#@/components/recap/year/RecapSection";
import { cn } from "#@/util";
import { useTranslation } from "@repo/locales";
import type { Game } from "@repo/wrapper/server";

export interface RecapCommunitySectionProps {
  recap: YearRecap;
}

function getGameIds(highlights: YearRecap["communityHighlights"]): number[] {
  if (!highlights) return [];

  return [highlights.minority?.gameId, highlights.inTune?.gameId].filter(
    (gameId): gameId is number => gameId != null,
  );
}

/**
 * "You vs. the GameNode community" (frame 5419:941): the minority/in-tune
 * cards with a score track, followed by the genre and platform cards. Both
 * highlight cards are optional and an old Recap has `communityHighlights:
 * null`; the section is omitted when there is nothing to show at all.
 */
export function RecapCommunitySection({ recap }: RecapCommunitySectionProps) {
  const { t } = useTranslation();
  const locale = useFormatLocale();
  const highlights = recap.communityHighlights;
  const gameIds = getGameIds(highlights);
  const gamesQuery = useGames(
    { gameIds, relations: { cover: true } },
    false,
    "off",
  );

  const hasHighlights =
    !!highlights && (!!highlights.minority || !!highlights.inTune);
  const hasDistribution = hasRecapDistribution(recap);

  if (!hasHighlights && !hasDistribution) {
    return null;
  }

  const findGame = (gameId: number) =>
    gamesQuery.data?.find((game) => game.id === gameId);
  const minority = highlights?.minority ?? null;
  const inTune = highlights?.inTune ?? null;
  const minorityGame = minority ? findGame(minority.gameId)?.name : undefined;

  return (
    <RecapSection data-testid={"recap-community-section"}>
      <RecapEyebrow>{t("recap.page.community.title")}</RecapEyebrow>
      {minorityGame && (
        <RecapHeading className={"mt-4"}>
          {t("recap.page.community.divided", { game: minorityGame })}
        </RecapHeading>
      )}

      <div className={"mt-8 flex flex-col gap-4 md:mt-12 md:gap-6"}>
        {hasHighlights && (
          <div
            data-testid={"recap-community"}
            className={"grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6"}
          >
            {minority && (
              <CommunityCard
                tone={"minority"}
                badge={t("recap.page.community.minority")}
                highlight={minority}
                game={findGame(minority.gameId)}
                note={t("recap.page.community.beyond", {
                  percent:
                    formatPercentage(minority.beyondShare, locale) ?? "0%",
                  rating:
                    formatRatingCompact(minority.userRating, locale) ?? "0",
                })}
              />
            )}
            {inTune && (
              <CommunityCard
                tone={"inTune"}
                badge={t("recap.page.community.inTune")}
                highlight={inTune}
                game={findGame(inTune.gameId)}
                note={t("recap.page.community.sameTone", {
                  count: formatNumber(inTune.sameRangeCount, locale) ?? "0",
                })}
              />
            )}
          </div>
        )}
        {hasDistribution && <RecapGenresPlatformsSection recap={recap} />}
      </div>
    </RecapSection>
  );
}

const TONES = {
  minority: {
    badge: "bg-brand/15 text-brand-3",
    dot: "bg-brand-3",
  },
  inTune: {
    badge: "bg-[#4fd1a5]/15 text-[#4fd1a5]",
    dot: "bg-[#4fd1a5]",
  },
} as const;

function CommunityCard({
  tone,
  badge,
  highlight,
  game,
  note,
}: {
  tone: keyof typeof TONES;
  badge: string;
  highlight: RecapCommunityHighlight;
  game: Game | undefined;
  note: string;
}) {
  const { t } = useTranslation();
  const locale = useFormatLocale();
  const { src, onError } = useGameCoverImage(game, ImageSize.COVER_BIG_2X);
  const userRating = formatRating(highlight.userRating, locale) ?? "0.0";
  const communityAverage =
    formatRating(highlight.communityAverage, locale) ?? "0.0";

  // Ratings are 0–5; keep the labels inside the track near its ends.
  const position = (rating: number) =>
    `${Math.min(100, Math.max(0, (rating / 5) * 100))}%`;
  const labelPosition = (rating: number) =>
    `${Math.min(88, Math.max(12, (rating / 5) * 100))}%`;

  return (
    <RecapSurface
      className={
        "flex flex-col gap-5 p-5 sm:flex-row sm:items-stretch sm:gap-7 md:p-8"
      }
    >
      <img
        src={src ?? GAME_COVER_PLACEHOLDER}
        onError={onError}
        alt={game?.name ?? ""}
        className={
          "h-[224px] w-[168px] shrink-0 self-center rounded-lg object-cover sm:self-start"
        }
      />
      <div className={"flex min-w-0 flex-1 flex-col"}>
        <span
          className={cn(
            "inline-flex w-fit items-center gap-1.5 rounded-md px-2 py-1 text-[11px] leading-none font-bold tracking-[0.06em] uppercase",
            TONES[tone].badge,
          )}
        >
          <span
            aria-hidden
            className={cn("size-1.5 rounded-full", TONES[tone].dot)}
          />
          {badge}
        </span>
        {game && (
          <span
            className={"mt-3 text-2xl leading-8 font-medium text-foreground"}
          >
            {game.name}
          </span>
        )}

        <div className={"mt-6 flex flex-col gap-1.5"}>
          <div className={"relative h-3"}>
            <span
              className={
                "absolute top-0 -translate-x-1/2 text-xs leading-3 font-bold tracking-[0.06em] whitespace-nowrap text-brand uppercase"
              }
              style={{ left: labelPosition(highlight.userRating) }}
            >
              {t("recap.page.community.youLabel")} <span>{userRating}</span>
            </span>
          </div>
          <div className={"relative h-3"}>
            <div
              className={
                "absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-[#262626]"
              }
            />
            <span
              className={
                "absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#adadad]"
              }
              style={{ left: position(highlight.communityAverage) }}
            />
            <span
              className={
                "absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand"
              }
              style={{ left: position(highlight.userRating) }}
            />
          </div>
          <div className={"relative h-3"}>
            <span
              className={
                "absolute top-0 -translate-x-1/2 text-xs leading-3 font-bold tracking-[0.06em] whitespace-nowrap text-[#adadad] uppercase"
              }
              style={{ left: labelPosition(highlight.communityAverage) }}
            >
              {t("recap.page.community.averageLabel")}{" "}
              <span>{communityAverage}</span>
            </span>
          </div>
        </div>

        <p className={"m-0 mt-6 text-sm leading-normal text-[#adadad]"}>
          {note}
        </p>
      </div>
    </RecapSurface>
  );
}
