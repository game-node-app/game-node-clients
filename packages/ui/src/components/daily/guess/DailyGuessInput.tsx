import { useEffect, useRef, useState } from "react";
import {
  Button,
  Group,
  Image,
  Loader,
  Select,
  Stack,
  Text,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { useTranslation } from "@repo/locales";
import {
  IconArrowRight,
  IconPlayerSkipForward,
  IconSearch,
} from "@tabler/icons-react";
import { useSearchGames } from "#@/components/game/hooks/useSearchGames";
import {
  getSizedImageUrl,
  ImageSize,
} from "#@/components/game/util/getSizedImageUrl";

interface Props {
  guessedIds: (number | null)[];
  onGuess: (gameId: number) => void;
  onSkip: () => void;
  disabled?: boolean;
}

/** The search text with its first case-insensitive match in bold. */
const Highlighted = ({ text, query }: { text: string; query: string }) => {
  const start = query ? text.toLowerCase().indexOf(query.toLowerCase()) : -1;
  if (start < 0) return <>{text}</>;
  const end = start + query.length;
  return (
    <>
      {text.slice(0, start)}
      <strong>{text.slice(start, end)}</strong>
      {text.slice(end)}
    </>
  );
};

/**
 * Picking a game only selects it; "Chutar" (or Enter on a selection) sends the guess.
 */
const DailyGuessInput = ({ guessedIds, onGuess, onSkip, disabled }: Props) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<{ id: number; name: string }>();
  const [debounced] = useDebouncedValue(search, 300);
  const enabled = debounced.length > 2 && debounced !== selected?.name;
  const searchQuery = useSearchGames(
    { query: debounced, limit: 10, category: [0] },
    enabled,
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const wasDisabled = useRef(false);

  // Submitting disables the input, which drops focus; give it back for the next guess.
  useEffect(() => {
    if (wasDisabled.current && !disabled) inputRef.current?.focus();
    wasDisabled.current = !!disabled;
  }, [disabled]);

  const games = enabled
    ? (searchQuery.data?.data?.items ?? []).filter(
        (game) => game.id != undefined && !guessedIds.includes(game.id),
      )
    : [];
  const options = games.map((game) => ({
    value: `${game.id}`,
    label: game.name ?? `${game.id}`,
  }));
  // Keeps the picked game in the options, so the input still shows its name.
  if (
    selected &&
    !options.some((option) => option.value === `${selected.id}`)
  ) {
    options.push({ value: `${selected.id}`, label: selected.name });
  }

  const submit = () => {
    if (!selected || disabled) return;
    onGuess(selected.id);
    setSelected(undefined);
    setSearch("");
  };

  return (
    <Stack className={"w-full gap-3"}>
      <Select
        ref={inputRef}
        size={"lg"}
        radius={10}
        leftSection={<IconSearch size={20} />}
        rightSection={disabled ? <Loader size={"xs"} /> : undefined}
        aria-label={t("daily.guess.placeholder")}
        placeholder={t("daily.guess.placeholder")}
        searchable
        value={selected ? `${selected.id}` : null}
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          if (selected && value !== selected.name) setSelected(undefined);
        }}
        data={options}
        // results are already filtered by the search service
        filter={({ options }) => options}
        nothingFoundMessage={
          enabled && !searchQuery.isFetching
            ? t("daily.guess.nothingFound")
            : undefined
        }
        onOptionSubmit={(value) => {
          const option = options.find((item) => item.value === value);
          if (option) setSelected({ id: Number(value), name: option.label });
        }}
        onKeyDown={(event) => {
          // The first Enter picks the highlighted game; the next one guesses it.
          if (event.key === "Enter" && selected) submit();
        }}
        renderOption={({ option }) => {
          const game = games.find((item) => `${item.id}` === option.value);
          const year = game?.firstReleaseDate
            ? new Date(game.firstReleaseDate).getFullYear()
            : undefined;
          const platform = game?.platformsAbbreviations?.split(",")[0]?.trim();
          return (
            <Group className={"flex-nowrap gap-3"}>
              <Image
                src={
                  getSizedImageUrl(game?.coverUrl, ImageSize.COVER_SMALL) ??
                  "/img/game_placeholder.jpeg"
                }
                alt={""}
                w={30}
                h={40}
                radius={3}
              />
              <Stack className={"gap-0 min-w-0"}>
                <Text fz={14} className={"truncate"}>
                  <Highlighted text={option.label} query={debounced} />
                </Text>
                {(year || platform) && (
                  <Text fz={12} c={"dimmed"}>
                    {[year, platform].filter(Boolean).join(" · ")}
                  </Text>
                )}
              </Stack>
            </Group>
          );
        }}
        disabled={disabled}
      />
      <Group className={"gap-3 flex-nowrap"}>
        <Button
          variant={"default"}
          size={"lg"}
          fz={14}
          px={12}
          className={"flex-1"}
          leftSection={<IconPlayerSkipForward size={16} />}
          onClick={onSkip}
          disabled={disabled}
        >
          {t("daily.guess.skip")}
        </Button>
        <Button
          size={"lg"}
          fz={14}
          px={12}
          className={"flex-1"}
          rightSection={<IconArrowRight size={16} />}
          onClick={submit}
          disabled={disabled || !selected}
        >
          {t("daily.guess.submit")}
        </Button>
      </Group>
    </Stack>
  );
};

export { DailyGuessInput };
