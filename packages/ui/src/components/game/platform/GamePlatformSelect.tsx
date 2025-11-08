import React, { useMemo } from "react";
import { useGamesResource } from "#@/components";
import { ComboboxItem, Select, SelectProps } from "@mantine/core";
import { GamePlatform } from "@repo/wrapper/server";

export const buildGamePlatformSelectOptions = (
  platforms: GamePlatform[],
  targetPlatformIds?: number[],
) => {
  return platforms
    .filter((platform) => {
      if (targetPlatformIds && targetPlatformIds.length > 0) {
        return targetPlatformIds.includes(platform.id);
      }

      return true;
    })
    .map(
      (platform): ComboboxItem => ({
        label: `${platform.name} (${platform.abbreviation})`,
        value: platform.id.toString(),
      }),
    );
};

interface Props
  extends Omit<SelectProps, "data" | "onChange" | "value" | "multiple"> {
  targetPlatformIds?: number[];
  onChange: (platformId: number | null) => void;
  value?: number | null;
}

const GamePlatformSelect = ({
  targetPlatformIds,
  onChange,
  value,
  ...others
}: Props) => {
  const { data: platforms } = useGamesResource("platforms");
  const options = useMemo(() => {
    if (!platforms) return [];
    return buildGamePlatformSelectOptions(platforms, targetPlatformIds);
  }, [platforms, targetPlatformIds]);

  const parsedValue = value != undefined ? value.toString() : undefined;

  return (
    <Select
      searchable
      clearable
      {...others}
      data={options}
      value={parsedValue}
      onChange={(v) => {
        onChange(v ? parseInt(v, 10) : null);
      }}
    ></Select>
  );
};

export { GamePlatformSelect };
