import React, { useEffect, useMemo, useState } from "react";
import { MultiSelect, NumberInput, Stack } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { useGamesResource, useSearchGames } from "@repo/ui";

interface FieldProps {
  value: number[];
  onChange: (value: number[]) => void;
  disabled?: boolean;
}

const GameIdsSelect = ({ value, onChange, disabled }: FieldProps) => {
  const [search, setSearch] = useState("");
  const [debounced] = useDebouncedValue(search, 300);
  const searchQuery = useSearchGames(
    { query: debounced, limit: 10 },
    debounced.length > 2,
  );
  const [names, setNames] = useState<Record<string, string>>({});

  useEffect(() => {
    const results = searchQuery.data?.data?.items ?? [];
    if (results.length > 0) {
      setNames((prev) => ({
        ...prev,
        ...Object.fromEntries(results.map((g) => [`${g.id}`, g.name ?? ""])),
      }));
    }
  }, [searchQuery.data]);

  const data = useMemo(() => {
    const ids = new Set([...Object.keys(names), ...value.map(String)]);
    return [...ids].map((id) => ({ value: id, label: names[id] || id }));
  }, [names, value]);

  return (
    <MultiSelect
      label={"Games"}
      description={"Type at least 3 characters to search"}
      data={data}
      value={value.map(String)}
      onChange={(v) => onChange(v.map(Number))}
      searchable
      onSearchChange={setSearch}
      filter={({ options }) => options}
      disabled={disabled}
    />
  );
};

const ResourceMultiSelect = ({
  resource,
  label,
  value,
  onChange,
  disabled,
}: FieldProps & { resource: "themes" | "genres"; label: string }) => {
  const resourceQuery = useGamesResource(resource);
  const data = (resourceQuery.data ?? []).map((item) => ({
    value: `${item.id}`,
    label: item.name ?? `${item.id}`,
  }));
  return (
    <MultiSelect
      label={label}
      data={data}
      value={value.map(String)}
      onChange={(v) => onChange(v.map(Number))}
      searchable
      disabled={disabled}
    />
  );
};

interface Props {
  /** Criteria keys accepted by the chosen metric. */
  filters: string[];
  value: Record<string, any>;
  onChange: (value: Record<string, any>) => void;
  disabled?: boolean;
}

const CriteriaFields = ({ filters, value, onChange, disabled }: Props) => {
  const set = (key: string, v: unknown) => onChange({ ...value, [key]: v });
  return (
    <Stack>
      {filters.includes("gameIds") && (
        <GameIdsSelect
          value={value.gameIds ?? []}
          onChange={(v) => set("gameIds", v)}
          disabled={disabled}
        />
      )}
      {filters.includes("themeIds") && (
        <ResourceMultiSelect
          resource={"themes"}
          label={"Themes"}
          value={value.themeIds ?? []}
          onChange={(v) => set("themeIds", v)}
          disabled={disabled}
        />
      )}
      {filters.includes("genreIds") && (
        <ResourceMultiSelect
          resource={"genres"}
          label={"Genres"}
          value={value.genreIds ?? []}
          onChange={(v) => set("genreIds", v)}
          disabled={disabled}
        />
      )}
      {filters.includes("year") && (
        <NumberInput
          label={"Year"}
          value={value.year ?? ""}
          onChange={(v) => set("year", v === "" ? undefined : Number(v))}
          disabled={disabled}
        />
      )}
    </Stack>
  );
};

export { CriteriaFields };
