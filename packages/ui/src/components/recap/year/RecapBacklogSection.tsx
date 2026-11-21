import {
  formatNumber,
  useFormatLocale,
} from "#@/components/events/util/format";
import { RecapGoalCard } from "#@/components/recap/goal/RecapGoalCard";
import type { YearRecap } from "#@/components/recap/types";
import { RecapAwardsCard } from "#@/components/recap/year/RecapAwardsCard";
import {
  RecapEyebrow,
  RecapHeading,
  RecapLead,
  RecapSection,
} from "#@/components/recap/year/RecapSection";
import { cn } from "#@/util";
import { useTranslation } from "@repo/locales";

export interface RecapBacklogSectionProps {
  year: number;
  recap: YearRecap;
  /** Owner of the Recap; the Awards card and the goal need the signed-in owner. */
  userId: string;
}

/** Most squares drawn; bigger libraries are scaled down proportionally. */
const MAX_UNITS = 156;

type BacklogUnit = "finished" | "dropped" | "queued";

const UNIT_STYLES: Record<BacklogUnit, string> = {
  finished: "bg-state-played",
  dropped: "bg-line-strong",
  queued: "border border-line",
};

function buildUnits(counts: Record<BacklogUnit, number>): BacklogUnit[] {
  const total = counts.finished + counts.dropped + counts.queued;
  const scale = total > MAX_UNITS ? MAX_UNITS / total : 1;
  const units: BacklogUnit[] = [];

  for (const unit of ["finished", "dropped", "queued"] as const) {
    const amount =
      counts[unit] > 0 ? Math.max(1, Math.round(counts[unit] * scale)) : 0;
    for (let index = 0; index < amount; index++) units.push(unit);
  }

  return units;
}

/**
 * "Backlog and next step" (frame 5420:945): added/finished/growth, a unit chart
 * (one square per game: finished, dropped, still queued), the optional ballot
 * shortcut and the goal card. The growth sentence is omitted when
 * `backlogGrowth` is 0.
 */
export function RecapBacklogSection({
  year,
  recap,
  userId,
}: RecapBacklogSectionProps) {
  const { t } = useTranslation();
  const locale = useFormatLocale();
  const number = (value: number) => formatNumber(value, locale) ?? "0";

  const counts = {
    finished: Math.max(0, recap.totalFinishedGames),
    dropped: Math.max(0, recap.totalDroppedGames),
    queued: Math.max(0, recap.backlogGrowth),
  };
  const units = buildUnits(counts);

  return (
    <RecapSection data-testid={"recap-backlog"}>
      <RecapEyebrow>{t("recap.page.backlog.title")}</RecapEyebrow>
      <RecapHeading className={"mt-4"}>
        {t("recap.page.backlog.summary", {
          added: number(recap.totalAddedGames),
          finished: number(recap.totalFinishedGames),
        })}
      </RecapHeading>
      {recap.backlogGrowth > 0 && (
        <RecapLead className={"mt-3"}>
          {t("recap.page.backlog.growth", {
            count: number(recap.backlogGrowth),
          })}
        </RecapLead>
      )}

      {units.length > 0 && (
        <div className={"mt-8 md:mt-12"}>
          <div
            data-testid={"recap-backlog-units"}
            role={"img"}
            aria-label={t("recap.page.backlog.unitsLabel", {
              finished: number(counts.finished),
              dropped: number(counts.dropped),
              queued: number(counts.queued),
            })}
            className={"flex flex-wrap gap-1.5 md:gap-2"}
          >
            {units.map((unit, index) => (
              <span
                key={index}
                data-unit={unit}
                className={cn(
                  "size-6 rounded-md md:size-[38px] md:rounded-[10px]",
                  UNIT_STYLES[unit],
                )}
              />
            ))}
          </div>
          <ul
            className={
              "m-0 mt-4 flex list-none flex-wrap gap-x-6 gap-y-2 p-0 text-sm text-dimmed-2"
            }
          >
            {(["finished", "dropped", "queued"] as const).map((unit) => (
              <li key={unit} className={"flex items-center gap-2"}>
                <span
                  aria-hidden
                  className={cn("size-3 rounded-[3px]", UNIT_STYLES[unit])}
                />
                <span>
                  {number(counts[unit])} {t(`recap.page.backlog.${unit}`)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div
        className={
          "mt-10 grid grid-cols-1 gap-4 md:mt-12 md:grid-cols-2 md:gap-6"
        }
      >
        <RecapAwardsCard year={year} userId={userId} />
        <RecapGoalCard
          year={year}
          userId={userId}
          finishedGames={recap.totalFinishedGames}
        />
      </div>
    </RecapSection>
  );
}
