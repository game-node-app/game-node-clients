import { useSearchGamesAutocomplete } from "#@/components";
import {
  CloseButton,
  Combobox,
  Loader,
  TextInput,
  TextInputProps,
  useCombobox,
} from "@mantine/core";
import { useDebouncedCallback, useDebouncedValue } from "@mantine/hooks";
import { useTranslation } from "@repo/locales";
import { IconSearch } from "@tabler/icons-react";
import { useState } from "react";

interface Props extends Omit<TextInputProps, "onChange"> {
  /**
   * Triggered while the user types (debounced), and right away on Enter, a picked suggestion or clearing.
   */
  onChange: (query: string) => void;
}

/**
 * Game search input. Results follow the typing, so there is no submit button.
 */
const GameSearchBar = ({ onChange, ...others }: Props) => {
  const { t } = useTranslation();
  const combobox = useCombobox();

  const [query, setQuery] = useState("");
  const triggerDelayedOnChange = useDebouncedCallback(onChange, 300);

  const [delayedQuery] = useDebouncedValue(query, 300);

  const autoCompleteQuery = useSearchGamesAutocomplete(delayedQuery);

  const submit = (value: string) => {
    triggerDelayedOnChange.cancel();
    onChange(value);
  };

  return (
    <Combobox
      store={combobox}
      onOptionSubmit={(value) => {
        setQuery(value);
        submit(value);
        combobox.closeDropdown();
      }}
    >
      <Combobox.Target>
        <TextInput
          type={"search"}
          size={"lg"}
          placeholder={t("game.searchPlaceholder")}
          aria-label={t("game.searchPlaceholder")}
          value={query}
          onChange={(event) => {
            const value = event.currentTarget.value;
            setQuery(value);
            combobox.resetSelectedOption();
            combobox.openDropdown();
            triggerDelayedOnChange(value);
          }}
          onKeyDown={(event) => {
            // a highlighted suggestion is handled by the combobox instead
            if (event.key === "Enter" && combobox.getSelectedOptionIndex() < 0) {
              submit(query);
              combobox.closeDropdown();
            }
          }}
          onClick={() => combobox.openDropdown()}
          onFocus={() => combobox.openDropdown()}
          onBlur={() => combobox.closeDropdown()}
          leftSection={<IconSearch size={20} stroke={1.75} />}
          rightSection={
            autoCompleteQuery.isLoading ? (
              <Loader size={16} />
            ) : (
              query.length > 0 && (
                <CloseButton
                  size={"sm"}
                  aria-label={t("actions.clear")}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    setQuery("");
                    submit("");
                  }}
                />
              )
            )
          }
          classNames={{
            root: "gn-search w-full",
            input:
              "gn-search-input text-base [&::-webkit-search-cancel-button]:appearance-none",
            section: "gn-search-section",
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
  );
};

export { GameSearchBar };
