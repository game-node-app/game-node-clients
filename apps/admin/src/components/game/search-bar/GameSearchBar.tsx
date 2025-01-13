import {
    Box,
    Combobox,
    ComboboxOptionProps,
    ComboboxStore,
    Group,
    ScrollArea,
    TextInput,
    TextInputProps,
    useCombobox,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import useSearchGames from "@/components/game/hooks/useSearchGames";
import React, { ReactElement, useMemo } from "react";
import { IconLoader, IconX } from "@tabler/icons-react";
import GameSelectOption from "@/components/game/search-bar/GameSelectOption";

interface IGameSearchBarProps extends TextInputProps {
    value: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onOptionSubmit: (
        value: string,
        options: ComboboxOptionProps,
        combobox: ComboboxStore,
    ) => void;
    onClear: () => void;
}

const GameSearchBar = ({
    value,
    onOptionSubmit,
    onClear,
    ...others
}: IGameSearchBarProps) => {
    const combobox = useCombobox();
    const [debouncedQuery] = useDebouncedValue(value, 400);
    const isQueryEnabled =
        debouncedQuery != undefined && debouncedQuery.length > 2;

    const searchGamesQuery = useSearchGames(
        {
            query: debouncedQuery,
            limit: 5,
        },
        isQueryEnabled,
    );

    // Who thought this was a good idea?
    // Oh, it was me...
    const isEmpty =
        searchGamesQuery.data == undefined ||
        searchGamesQuery.data.data == undefined ||
        searchGamesQuery.data.data.items == undefined;

    const isLoading = searchGamesQuery.isLoading;
    const isError = searchGamesQuery.isError;

    const options = useMemo(() => {
        if (isEmpty) return undefined;
        return searchGamesQuery.data?.data?.items?.map((item) => {
            return <GameSelectOption key={item.id} game={item} />;
        });
    }, [isEmpty, searchGamesQuery.data]);

    return (
        <Group
            wrap={"nowrap"}
            className="w-full"
            justify="center"
            align="start"
            gap={0}
        >
            <Combobox
                store={combobox}
                withinPortal={false}
                onOptionSubmit={(value, options) =>
                    onOptionSubmit(value, options, combobox)
                }
            >
                <Combobox.Target>
                    <TextInput
                        placeholder={"Search for games"}
                        {...others}
                        value={value ?? ""}
                        onClick={() => {
                            combobox.openDropdown();
                        }}
                        onFocus={() => {
                            combobox.openDropdown();
                        }}
                        onBlur={() => {
                            combobox.closeDropdown();
                        }}
                        classNames={{
                            root: "!grow",
                        }}
                        rightSection={
                            <Group wrap={"nowrap"}>
                                <Box w={"1rem"}>
                                    {searchGamesQuery.isFetching && (
                                        <IconLoader size={"1rem"} />
                                    )}
                                </Box>
                                <Box w={"1rem"} mr={25}>
                                    <IconX size={"1rem"} onClick={onClear} />
                                </Box>
                            </Group>
                        }
                    />
                </Combobox.Target>

                <Combobox.Dropdown hidden={!isQueryEnabled}>
                    <Combobox.Options>
                        <ScrollArea.Autosize h={300}>
                            {options}
                            {isError && (
                                <Combobox.Empty>
                                    Failed to fetch results.
                                </Combobox.Empty>
                            )}
                            {!isLoading && !isError && isEmpty && (
                                <Combobox.Empty>No results.</Combobox.Empty>
                            )}
                        </ScrollArea.Autosize>
                    </Combobox.Options>
                </Combobox.Dropdown>
            </Combobox>
        </Group>
    );
};
export default GameSearchBar;
