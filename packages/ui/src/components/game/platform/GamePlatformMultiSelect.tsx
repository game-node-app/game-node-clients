import React, { useMemo } from "react";
import { MultiSelect, MultiSelectProps } from "@mantine/core";
import {
  buildGamePlatformSelectOptions,
  useGamesResource,
} from "#@/components";

interface Props
  extends Omit<
    MultiSelectProps,
    "data" | "onChange" | "value" | "multiple" | "defaultValue"
  > {
  targetPlatformIds?: number[];
  onChange: (platformId: number[] | null) => void;
  value?: number[] | null;
  defaultValue?: number[] | null;
}

const GamePlatformMultiSelect = ({
  targetPlatformIds,
  onChange,
  value,
  defaultValue,
  ...others
}: Props) => {
  const { data: platforms } = useGamesResource("platforms");

  const options = useMemo(() => {
    if (!platforms) return [];
    return buildGamePlatformSelectOptions(platforms, targetPlatformIds);
  }, [platforms, targetPlatformIds]);

  const parsedValue = value ? value.map((v) => v.toString()) : undefined;
  const parsedDefaultValue = defaultValue
    ? defaultValue.map((v) => v.toString())
    : undefined;
  return (
    <MultiSelect
      searchable
      clearable
      {...others}
      data={options}
      value={parsedValue}
      defaultValue={parsedDefaultValue}
      onChange={(v) => {
        onChange(v ? v.map((id) => Number.parseInt(id)) : null);
      }}
    />
  );
};

export { GamePlatformMultiSelect };
