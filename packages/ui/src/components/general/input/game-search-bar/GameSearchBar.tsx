import React, { useEffect, useRef } from "react";
import {
  Autocomplete,
  Button,
  Chip,
  Combobox,
  Group,
  Loader,
  Stack,
  TextInput,
  useCombobox,
} from "@mantine/core";
import { FieldPath, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDebouncedValue } from "@mantine/hooks";
import { IconSearch } from "@tabler/icons-react";
import {
  toGameSearchRequestDto,
  useSearchGamesAutocomplete,
} from "#@/components";
import { games_GameSearchRequestDto } from "@repo/wrapper/search";
import { z } from "zod";

interface Props {
  withFilters?: boolean;
  submitOnSelection?: boolean;
  /**
   * Trigger submits based on the delayed query parameter.
   */
  submitOnDelayedChange?: boolean;
  submitOnFilterChange?: boolean;
  /**
   * Triggered when user press enter/search button
   * OR selects an option in the search bar if 'submitOnSelection' is true.
   */
  onSubmit: (data: games_GameSearchRequestDto) => void;
}

export const GameSearchFormSchema = z.object({
  query: z.string().min(3, "Insert at least 3 characters."),
  includeDlcs: z.boolean().default(true),
  includeExtraContent: z.boolean().default(true),
});

export type GameSearchFormValues = z.infer<typeof GameSearchFormSchema>;

const GameSearchBar = ({
  withFilters = true,
  submitOnSelection = true,
  submitOnFilterChange = true,
  submitOnDelayedChange = false,
  onSubmit,
}: Props) => {
  const formRef = useRef<HTMLFormElement>(null);

  const combobox = useCombobox();

  const { watch, setValue, handleSubmit } = useForm<GameSearchFormValues>({
    mode: "onBlur",
    defaultValues: {
      includeDlcs: false,
      includeExtraContent: false,
    },
    resolver: zodResolver(GameSearchFormSchema),
  });

  const query = watch("query");
  const [delayedQuery] = useDebouncedValue(query, 300);

  const autoCompleteQuery = useSearchGamesAutocomplete(delayedQuery);

  const registerChip = (fieldName: FieldPath<GameSearchFormValues>) => {
    return {
      checked: watch(fieldName) as boolean,
      onChange: (v: boolean) => {
        setValue(fieldName, v);

        if (submitOnFilterChange) {
          triggerSubmit();
        }
      },
    } as const;
  };

  const triggerSubmit = () => {
    formRef.current?.requestSubmit();
  };

  // Effect to trigger submit on delayed change
  useEffect(() => {
    if (submitOnDelayedChange && delayedQuery.length >= 3) {
      triggerSubmit();
    }
  }, [submitOnDelayedChange, delayedQuery]);

  return (
    <form
      className={"w-full"}
      ref={formRef}
      onSubmit={handleSubmit((data) => onSubmit(toGameSearchRequestDto(data)))}
    >
      <Stack className={"w-full"}>
        <Group className={"w-full flex-nowrap gap-0"}>
          <Combobox
            store={combobox}
            onOptionSubmit={(v) => {
              setValue("query", v);
              if (submitOnSelection) {
                triggerSubmit();
              }
            }}
          >
            <Combobox.Target>
              <TextInput
                placeholder="Search for games"
                value={query}
                onChange={(event) => {
                  setValue("query", event.currentTarget.value);
                  combobox.resetSelectedOption();
                  combobox.openDropdown();
                }}
                onClick={() => combobox.openDropdown()}
                onFocus={() => {
                  combobox.openDropdown();
                }}
                onBlur={() => combobox.closeDropdown()}
                rightSection={
                  autoCompleteQuery.isLoading && <Loader size={18} />
                }
                classNames={{
                  root: "flex-grow",
                  input: "!rounded-tr-none !rounded-br-none",
                }}
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
          <Button type="submit" className="!rounded-tl-none !rounded-bl-none">
            <IconSearch />
          </Button>
        </Group>

        {withFilters && (
          <Group gap={"sm"}>
            <Chip {...registerChip("includeDlcs")}>
              Include DLCs/Expansions
            </Chip>
            <Chip {...registerChip("includeExtraContent")}>
              Include Bundles/Updates/Extra
            </Chip>
          </Group>
        )}
      </Stack>
    </form>
  );
};

export { GameSearchBar };
