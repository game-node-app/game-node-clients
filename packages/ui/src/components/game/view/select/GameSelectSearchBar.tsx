import React from "react";
import { TextInput } from "@mantine/core";
import { useDebouncedCallback } from "@mantine/hooks";

export interface GameSelectSearchBarProps {
  onSearch: (query: string) => void;
  onClear: () => void;
}

const GameSelectSearchBar = ({
  onSearch,
  onClear,
}: GameSelectSearchBarProps) => {
  const debouncedOnChange = useDebouncedCallback((query: string) => {
    if (query == undefined || query.length < 3) {
      onClear();
      return;
    }
    onSearch(query);
  }, 300);

  return (
    <TextInput
      label={"Search for games"}
      onChange={(evt) => {
        debouncedOnChange(evt.currentTarget.value);
      }}
      type={"search"}
    ></TextInput>
  );
};

export { GameSelectSearchBar };
