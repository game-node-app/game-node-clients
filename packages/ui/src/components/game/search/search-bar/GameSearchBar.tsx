import React, { useState } from "react";
import {
  Button,
  Combobox,
  Group,
  Loader,
  Stack,
  TextInput,
  TextInputProps,
  useCombobox,
} from "@mantine/core";
import { useDebouncedCallback, useDebouncedValue } from "@mantine/hooks";
import { IconSearch } from "@tabler/icons-react";
import { useSearchGamesAutocomplete } from "#@/components";

interface Props extends Omit<TextInputProps, "onChange"> {
  withButton?: boolean;
  /**
   * Triggered when user press enter/search button or types in the search bar (debounced)
   */
  onChange: (query: string) => void;
}

const GameSearchBar = ({ withButton = true, onChange, ...others }: Props) => {
  const combobox = useCombobox();

  const [query, setQuery] = useState("");
  const triggerDelayedOnChange = useDebouncedCallback(
    () => onChange(query),
    300,
  );

  const [delayedQuery] = useDebouncedValue(query, 300);

  const autoCompleteQuery = useSearchGamesAutocomplete(delayedQuery);

  return (
    <Stack className={"w-full"}>
      <Group className={"w-full flex-nowrap gap-0"}>
        <Combobox
          store={combobox}
          onOptionSubmit={(v) => {
            setQuery(v);
            triggerDelayedOnChange();
          }}
        >
          <Combobox.Target>
            <TextInput
              placeholder="Search for games"
              value={query}
              onChange={(event) => {
                setQuery(event.currentTarget.value);
                combobox.resetSelectedOption();
                combobox.openDropdown();
                triggerDelayedOnChange();
              }}
              onClick={() => combobox.openDropdown()}
              onFocus={() => {
                combobox.openDropdown();
              }}
              onBlur={() => combobox.closeDropdown()}
              rightSection={autoCompleteQuery.isLoading && <Loader size={16} />}
              classNames={{
                root: "flex-grow",
                input: "!rounded-tr-none !rounded-br-none",
              }}
              {...others}
            />
          </Combobox.Target>
          <Combobox.Dropdown
            hidden={
              autoCompleteQuery.data == undefined ||
              autoCompleteQuery.data.length === 0
            }
          >
            <Combobox.Options>
              {autoCompleteQuery.data?.map((item) => (
                <Combobox.Option value={item} key={item}>
                  {item}
                </Combobox.Option>
              ))}
            </Combobox.Options>
          </Combobox.Dropdown>
        </Combobox>
        {withButton && (
          <Button
            type="button"
            className="!rounded-tl-none !rounded-bl-none"
            onClick={() => triggerDelayedOnChange()}
          >
            <IconSearch />
          </Button>
        )}
      </Group>
    </Stack>
  );
};

export { GameSearchBar };
