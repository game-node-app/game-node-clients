import { Flex } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { StatisticsRankingsRequestDto } from "@repo/wrapper/server";
import { ReactNode } from "react";
import { useExploreGenres } from "#@/components/explore/hooks/useExploreGenres";
import {
  ExploreViewValue,
  selectExploreGenre,
} from "#@/components/explore/util/exploreValue";
import { ExploreGenreChips } from "#@/components/explore/view/ExploreGenreChips";
import { ExplorePeriodSelect } from "#@/components/explore/view/ExplorePeriodSelect";
import { buildPresenterComponent } from "#@/context";

import period = StatisticsRankingsRequestDto.period;

const ExplorePeriodSelectPresenter = buildPresenterComponent(
  "ExplorePeriodSelect",
  ExplorePeriodSelect,
);

export interface ExploreFiltersProps {
  value: ExploreViewValue;
  onChange: (value: ExploreViewValue) => void;
  /** Platform-only controls, drawn at the end of the filter row. */
  extraFilters?: ReactNode;
}

/** Period picker and genre chips, kept above whichever content is shown. */
const ExploreFilters = ({
  value,
  onChange,
  extraFilters,
}: ExploreFiltersProps) => {
  const { t } = useTranslation();
  const genres = useExploreGenres();

  return (
    <Flex
      className={"w-full items-center gap-2 md:items-start"}
      wrap={"nowrap"}
    >
      <ExplorePeriodSelectPresenter
        value={value.period}
        options={[
          { label: t("explore.periods.week"), value: period.WEEK },
          { label: t("explore.periods.month"), value: period.MONTH },
          { label: t("explore.periods.threeMonths"), value: period.QUARTER },
          { label: t("explore.periods.sixMonths"), value: period.HALF_YEAR },
          { label: t("explore.periods.year"), value: period.YEAR },
          { label: t("explore.periods.allTime"), value: period.ALL },
        ]}
        onChange={(period) => onChange({ ...value, period })}
      />
      <div
        aria-hidden
        className={"h-5 w-px shrink-0 bg-foreground/15 md:mt-1.5"}
      />
      <ExploreGenreChips
        className={"min-w-0 flex-1"}
        genres={genres}
        selectedGenreIds={value.criteria?.genres ?? []}
        onSelect={(genreId) => onChange(selectExploreGenre(value, genreId))}
      />
      {extraFilters}
    </Flex>
  );
};

export { ExploreFilters };
