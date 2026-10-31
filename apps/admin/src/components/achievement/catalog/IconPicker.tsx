import {
  Group,
  SegmentedControl,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  UnstyledButton,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { ACHIEVEMENT_GLYPHS, AchievementBadge, useSearchGames } from "@repo/ui";
import { AchievementIconDto } from "@repo/wrapper/server";
import { useMemo, useState } from "react";

interface Props {
  value: { kind: string; name?: string; gameId?: number };
  onChange: (value: Props["value"]) => void;
  /** Number of tiers, to preview the badge at each one. */
  tierCount: number;
  disabled?: boolean;
}

const GameCoverSelect = ({
  gameId,
  onChange,
  disabled,
}: {
  gameId?: number;
  onChange: (gameId: number | undefined) => void;
  disabled?: boolean;
}) => {
  const [search, setSearch] = useState("");
  const [debounced] = useDebouncedValue(search, 300);
  const searchQuery = useSearchGames(
    { query: debounced, limit: 10 },
    debounced.length > 2,
  );
  const [names, setNames] = useState<Record<string, string>>({});

  const [previousResults, setPreviousResults] =
    useState<typeof searchQuery.data>();
  if (previousResults !== searchQuery.data) {
    setPreviousResults(searchQuery.data);
    const results = searchQuery.data?.data?.items ?? [];
    if (results.length > 0) {
      setNames((previous) => ({
        ...previous,
        ...Object.fromEntries(
          results.map((game) => [`${game.id}`, game.name ?? ""]),
        ),
      }));
    }
  }

  const data = useMemo(() => {
    const ids = new Set(Object.keys(names));
    if (gameId) ids.add(`${gameId}`);
    return [...ids].map((id) => ({ value: id, label: names[id] || id }));
  }, [names, gameId]);

  return (
    <Select
      label={"Game"}
      description={"Type at least 3 characters to search"}
      data={data}
      value={gameId ? `${gameId}` : null}
      onChange={(v) => onChange(v ? Number(v) : undefined)}
      searchable
      onSearchChange={setSearch}
      filter={({ options }) => options}
      disabled={disabled}
    />
  );
};

const IconPicker = ({ value, onChange, tierCount, disabled }: Props) => {
  return (
    <Stack>
      <Text size={"sm"} fw={500}>
        Icon
      </Text>
      <SegmentedControl
        disabled={disabled}
        value={value.kind}
        onChange={(kind) =>
          onChange(kind === "glyph" ? { kind, name: "trophy" } : { kind })
        }
        data={[
          { label: "Glyph", value: "glyph" },
          { label: "Game cover", value: "game_cover" },
          { label: "Server image", value: "image" },
        ]}
      />
      {value.kind === "glyph" && (
        <SimpleGrid cols={{ base: 5, sm: 8 }}>
          {Object.keys(ACHIEVEMENT_GLYPHS).map((name) => (
            <UnstyledButton
              key={name}
              disabled={disabled}
              title={name}
              onClick={() => onChange({ kind: value.kind, name })}
              className={name === value.name ? "opacity-100" : "opacity-50"}
            >
              <AchievementBadge
                icon={{ kind: AchievementIconDto.kind.GLYPH, name }}
                tier={name === value.name ? 1 : 0}
                size={40}
              />
            </UnstyledButton>
          ))}
        </SimpleGrid>
      )}
      {value.kind === "game_cover" && (
        <GameCoverSelect
          gameId={value.gameId}
          onChange={(gameId) => onChange({ kind: value.kind, gameId })}
          disabled={disabled}
        />
      )}
      {value.kind === "image" && (
        <TextInput
          label={"Icon name"}
          description={"Name of an existing server icon, without extension"}
          value={value.name ?? ""}
          disabled={disabled}
          onChange={(e) =>
            onChange({ kind: value.kind, name: e.currentTarget.value })
          }
        />
      )}
      <Group>
        {Array.from({ length: Math.max(tierCount, 1) }, (_, i) => (
          <AchievementBadge
            key={i}
            icon={value as AchievementIconDto}
            tier={i + 1}
            size={48}
          />
        ))}
      </Group>
    </Stack>
  );
};

export { IconPicker };
