import {
    Box,
    Button,
    Combobox,
    ComboboxOptionProps,
    ComboboxStore,
    FocusTrap,
    Group,
    Kbd,
    ScrollArea,
    TextInput,
    TextInputProps,
    useCombobox,
} from "@mantine/core";
import {
    useClickOutside,
    useDebouncedValue,
    useDisclosure,
    useFocusTrap,
    useHotkeys,
} from "@mantine/hooks";
import useSearchGames from "@/components/game/hooks/useSearchGames";
import { useSearchUsers } from "@/components/profile/hooks/useSearchUsers";
import React, { ReactElement, useMemo } from "react";
import GameSelectOption from "@/components/general/shell/GlobalShellNavbar/search-bar/GameSelectOption";
import { IconLoader, IconSearch, IconX } from "@tabler/icons-react";
import UserSelectOption from "@/components/general/shell/GlobalShellNavbar/search-bar/UserSelectOption";
import useOnMobile from "@/components/general/hooks/useOnMobile";

interface IUserGamesSearchBarWithSelectProps extends TextInputProps {
    value: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onOptionSubmit: (
        value: string,
        options: ComboboxOptionProps,
        combobox: ComboboxStore,
    ) => void;
    onClear: () => void;
    onHotkeyPress: () => void;
}

const GlobalNavbarSearchBar = ({
    value,
    onOptionSubmit,
    onClear,
    onHotkeyPress,
    ...others
}: IUserGamesSearchBarWithSelectProps) => {
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
    const searchUsersQuery = useSearchUsers({
        query: debouncedQuery,
        limit: 5,
    });

    const onMobile = useOnMobile();

    const [focusActive, focusActiveUtils] = useDisclosure();
    const searchBarClickOutsideRef = useClickOutside(() => {
        focusActiveUtils.close();
    });

    useHotkeys([
        [
            "shift+F",
            () => {
                onHotkeyPress();
                focusActiveUtils.open();
            },
        ],
    ]);

    // Who thought this was a good idea?
    // Oh, it was me...
    const isGamesEmpty =
        searchGamesQuery.data == undefined ||
        searchGamesQuery.data.data == undefined ||
        searchGamesQuery.data.data.items == undefined;
    const isUsersEmpty =
        searchUsersQuery.data == undefined ||
        searchUsersQuery.data.data == undefined ||
        searchUsersQuery.data.data.items == undefined;

    const isLoading = searchUsersQuery.isLoading || searchGamesQuery.isLoading;
    const isError = searchGamesQuery.isError && searchUsersQuery.isError;
    const isEmpty = isGamesEmpty && isUsersEmpty;
    const showHotkeyTip = value == undefined || value.length === 0;

    const options = useMemo(() => {
        if (isEmpty) return undefined;
        const options: ReactElement[] = [];
        searchGamesQuery.data?.data?.items?.forEach((game) => {
            options.push(<GameSelectOption key={game.id} game={game} />);
        });
        searchUsersQuery.data?.data?.items?.forEach((user) => {
            options.push(<UserSelectOption userId={user.userId!} />);
        });

        return options;
    }, [
        isEmpty,
        searchGamesQuery.data?.data?.items,
        searchUsersQuery.data?.data?.items,
    ]);

    return (
        <Group
            wrap={"nowrap"}
            className="w-full"
            justify="center"
            align="start"
            gap={0}
            ref={searchBarClickOutsideRef}
        >
            <Combobox
                store={combobox}
                withinPortal={false}
                onOptionSubmit={(value, options) =>
                    onOptionSubmit(value, options, combobox)
                }
            >
                <FocusTrap active={focusActive}>
                    <Combobox.Target>
                        <TextInput
                            {...others}
                            placeholder={"Search for users or games"}
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
                                    {showHotkeyTip ? (
                                        <Group wrap={"nowrap"} gap={3} mr={30}>
                                            {!onMobile && (
                                                <>
                                                    <Kbd>&#8679;</Kbd> +{" "}
                                                    <Kbd>F</Kbd>
                                                </>
                                            )}
                                        </Group>
                                    ) : (
                                        <>
                                            <Box w={"1rem"}>
                                                {searchGamesQuery.isFetching && (
                                                    <IconLoader size={"1rem"} />
                                                )}
                                            </Box>
                                            <Box w={"1rem"} mr={25}>
                                                <IconX
                                                    size={"1rem"}
                                                    onClick={onClear}
                                                />
                                            </Box>
                                        </>
                                    )}
                                </Group>
                            }
                        />
                    </Combobox.Target>
                </FocusTrap>

                <Combobox.Dropdown hidden={!isQueryEnabled}>
                    <Combobox.Options>
                        <ScrollArea.Autosize h={400}>
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
export default GlobalNavbarSearchBar;
