import {
  formatPercentage,
  formatPlaytimeHours,
  useFormatLocale,
} from "#@/components/events/util/format";
import type { YearRecap } from "#@/components/recap/types";
import { RecapSurface } from "#@/components/recap/year/RecapSection";
import {
  getRecapDistributionShares,
  getRecapPlatformMap,
} from "#@/components/recap/year/util/recapYear";
import { useTranslation } from "@repo/locales";

export interface RecapGenresPlatformsSectionProps {
  recap: YearRecap;
}

/** Genre segments, from the design: brand tones, then neutrals. */
// theme-exempt: recap chart artwork palette
const GENRE_COLORS = ["#f15025", "#f7896d", "#ffd9cf", "#adadad", "#808080"];
/** Platform segments and percentages, from the design: white, then greys. */
// theme-exempt: recap chart artwork palette
const PLATFORM_COLORS = ["#ffffff", "#adadad", "#808080"];
/** Extra genres past the design's five share the last neutral. */
const colorAt = (colors: string[], index: number) =>
  colors[Math.min(index, colors.length - 1)]!;

export function hasRecapDistribution(recap: YearRecap): boolean {
  return (
    getRecapDistributionShares(recap.distributionByGenre).length > 0 ||
    recap.playtimeByPlatform.some((entry) => entry.share > 0)
  );
}

/**
 * "Genres" and "Platforms" cards of frame 5419:941. Genres are library counts
 * (percentages derived from `count`); platforms are playtime shares, so the two
 * bars never mix counts with hours.
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
    <div
      data-testid={"recap-genres-platforms"}
      className={"grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6"}
    >
      {genres.length > 0 && (
        <RecapSurface
          data-testid={"recap-genres"}
          className={"flex flex-col gap-8 md:p-8"}
        >
          <CardLabel>{t("recap.page.genres.title")}</CardLabel>
          <SegmentedBar
            segments={genres.map((genre, index) => ({
              key: genre.name,
              share: genre.share,
              color: colorAt(GENRE_COLORS, index),
            }))}
          />
          <ul className={"m-0 flex list-none flex-wrap gap-x-5 gap-y-3 p-0"}>
            {genres.map((genre, index) => (
              <li key={genre.name} className={"flex items-center gap-2"}>
                <span
                  aria-hidden
                  className={"size-2.5 shrink-0 rounded-[3px]"}
                  style={{ backgroundColor: colorAt(GENRE_COLORS, index) }}
                />
                <span className={"text-sm text-white"}>{genre.name}</span>
                <span
                  className={
                    "text-xs font-bold tracking-[0.06em] text-[#808080]"
                  }
                >
                  {formatPercentage(genre.share, locale) ?? "0%"}
                </span>
              </li>
            ))}
          </ul>
        </RecapSurface>
      )}

      {platforms.length > 0 && (
        <RecapSurface
          data-testid={"recap-platforms"}
          className={"flex flex-col gap-8 md:p-8"}
        >
          <CardLabel>{t("recap.page.genres.platformsTitle")}</CardLabel>
          <SegmentedBar
            segments={platforms.map((entry, index) => ({
              key: String(entry.platform),
              share: entry.share,
              color: colorAt(PLATFORM_COLORS, index),
            }))}
          />
          <ul className={"m-0 flex list-none flex-wrap gap-x-8 gap-y-4 p-0"}>
            {platforms.map((entry, index) => {
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
                <li key={entry.platform} className={"flex flex-col gap-1"}>
                  <span
                    className={
                      "text-4xl leading-10 font-bold tracking-[-0.01em]"
                    }
                    style={{ color: colorAt(PLATFORM_COLORS, index) }}
                  >
                    {formatPercentage(entry.share, locale) ?? "0%"}
                  </span>
                  <span className={"text-sm text-[#adadad]"}>
                    {t("recap.page.genres.platformDetail", {
                      name,
                      hours: hours ?? "0",
                    })}
                  </span>
                </li>
              );
            })}
          </ul>
        </RecapSurface>
      )}
    </div>
  );
}

function CardLabel({ children }: { children: string }) {
  return (
    <h3
      className={
        "m-0 text-xs leading-none font-bold tracking-[0.06em] text-[#adadad] uppercase"
      }
    >
      {children}
    </h3>
  );
}

function SegmentedBar({
  segments,
}: {
  segments: { key: string; share: number; color: string }[];
}) {
  return (
    <div className={"flex h-7 w-full gap-0.5 overflow-hidden rounded-md"}>
      {segments.map((segment) => (
        <div
          key={segment.key}
          className={"min-w-1 rounded-[3px]"}
          style={{
            flexGrow: Math.max(0.01, segment.share),
            flexBasis: 0,
            backgroundColor: segment.color,
          }}
        />
      ))}
    </div>
  );
}
