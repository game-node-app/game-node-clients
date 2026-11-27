import { Stack } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { useExploreGenres } from "#@/components/explore/hooks/useExploreGenres";
import { TrendingShelf } from "#@/components/explore/shelf/TrendingShelf";
import {
  ExploreViewValue,
  selectExploreGenre,
} from "#@/components/explore/util/exploreValue";
import { ExploreRanking } from "#@/components/explore/view/ExploreRanking";

export interface ExploreResultsProps {
  value: ExploreViewValue;
  onChange: (value: ExploreViewValue) => void;
}

/** Category shelves, or the paginated ranking once something is selected. */
const ExploreResults = ({ value, onChange }: ExploreResultsProps) => {
  const { t } = useTranslation();
  const genres = useExploreGenres();

  if (value.criteria) {
    return <ExploreRanking value={value} />;
  }

  return (
    <Stack gap={"lg"} className={"w-full"}>
      <TrendingShelf
        ranked
        title={t("explore.sections.topOverall")}
        period={value.period}
        onSeeAll={() => onChange({ ...value, criteria: {} })}
      />
      <div className={"grid w-full grid-cols-1 gap-x-8 gap-y-6 lg:grid-cols-2"}>
        {genres.map((genre) => (
          <TrendingShelf
            key={genre.id}
            title={genre.name}
            genreId={genre.id}
            period={value.period}
            onSeeAll={() => onChange(selectExploreGenre(value, genre.id))}
          />
        ))}
      </div>
    </Stack>
  );
};

export { ExploreResults };
