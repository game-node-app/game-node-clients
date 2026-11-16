import { UserAvatar } from "#@/components/general/avatar/UserAvatar";
import { useGames } from "#@/components/game/hooks/useGames";
import { useUserProfile } from "#@/components/profile/hooks/useUserProfile";
import type { RecapPhase, YearRecap } from "#@/components/recap/types";
import { RecapNodesChart } from "#@/components/recap/year/RecapNodesChart";
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
import { Badge, Button, Group, Stack, Text, Title } from "@mantine/core";
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

  return (
    <Stack data-testid={"recap-hero"} gap={"lg"}>
      <Group justify={"space-between"} align={"flex-start"} wrap={"nowrap"}>
        <Stack gap={4} className={"min-w-0 flex-1"}>
          <Text size={"sm"} c={"dimmed"} className={"uppercase tracking-wide"}>
            {username
              ? t("recap.page.hero.eyebrowUser", { year, username })
              : t("recap.page.hero.eyebrow", { year })}
          </Text>
          <Title order={1} className={"text-4xl md:text-6xl font-black"}>
            {t("recap.page.hero.hours", { hours })}
          </Title>
          <Text size={"md"} c={"dimmed"}>
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
          </Text>
        </Stack>
        <UserAvatar
          userId={recap.profileUserId}
          size={56}
          radius={"xl"}
          className={"shrink-0"}
        />
      </Group>

      <Group gap={"sm"} wrap={"wrap"}>
        <Button leftSection={<IconShare size={16} />} onClick={onShare}>
          {t("recap.page.hero.share")}
        </Button>
        <Button
          component={Link}
          href={getRecapStoriesHref(year, recap.profileUserId)}
          variant={"default"}
        >
          {t("recap.page.hero.stories")}
        </Button>
      </Group>

      <Stack gap={4}>
        <Group justify={"space-between"} align={"center"} gap={"xs"}>
          <Title order={2} size={"h3"}>
            {chartTitle}
          </Title>
          {isLive && today && (
            <Badge
              data-testid={"recap-hero-today"}
              color={"brand"}
              variant={"light"}
            >
              {t("recap.page.hero.today", { date: today })}
            </Badge>
          )}
        </Group>
        <RecapNodesChart
          year={year}
          topGames={topGames}
          games={gamesQuery.data}
          label={chartTitle}
          gameLabel={gameLabel}
        />
        <Group justify={"space-between"} gap={"xs"} wrap={"wrap"}>
          <Text size={"xs"} c={"dimmed"}>
            {t("recap.page.hero.chartSize")}
          </Text>
          {isLive && (
            <Text data-testid={"recap-hero-updates"} size={"xs"} c={"dimmed"}>
              {t("recap.page.hero.updates")}
            </Text>
          )}
        </Group>
      </Stack>
    </Stack>
  );
}
