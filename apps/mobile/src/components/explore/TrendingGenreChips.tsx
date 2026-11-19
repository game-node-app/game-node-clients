import { Button } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { cn } from "@repo/ui";

export interface TrendingGenreChip {
  id: number;
  name: string;
}

interface TrendingGenreChipsProps {
  genres: TrendingGenreChip[];
  /** `undefined` means "All". */
  selectedGenreId: number | undefined;
  onSelect: (genreId: number | undefined) => void;
  className?: string;
}

const TrendingGenreChips = ({
  className,
  genres,
  selectedGenreId,
  onSelect,
}: TrendingGenreChipsProps) => {
  const { t } = useTranslation();

  const chips = [{ id: undefined, name: t("explore.filters.all") }, ...genres];

  return (
    <div
      role={"group"}
      aria-label={t("explore.filters.genres")}
      // the right edge fades out to hint that the row scrolls
      className={cn(
        "flex gap-2 overflow-x-auto pr-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        "[mask-image:linear-gradient(to_right,black_calc(100%-32px),transparent)]",
        className,
      )}
    >
      {chips.map((chip) => {
        const isActive = chip.id === selectedGenreId;
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

export { TrendingGenreChips };
