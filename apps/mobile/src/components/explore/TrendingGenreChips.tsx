import { Button } from "@mantine/core";
import { useTranslation } from "@repo/locales";

export interface TrendingGenreChip {
  id: number;
  name: string;
}

interface TrendingGenreChipsProps {
  genres: TrendingGenreChip[];
  /** `undefined` means "All". */
  selectedGenreId: number | undefined;
  onSelect: (genreId: number | undefined) => void;
}

const TrendingGenreChips = ({
  genres,
  selectedGenreId,
  onSelect,
}: TrendingGenreChipsProps) => {
  const { t } = useTranslation();

  const chips = [{ id: undefined, name: t("explore.filters.all") }, ...genres];

  return (
    <div
      role={"tablist"}
      className={
        "flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      }
    >
      {chips.map((chip) => {
        const isActive = chip.id === selectedGenreId;
        return (
          <Button
            key={chip.id ?? "all"}
            role={"tab"}
            aria-selected={isActive}
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
