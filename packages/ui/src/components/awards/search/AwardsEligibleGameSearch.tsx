import { CenteredLoading } from "#@/components/general/CenteredLoading";
import { useSearchGames } from "#@/components/game/hooks/useSearchGames";
import { GameSearchViewActions } from "#@/components/game/search/search-bar/GameSearchViewActions";
import { buildGameCategoryFilters } from "#@/components/game/search/search-bar/utils";
import { GameSelectView } from "#@/components/game/view/select/GameSelectView";
import { cn } from "#@/util";
import { Stack, Text } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { useTranslation } from "@repo/locales";
import { useState } from "react";
import {
  filterAwardsEligibleGames,
  type AwardsEligibilityFilter,
} from "./eligibleGames";

export interface AwardsEligibleGameSearchProps {
  /** Event year: only games released in this UTC year are offered. */
  year: number;
  /** Optional event release cutoff, inclusive by UTC day. */
  eligibilityCutoffDate?: AwardsEligibilityFilter["eligibilityCutoffDate"];
  /** Called with the chosen game id. */
  onSelect: (gameId: number) => void;
  /** Game ids already picked, shown with the selected overlay. */
  selectedGameIds?: readonly number[];
  /** Prevents selecting more games (e.g. the nominations limit is reached). */
  disabled?: boolean;
  className?: string;
}

/**
 * Free search restricted to the games eligible for an Awards event. Shared by
 * the personal-GOTY picker, legacy categories without nominees and the
 * nominations screen.
 */
const AwardsEligibleGameSearch = ({
  year,
  eligibilityCutoffDate,
  onSelect,
  selectedGameIds = [],
  disabled = false,
  className,
}: AwardsEligibleGameSearchProps) => {
  const { t } = useTranslation();

  const [query, setQuery] = useState("");
  const [includeExtraContent, setIncludeExtraContent] = useState(false);

  const [delayedQuery] = useDebouncedValue(query, 300);

  const isQueryEnabled = delayedQuery.length > 2;

  const searchGamesQuery = useSearchGames(
    {
      query: delayedQuery,
      limit: 20,
      category: buildGameCategoryFilters({
        includeDlcs: includeExtraContent,
        includeExtraContent,
      }),
    },
    isQueryEnabled,
  );

  const searchedGames = searchGamesQuery.data?.data?.items ?? [];

  const eligibleGames = filterAwardsEligibleGames(searchedGames, {
    year,
    eligibilityCutoffDate,
  });

  const totalExcludedItems = searchedGames.length - eligibleGames.length;

  return (
    <Stack
      data-awards-eligible-game-search
      className={cn("w-full", className)}
      gap={"sm"}
    >
      <GameSelectView.SearchBar
        onSearch={(value) => setQuery(value.trim())}
        onClear={() => setQuery("")}
      />
      <GameSearchViewActions
        includeExtraContent={includeExtraContent}
        onExtraContentChange={setIncludeExtraContent}
      />
      {searchGamesQuery.isLoading && <CenteredLoading />}
      {totalExcludedItems > 0 && (
        <Text className={"text-sm text-dimmed"}>
          {t("awards.search.excludingGames", {
            count: totalExcludedItems,
            year,
          })}
        </Text>
      )}
      <GameSelectView.Content
        items={eligibleGames}
        onSelected={(gameId) => {
          if (disabled) {
            return;
          }
          onSelect(gameId);
        }}
        checkIsSelected={(gameId) => selectedGameIds.includes(gameId)}
        excludeItemsInLibrary={false}
      />
    </Stack>
  );
};

export { AwardsEligibleGameSearch };
