import { useEffect, useRef, useState } from "react";
import {
  Button,
  Group,
  Image,
  Loader,
  Select,
  Text,
  Tooltip,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { useTranslation } from "@repo/locales";
import { IconSearch } from "@tabler/icons-react";
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

const DailyGuessInput = ({ guessedIds, onGuess, onSkip, disabled }: Props) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [debounced] = useDebouncedValue(search, 300);
  const enabled = debounced.length > 2;
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

  return (
    <Group className={"w-full flex-nowrap items-end"}>
      <Select
        ref={inputRef}
        size={"md"}
        className={"flex-grow"}
        leftSection={<IconSearch size={18} />}
        rightSection={disabled ? <Loader size={"xs"} /> : undefined}
        aria-label={t("daily.guess.placeholder")}
        placeholder={t("daily.guess.placeholder")}
        searchable
        value={null}
        searchValue={search}
        onSearchChange={setSearch}
        data={games.map((game) => ({
          value: `${game.id}`,
          label: game.name ?? `${game.id}`,
        }))}
        // results are already filtered by the search service
        filter={({ options }) => options}
        nothingFoundMessage={
          enabled ? t("daily.guess.nothingFound") : undefined
        }
        onOptionSubmit={(value) => {
          setSearch("");
          onGuess(Number(value));
        }}
        renderOption={({ option }) => {
          const game = games.find((item) => `${item.id}` === option.value);
          const year = game?.firstReleaseDate
            ? new Date(game.firstReleaseDate).getFullYear()
            : undefined;
          return (
            <Group className={"flex-nowrap gap-2"}>
              <Image
                src={
                  getSizedImageUrl(game?.coverUrl, ImageSize.COVER_SMALL) ??
                  "/img/game_placeholder.jpeg"
                }
                alt={""}
                w={32}
                h={42}
                radius={"xs"}
              />
              <Text size={"sm"}>
                {option.label}
                {year && (
                  <Text span c={"dimmed"} size={"sm"}>
                    {` (${year})`}
                  </Text>
                )}
              </Text>
            </Group>
          );
        }}
        disabled={disabled}
      />
      <Tooltip label={t("daily.guess.skipHint")}>
        <Button
          variant={"default"}
          size={"md"}
          onClick={onSkip}
          disabled={disabled}
        >
          {t("actions.skip")}
        </Button>
      </Tooltip>
    </Group>
  );
};

export { DailyGuessInput };
