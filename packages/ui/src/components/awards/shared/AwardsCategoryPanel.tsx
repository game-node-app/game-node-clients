import { cn } from "#@/util";
import { SimpleGrid, SegmentedControl, Stack, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { useState, type ReactNode } from "react";
import {
  AwardsNomineeCard,
  type AwardsNomineeCardProps,
} from "./AwardsNomineeCard";
import { formatCategoryNumber } from "./AwardsCategoryList";

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

  return (
    <Stack
      data-awards-category-panel
      data-category-index={index}
      className={cn("w-full", className)}
      gap={"md"}
    >
      <Stack gap={4}>
        <Text size={"xs"} c={"dimmed"} className={"uppercase tracking-wide"}>
          {t("awards.shared.categoryPosition", {
            current: formatCategoryNumber(index + 1),
            total: formatCategoryNumber(total),
          })}
        </Text>
        <Text size={"xl"} fw={700}>
          {name}
        </Text>
        {description && (
          <Text size={"sm"} c={"dimmed"}>
            {description}
          </Text>
        )}
      </Stack>
      {filterVisible && (
        <SegmentedControl
          data-awards-category-filter
          value={filter}
          onChange={(value) => setFilter(value as AwardsCategoryFilter)}
          data={[
            {
              value: "all",
              label: t("awards.shared.filters.all", {
                count: nominees.length,
              }),
            },
            {
              value: "played",
              label: t("awards.shared.filters.played", {
                count: playedCount,
              }),
            },
          ]}
          size={"xs"}
          className={"self-start"}
        />
      )}
      {visibleNominees.length > 0 && (
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={"sm"}>
          {visibleNominees.map((nominee) => (
            <AwardsNomineeCard key={nominee.gameId} {...nominee} />
          ))}
        </SimpleGrid>
      )}
      {children}
      {footer}
    </Stack>
  );
};

export { AwardsCategoryPanel };
