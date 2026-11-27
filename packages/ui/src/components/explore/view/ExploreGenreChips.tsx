import { Button } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { cn } from "#@/util";

export interface ExploreGenreChip {
  id: number;
  name: string;
}

interface ExploreGenreChipsProps {
  genres: ExploreGenreChip[];
  /** Selected genre ids; none means "All". */
  selectedGenreIds: number[];
  onSelect: (genreId: number | undefined) => void;
  className?: string;
}

/** Genre shortcuts: a swipeable row on small screens, wrapping on larger ones. */
const ExploreGenreChips = ({
  className,
  genres,
  selectedGenreIds,
  onSelect,
}: ExploreGenreChipsProps) => {
  const { t } = useTranslation();

  const chips = [{ id: undefined, name: t("explore.filters.all") }, ...genres];

  return (
    <div
      role={"group"}
      aria-label={t("explore.filters.genres")}
      className={cn(
        "flex gap-2 overflow-x-auto pr-6 [scrollbar-width:none] md:flex-wrap md:overflow-visible md:pr-0 [&::-webkit-scrollbar]:hidden",
        // the right edge fades out to hint that the row scrolls
        "[mask-image:linear-gradient(to_right,black_calc(100%-32px),transparent)] md:[mask-image:none]", // theme-exempt: mask alpha, paints no color
        className,
      )}
    >
      {chips.map((chip) => {
        const isActive =
          chip.id === undefined
            ? selectedGenreIds.length === 0
            : selectedGenreIds.includes(chip.id);
        return (
          <Button
            key={chip.id ?? "all"}
            aria-pressed={isActive}
            radius={"xl"}
            size={"compact-md"}
            variant={isActive ? "filled" : "default"}
            className={"shrink-0"}
            onClick={() => onSelect(chip.id)}
          >
            {chip.name}
          </Button>
        );
      })}
    </div>
  );
};

export { ExploreGenreChips };
