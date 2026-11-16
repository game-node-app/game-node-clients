import {
  formatPercentage,
  formatPlaytimeHours,
  useFormatLocale,
} from "#@/components/events/util/format";
import type { YearRecap } from "#@/components/recap/types";
import {
  getRecapDistributionShares,
  getRecapPlatformMap,
} from "#@/components/recap/year/util/recapYear";
import { Paper, Stack, Text, Title } from "@mantine/core";
import { useTranslation } from "@repo/locales";

export interface RecapGenresPlatformsSectionProps {
  recap: YearRecap;
}

/** Fixed palette so the stacked bars stay readable without a chart library. */
const DISTRIBUTION_COLORS = [
  "#F15025",
  "#F7896D",
  "#FBB3A0",
  "#872C13",
  "#ADADAD",
  "#6A6A6A",
  "#D9D9D9",
  "#3A3A3A",
];

/**
 * "Genres" and "Platforms" of frame 5419:941 as stacked bars. Genres are
 * library counts (percentages derived from `count`); platforms are playtime
 * shares, so the two bars never mix counts with hours.
 */
export function RecapGenresPlatformsSection({
  recap,
}: RecapGenresPlatformsSectionProps) {
  const { t } = useTranslation();
  const locale = useFormatLocale();
  const genres = getRecapDistributionShares(recap.distributionByGenre);
  const platformMap = getRecapPlatformMap(recap);
  const platforms = recap.playtimeByPlatform.filter((entry) => entry.share > 0);

  if (genres.length === 0 && platforms.length === 0) return null;

  return (
    <Paper
      data-testid={"recap-genres-platforms"}
      withBorder
      radius={"lg"}
      p={{ base: "md", md: "xl" }}
      className={"bg-paper-8"}
    >
      <Stack gap={"xl"}>
        {genres.length > 0 && (
          <Stack gap={"sm"} data-testid={"recap-genres"}>
            <Title order={3} size={"h4"}>
              {t("recap.page.genres.title")}
            </Title>
            <StackedBar
              segments={genres.map((genre, index) => ({
                key: genre.name,
                share: genre.share,
                color: DISTRIBUTION_COLORS[index % DISTRIBUTION_COLORS.length]!,
              }))}
            />
            <div className={"grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2"}>
              {genres.map((genre, index) => (
                <div
                  key={genre.name}
                  className={"flex items-center justify-between gap-3"}
                >
                  <div className={"flex min-w-0 items-center gap-2"}>
                    <span
                      aria-hidden
                      className={"inline-block size-2.5 shrink-0 rounded-sm"}
                      style={{
                        backgroundColor:
                          DISTRIBUTION_COLORS[
                            index % DISTRIBUTION_COLORS.length
                          ],
                      }}
                    />
                    <Text size={"sm"} className={"truncate"}>
                      {genre.name}
                    </Text>
                  </div>
                  <Text size={"sm"} c={"dimmed"}>
                    {formatPercentage(genre.share, locale) ?? "0%"}
                  </Text>
                </div>
              ))}
            </div>
          </Stack>
        )}

        {platforms.length > 0 && (
          <Stack gap={"sm"} data-testid={"recap-platforms"}>
            <Title order={3} size={"h4"}>
              {t("recap.page.genres.platformsTitle")}
            </Title>
            <StackedBar
              segments={platforms.map((entry, index) => ({
                key: String(entry.platform),
                share: entry.share,
                color: DISTRIBUTION_COLORS[index % DISTRIBUTION_COLORS.length]!,
              }))}
            />
            <Stack gap={4}>
              {platforms.map((entry) => {
                const name =
                  platformMap.get(entry.platform)?.name ??
                  t("recap.page.genres.unknownPlatform", {
                    id: entry.platform,
                  });
                const hours = formatPlaytimeHours(
                  entry.totalPlaytimeSeconds,
                  locale,
                );

                return (
                  <div
                    key={entry.platform}
                    className={
                      "flex flex-wrap items-baseline justify-between gap-x-3"
                    }
                  >
                    <Text size={"sm"}>{name}</Text>
                    <Text size={"sm"} c={"dimmed"}>
                      {t("recap.page.genres.platformValue", {
                        percent: formatPercentage(entry.share, locale) ?? "0%",
                        hours: hours ?? "0",
                      })}
                    </Text>
                  </div>
                );
              })}
            </Stack>
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}

function StackedBar({
  segments,
}: {
  segments: { key: string; share: number; color: string }[];
}) {
  return (
    <div className={"flex h-3 w-full overflow-hidden rounded-full bg-paper-4"}>
      {segments.map((segment) => (
        <div
          key={segment.key}
          style={{
            width: `${Math.max(1, segment.share * 100)}%`,
            backgroundColor: segment.color,
          }}
        />
      ))}
    </div>
  );
}
