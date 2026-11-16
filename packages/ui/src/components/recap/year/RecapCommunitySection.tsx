import {
  formatNumber,
  formatPercentage,
  formatRating,
  formatRatingCompact,
  useFormatLocale,
} from "#@/components/events/util/format";
import { useGames } from "#@/components/game/hooks/useGames";
import type {
  RecapCommunityHighlight,
  YearRecap,
} from "#@/components/recap/types";
import { Paper, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { useTranslation } from "@repo/locales";

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
 * "You vs. the GameNode community" (frame 5419:941). Both cards are optional
 * and an old Recap has `communityHighlights: null`, which hides the section.
 */
export function RecapCommunitySection({ recap }: RecapCommunitySectionProps) {
  const { t } = useTranslation();
  const locale = useFormatLocale();
  const highlights = recap.communityHighlights;
  const gameIds = getGameIds(highlights);
  const gamesQuery = useGames({ gameIds }, false, "off");

  if (!highlights || (!highlights.minority && !highlights.inTune)) {
    return null;
  }

  const gameName = (gameId: number) =>
    gamesQuery.data?.find((game) => game.id === gameId)?.name;

  const minority = highlights.minority;
  const inTune = highlights.inTune;
  const minorityGame = minority ? gameName(minority.gameId) : undefined;

  return (
    <Paper
      data-testid={"recap-community"}
      withBorder
      radius={"lg"}
      p={{ base: "md", md: "xl" }}
      className={"bg-paper-8"}
    >
      <Stack gap={"lg"}>
        <Stack gap={4}>
          <Title order={2} size={"h2"}>
            {t("recap.page.community.title")}
          </Title>
          {minorityGame && (
            <Text size={"sm"} c={"dimmed"}>
              {t("recap.page.community.divided", { game: minorityGame })}
            </Text>
          )}
        </Stack>
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing={"md"}>
          {minority && (
            <CommunityCard
              title={t("recap.page.community.minority")}
              highlight={minority}
              gameName={minorityGame}
              note={t("recap.page.community.beyond", {
                percent: formatPercentage(minority.beyondShare, locale) ?? "0%",
                rating: formatRatingCompact(minority.userRating, locale) ?? "0",
              })}
            />
          )}
          {inTune && (
            <CommunityCard
              title={t("recap.page.community.inTune")}
              highlight={inTune}
              gameName={gameName(inTune.gameId)}
              note={t("recap.page.community.sameTone", {
                count: formatNumber(inTune.sameRangeCount, locale) ?? "0",
              })}
            />
          )}
        </SimpleGrid>
      </Stack>
    </Paper>
  );
}

function CommunityCard({
  title,
  highlight,
  gameName,
  note,
}: {
  title: string;
  highlight: RecapCommunityHighlight;
  gameName: string | undefined;
  note: string;
}) {
  const { t } = useTranslation();
  const locale = useFormatLocale();
  const userRating = formatRating(highlight.userRating, locale) ?? "0.0";
  const communityAverage =
    formatRating(highlight.communityAverage, locale) ?? "0.0";

  return (
    <div className={"flex flex-col gap-2 rounded-md bg-paper-4 p-4"}>
      <Text size={"xs"} c={"dimmed"} className={"uppercase tracking-wide"}>
        {title}
      </Text>
      {gameName && (
        <Text size={"md"} fw={700}>
          {gameName}
        </Text>
      )}
      <div className={"flex gap-6"}>
        <Stack gap={0}>
          <Text size={"xs"} c={"dimmed"}>
            {t("recap.page.community.youLabel")}
          </Text>
          <Text size={"lg"} fw={800}>
            {userRating}
          </Text>
        </Stack>
        <Stack gap={0}>
          <Text size={"xs"} c={"dimmed"}>
            {t("recap.page.community.averageLabel")}
          </Text>
          <Text size={"lg"} fw={800}>
            {communityAverage}
          </Text>
        </Stack>
      </div>
      <Text size={"sm"} c={"dimmed"}>
        {note}
      </Text>
    </div>
  );
}
