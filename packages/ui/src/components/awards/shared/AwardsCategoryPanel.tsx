import { cn } from "#@/util";
import { Stack, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { useState, type ReactNode } from "react";
import {
  AwardsNomineeCard,
  type AwardsNomineeCardProps,
} from "./AwardsNomineeCard";
import { formatCategoryNumber } from "./AwardsCategoryList";
import { AwardsSegmentedControl } from "./AwardsSegmentedControl";
import { useAwardsMobileLayout } from "./useAwardsMobileLayout";

type AwardsCategoryFilter = "all" | "played";

export interface AwardsCategoryPanelProps {
  /** Zero-based position of the category in the display order. */
  index: number;
  /** Number of categories in the display order. */
  total: number;
  /** Localized text; callers resolve it with `useAwardsCategoryText`. */
  name: string;
  description?: string | null;
  /** Nominee cards, already hydrated. Empty for the personal GOTY category. */
  nominees?: AwardsNomineeCardProps[];
  /** Played count from the ballot category; derived from the cards when null. */
  playedNomineesCount?: number | null;
  /**
   * Shows the "Todos / Que joguei" segmented filter. Defaults to true only when
   * the cards carry a nominee status (i.e. the ballot, not nominations).
   */
  showPlayedFilter?: boolean;
  /** Extra content below the grid, e.g. the eligible-game search. */
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

/**
 * Category panel from the ballot frame: "Categoria NN de MM", description, the
 * played filter and the nominee grid. The filter is applied in the client.
 */
const AwardsCategoryPanel = ({
  index,
  total,
  name,
  description,
  nominees = [],
  playedNomineesCount,
  showPlayedFilter,
  children,
  footer,
  className,
}: AwardsCategoryPanelProps) => {
  const { t } = useTranslation();
  const compact = useAwardsMobileLayout();

  const [filter, setFilter] = useState<AwardsCategoryFilter>("all");

  const playedCount =
    playedNomineesCount ??
    nominees.filter((nominee) => nominee.status === "played").length;

  const hasNomineeStatus = nominees.some((nominee) => nominee.status != null);

  const filterVisible = showPlayedFilter ?? hasNomineeStatus;

  const visibleNominees =
    filterVisible && filter === "played"
      ? nominees.filter((nominee) => nominee.status === "played")
      : nominees;

  const filterControl = filterVisible ? (
    <AwardsSegmentedControl
      data-awards-category-filter
      surface={"canvas"}
      fullWidth={compact}
      value={filter}
      onChange={setFilter}
      options={[
        {
          value: "all",
          label: t("awards.shared.filters.all", { count: nominees.length }),
        },
        {
          value: "played",
          label: t("awards.shared.filters.played", { count: playedCount }),
        },
      ]}
    />
  ) : null;

  return (
    <Stack
      data-awards-category-panel
      data-category-index={index}
      className={cn("w-full", className)}
      gap={compact ? 16 : 28}
    >
      <div
        className={cn(
          "flex w-full gap-4",
          compact ? "flex-col" : "items-end justify-between",
        )}
      >
        <Stack gap={compact ? 8 : 10} className={"min-w-0"}>
          <Text
            className={
              "text-[12px] font-bold uppercase leading-[normal] tracking-[0.72px] text-dimmed-1"
            }
          >
            {t("awards.shared.categoryPosition", {
              current: formatCategoryNumber(index + 1),
              total: formatCategoryNumber(total),
            })}
          </Text>
          <Text
            className={cn(
              "font-bold text-white",
              compact
                ? "text-[28px] leading-[34px] tracking-[-0.28px]"
                : "text-[32px] leading-[38px] tracking-[-0.32px]",
            )}
          >
            {name}
          </Text>
          {description && (
            <Text
              className={cn(
                "text-nav-muted",
                compact
                  ? "text-[14px] leading-[1.43]"
                  : "max-w-[520px] text-[16px] leading-normal",
              )}
            >
              {description}
            </Text>
          )}
        </Stack>
        {filterControl}
      </div>
      {visibleNominees.length > 0 && (
        <div className={"@container w-full"}>
          <div
            data-awards-nominee-grid
            className={
              "grid grid-cols-2 gap-x-3 gap-y-4 @2xl:grid-cols-3 @2xl:gap-5"
            }
          >
            {visibleNominees.map((nominee) => (
              <AwardsNomineeCard
                key={nominee.gameId}
                layout={"grid"}
                {...nominee}
              />
            ))}
          </div>
        </div>
      )}
      {children}
      {footer}
    </Stack>
  );
};

export { AwardsCategoryPanel };
