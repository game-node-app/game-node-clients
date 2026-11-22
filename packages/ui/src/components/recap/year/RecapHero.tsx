import { useGames } from "#@/components/game/hooks/useGames";
import { useUserProfile } from "#@/components/profile/hooks/useUserProfile";
import type { RecapPhase, YearRecap } from "#@/components/recap/types";
import { RecapNodesChart } from "#@/components/recap/year/RecapNodesChart";
import { RecapEyebrow, RecapLead } from "#@/components/recap/year/RecapSection";
import {
  formatNumber,
  formatPlaytimeHours,
  formatUtcDate,
  useFormatLocale,
} from "#@/components/events/util/format";
import {
  getRecapShareUrl,
  getRecapStoriesHref,
} from "#@/components/recap/year/util/recapYear";
import { useShareText } from "#@/context/UIProvider";
import { createErrorNotification, Link } from "#@/util";
import { Button } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { IconShare } from "@tabler/icons-react";

export interface RecapHeroProps {
  year: number;
  recap: YearRecap;
  /** Server-computed phase of the year; the live marker needs `live`. */
  phase: RecapPhase;
}

/**
 * Top section of the Recap (frame 5415:923): owner identity, the year totals,
 * the share/stories actions and the node chart. The "Hoje" marker and the
 * daily-update note belong to a live, non-final Recap.
 */
export function RecapHero({ year, recap, phase }: RecapHeroProps) {
  const { t } = useTranslation();
  const locale = useFormatLocale();
  const shareText = useShareText();
  const profile = useUserProfile(recap.profileUserId);
  const username = profile.data?.username;

  const topGames = recap.topGames;
  const gamesQuery = useGames(
    {
      gameIds: topGames.map((topGame) => topGame.gameId),
      relations: { cover: true },
    },
    false,
    "off",
  );

  const hours = formatPlaytimeHours(recap.totalPlaytimeSeconds, locale) ?? "0";
  const finishedGames = formatNumber(recap.totalFinishedGames, locale) ?? "0";
  const isLive = phase === "live" && !recap.isFinal;
  const today = formatUtcDate(recap.updatedAt, locale, {
    day: "numeric",
    month: "short",
  });

  const gameLabel = (gameId: number) =>
    gamesQuery.data?.find((game) => game.id === gameId)?.name ??
    t("recap.page.topGames.gameFallback", { id: gameId });

  const chartTitle = t("recap.page.hero.chartTitle", {
    count: topGames.length,
  });

  const onShare = async () => {
    try {
      const url = getRecapShareUrl(year, recap.profileUserId);
      const text = `${t("recap.page.hero.shareText", {
        year,
        username: username ?? "",
      })} ${url}`;
      await shareText(text);
    } catch (error) {
      createErrorNotification(
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };

  const title = t("recap.page.hero.hours", { hours });
  const hoursIndex = title.indexOf(hours);

  return (
    <section
      data-testid={"recap-hero"}
      className={"flex w-full flex-col pt-8 md:pt-12"}
    >
      <RecapEyebrow>
        {username
          ? t("recap.page.hero.eyebrowUser", { year, username })
          : t("recap.page.hero.eyebrow", { year })}
      </RecapEyebrow>

      <h1 className="m-0 mt-4 text-5xl leading-[1.05] font-bold tracking-[-0.02em] text-foreground md:text-[64px] md:leading-[72px]">
        {hoursIndex >= 0 ? (
          <>
            {title.slice(0, hoursIndex)}
            <span className={"text-brand"}>{hours}</span>
            {title.slice(hoursIndex + hours.length)}
          </>
        ) : (
          title
        )}
      </h1>

      <div
        className={
          "mt-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-12"
        }
      >
        <RecapLead className={"max-w-[680px] text-lg md:text-xl"}>
          {username
            ? t("recap.page.hero.summaryNamed", {
                name: username,
                games: topGames.length,
                finished: finishedGames,
              })
            : t("recap.page.hero.summary", {
                games: topGames.length,
                finished: finishedGames,
              })}
        </RecapLead>

        <div className={"flex shrink-0 flex-wrap gap-3"}>
          <Button
            size={"md"}
            radius={"md"}
            leftSection={<IconShare size={16} />}
            onClick={onShare}
          >
            {t("recap.page.hero.share")}
          </Button>
          <Button
            size={"md"}
            radius={"md"}
            component={Link}
            href={getRecapStoriesHref(year, recap.profileUserId)}
            variant={"default"}
          >
            {t("recap.page.hero.stories")}
          </Button>
        </div>
      </div>

      <div className={"mt-10 flex flex-col gap-4 md:mt-14"}>
        <div
          className={
            "flex flex-wrap items-center justify-between gap-x-6 gap-y-2"
          }
        >
          <h2
            className={
              "m-0 text-xs leading-none font-bold tracking-[0.06em] text-muted uppercase"
            }
          >
            {chartTitle}
          </h2>
          <div className={"flex flex-wrap items-center gap-x-5 gap-y-1"}>
            <div className={"flex items-center gap-2"}>
              <span
                aria-hidden={"true"}
                className={"size-2.5 shrink-0 rounded-full bg-brand"}
              />
              <span className={"text-sm text-muted"}>
                {t("recap.page.hero.chartSize")}
              </span>
            </div>
            {isLive && (
              <div className={"flex items-center gap-2"}>
                <span
                  aria-hidden={"true"}
                  className={"h-3 w-0.5 shrink-0 bg-muted"}
                />
                <span
                  data-testid={"recap-hero-updates"}
                  className={"text-sm text-muted"}
                >
                  {t("recap.page.hero.updates")}
                </span>
              </div>
            )}
          </div>
        </div>
        <RecapNodesChart
          year={year}
          topGames={topGames}
          games={gamesQuery.data}
          label={chartTitle}
          gameLabel={gameLabel}
          today={isLive ? recap.updatedAt : null}
          todayLabel={
            isLive && today ? t("recap.page.hero.today", { date: today }) : null
          }
        />
      </div>
    </section>
  );
}
