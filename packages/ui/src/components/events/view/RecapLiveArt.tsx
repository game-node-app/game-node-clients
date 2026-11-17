import { cn } from "#@/util";
import { Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { RecapMonthlyBars } from "./RecapMonthlyBars";

export interface RecapLiveArtProps {
  hours: string | null;
  gamesCount: string | null;
  monthlyPlaytimeSeconds: number[] | null | undefined;
  year: number;
  /** Stretches to the art column and pins the bars to the bottom (Half). */
  fill?: boolean;
  className?: string;
}

/**
 * Numbers of the live Retrospectiva card (frame `5444:2135`): the 52 px hours
 * figure, its "em N jogos · até hoje" caption and the monthly strip.
 */
export function RecapLiveArt({
  hours,
  gamesCount,
  monthlyPlaytimeSeconds,
  year,
  fill = false,
  className,
}: RecapLiveArtProps) {
  const { t } = useTranslation();

  return (
    <div
      data-testid={"recap-live-art"}
      className={cn(
        "flex flex-col gap-4",
        fill && "h-full justify-between",
        className,
      )}
    >
      <div>
        {hours && (
          <Text
            fz={52}
            fw={700}
            lh={1}
            className={"tracking-[-0.03em] text-white"}
          >
            {t("events.card.recap.hours", { hours })}
          </Text>
        )}
        {gamesCount && (
          <Text
            fz={12}
            fw={500}
            lh={"normal"}
            className={"ml-0.5 mt-1.5 text-nav-muted"}
          >
            {t("events.card.recap.liveGames", { games: gamesCount })}
          </Text>
        )}
      </div>
      <RecapMonthlyBars values={monthlyPlaytimeSeconds} year={year} />
    </div>
  );
}
