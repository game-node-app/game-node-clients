import { useRouter } from "next/router";
import { useImporterEntries } from "@/components/importer/hooks/useImporterEntries";
import {
    ActionIcon,
    Box,
    Button,
    Center,
    Container,
    Flex,
    Group,
    Image,
    Paper,
    Skeleton,
    Space,
    Stack,
    Text,
    Title,
} from "@mantine/core";
import { getServerStoredIcon } from "@/util/getServerStoredImages";
import ImporterCollectionSelect from "@/components/importer/ImporterCollectionSelect";
import useUserId from "@/components/auth/hooks/useUserId";
import { useGames } from "@/components/game/hooks/useGames";
import React, { useCallback, useEffect, useState } from "react";
import GameSelectView from "@/components/game/view/select/GameSelectView";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
    CollectionsEntriesService,
    GamePlatform,
    ImporterService,
} from "@/wrapper/server";
import { useUserLibrary } from "@/components/library/hooks/useUserLibrary";
import { notifications } from "@mantine/notifications";
import CenteredErrorMessage from "@/components/general/CenteredErrorMessage";
import {
    IconCheckbox,
    IconSquareCheck,
    IconSquareCheckFilled,
} from "@tabler/icons-react";
import {
    EMatomoEventAction,
    EMatomoEventCategory,
    trackMatomoEvent,
} from "@/util/trackMatomoEvent";

const ImporterFormSchema = z.object({
    selectedCollectionIds: z
        .array(z.string())
        .min(1, "Select at least one collection"),
    selectedGameIds: z.array(z.number()).min(1, "Select at least one game."),
    page: z.number().default(1),
});

type ImporterFormValues = z.infer<typeof ImporterFormSchema>;

const DEFAULT_LIMIT = 20;

function TypePage() {
    const router = useRouter();
    const { type } = router.query;

    const userId = useUserId();

    const userLibrary = useUserLibrary(userId);

    const { register, watch, handleSubmit, formState, setValue } =
        useForm<ImporterFormValues>({
            mode: "onBlur",
            resolver: zodResolver(ImporterFormSchema),
            defaultValues: {
                page: 1,
                selectedCollectionIds: [],
                selectedGameIds: [],
            },
        });

    const selectedGameIds = watch("selectedGameIds");
    const selectedCollectionIds = watch("selectedCollectionIds");
    const page = watch("page");

    const [
        hasSelectedFinishedGamesCollection,
        setHasSelectedFinishedGamesCollection,
    ] = useState(false);

    const importerEntriesQuery = useImporterEntries({
        source: type as string,
        limit: DEFAULT_LIMIT,
        offset: (page - 1) * DEFAULT_LIMIT,
    });

    const gameIds = importerEntriesQuery.data?.data.map(
        (externalGame) => externalGame.gameId,
    );

    const gamesQuery = useGames(
        {
            gameIds,
            relations: {
                cover: true,
            },
        },
        true,
    );
    const isLoading = importerEntriesQuery.isLoading || gamesQuery.isLoading;
    const isError = importerEntriesQuery.isError || gamesQuery.isError;
    const isEmpty =
        !isLoading &&
        !isError &&
        (importerEntriesQuery.data == undefined ||
            importerEntriesQuery.data.data.length === 0);

    const error = importerEntriesQuery.error || gamesQuery.error;

    const isAllGamesSelected =
        gameIds != undefined && selectedGameIds.length === gameIds.length;

    const buildLoadingSkeletons = useCallback(() => {
        return new Array(10).fill(0).map((v, i) => {
            return <Skeleton key={i} className={"w-full h-60 mt-4"} />;
        });
    }, []);

    const resetSelectedGames = () => {
        setValue("selectedGameIds", []);
    };

    const handleSelection = (gameId: number) => {
        const indexOfElement = selectedGameIds.indexOf(gameId);
        const isAlreadyPresent = indexOfElement > -1;

        if (isAlreadyPresent) {
            const updatedArray = selectedGameIds.toSpliced(indexOfElement, 1);
            setValue("selectedGameIds", updatedArray);
            return;
        }

        setValue("selectedGameIds", selectedGameIds.concat([gameId]));
    };

    const removeExcludedItemMutation = useMutation({
        mutationFn: async (gameId: number) => {
            const externalGame = importerEntriesQuery.data?.data.find(
                (externalGame) => {
                    return externalGame.gameId === gameId;
                },
            );

            if (!externalGame) {
                throw new Error(
                    "Error while inserting game. Invalid external game ID. Please contact support.",
                );
            }

            await ImporterService.importerControllerChangeStatusV1({
                externalGameId: externalGame.id,
                status: "ignored",
            });

            return gameId;
        },
        onSuccess: () => {
            notifications.show({
                color: "green",
                message: `Successfully excluded item already in your library.`,
            });
        },
        onSettled: () => {
            importerEntriesQuery.invalidate();
            gamesQuery.invalidate();
        },
    });

    const importMutation = useMutation({
        mutationFn: async ({
            selectedCollectionIds,
            selectedGameIds,
        }: ImporterFormValues) => {
            const importedGameIds: number[] = [];
            for (const selectedGameId of selectedGameIds) {
                const importerItem = importerEntriesQuery.data?.data.find(
                    (externalGame) => {
                        return externalGame.gameId === selectedGameId;
                    },
                );

                if (!importerItem) {
                    throw new Error(
                        "Error while inserting game. Invalid external game ID. Please contact support.",
                    );
                }

                await CollectionsEntriesService.collectionsEntriesControllerCreateOrUpdateV1(
                    {
                        gameId: selectedGameId,
                        collectionIds: selectedCollectionIds,
                        platformIds: [importerItem.preferredPlatformId],
                        isFavorite: false,
                    },
                );
                await ImporterService.importerControllerChangeStatusV1({
                    externalGameId: importerItem.id,
                    status: "processed",
                });
                importedGameIds.push(selectedGameId);
            }

            return importedGameIds.length;
        },
        onSuccess: (importedGamesCount) => {
            notifications.show({
                color: "green",
                message: `Successfully imported ${importedGamesCount} games to your library!`,
            });
            trackMatomoEvent(
                EMatomoEventCategory.Importer,
                EMatomoEventAction.Create,
                `Imported ${importedGamesCount} games from source ${type}`,
            );
            resetSelectedGames();
        },
        onSettled: () => {
            importerEntriesQuery.invalidate();
            gamesQuery.invalidate();
        },
        onError: (err) => {
            notifications.show({
                color: "red",
                message: `Error while importing games: ${err.message}`,
            });
        },
    });

    useEffect(() => {
        if (
            userLibrary.data == undefined ||
            userLibrary.data.collections == undefined
        ) {
            return;
        }

        const hasSelected = userLibrary.data.collections.some((collection) => {
            return (
                collection.isFinished &&
                selectedCollectionIds.includes(collection.id)
            );
        });

        setHasSelectedFinishedGamesCollection(hasSelected);
    }, [
        hasSelectedFinishedGamesCollection,
        setHasSelectedFinishedGamesCollection,
        userLibrary.data,
        selectedCollectionIds,
    ]);

    return (
        <Flex justify={"center"} mih={"100vh"} p={0} wrap={"wrap"}>
            <Paper className={"w-full lg:w-10/12 p-4"}>
                <form
                    className={"w-full h-full flex flex-col"}
                    onSubmit={handleSubmit((data) => {
                        importMutation.mutate(data);
                    })}
                >
                    <Group
                        className={"w-full border-[#302D2D] border-2 py-2 px-4"}
                    >
                        <Group className={"w-full lg:w-6/12 flex-nowrap"}>
                            <Image
                                src={getServerStoredIcon(type as string)}
                                w={48}
                                h={48}
                            />
                            <Stack gap={4}>
                                <Title size={"h4"}>
                                    GAME{" "}
                                    <span className={"text-[#F15025]"}>
                                        IMPORTER
                                    </span>
                                </Title>
                                <Text>
                                    Select one or multiple games which you want
                                    to bring to your GameNode library.
                                </Text>
                            </Stack>
                        </Group>
                        <Stack className={"w-full lg:ms-auto lg:w-4/12"}>
                            <ImporterCollectionSelect
                                userId={userId}
                                onChange={(values) => {
                                    setValue("selectedCollectionIds", values);
                                }}
                                error={
                                    formState.errors.selectedCollectionIds
                                        ?.message
                                }
                            />
                            {hasSelectedFinishedGamesCollection && (
                                <Text className={"text-sm text-yellow-300"}>
                                    Selected games will be marked as "Finished"
                                    because a collection for finished games is
                                    being used. You can change the finish date
                                    later.
                                </Text>
                            )}
                        </Stack>
                        <Center w={"100%"}>
                            <Button
                                type={"submit"}
                                loading={importMutation.isPending}
                                disabled={isLoading || isError || isEmpty}
                            >
                                Import
                            </Button>
                        </Center>
                        {formState.errors.selectedGameIds != undefined && (
                            <CenteredErrorMessage
                                message={
                                    formState.errors.selectedGameIds.message!
                                }
                            />
                        )}
                    </Group>
                    <Stack className={"mt-4 w-full grow"}>
                        {isError && error && (
                            <CenteredErrorMessage message={error.message} />
                        )}
                        {isEmpty && (
                            <CenteredErrorMessage
                                message={
                                    "No items available for importing. Check if your library at the target platform is set to public."
                                }
                            />
                        )}
                        <GameSelectView>
                            {!isEmpty && (
                                <GameSelectView.Actions
                                    isAllGamesSelected={isAllGamesSelected}
                                    onSelectAll={() => {
                                        if (isAllGamesSelected) {
                                            resetSelectedGames();
                                        } else if (gameIds) {
                                            setValue(
                                                "selectedGameIds",
                                                gameIds,
                                            );
                                        }
                                    }}
                                />
                            )}
                            <GameSelectView.Content
                                items={gamesQuery.data!}
                                checkIsSelected={(gameId) => {
                                    return selectedGameIds.includes(gameId);
                                }}
                                onSelected={(gameId) => handleSelection(gameId)}
                                excludeItemsInLibrary={true}
                                onExcludedItemClick={
                                    removeExcludedItemMutation.mutate
                                }
                            >
                                {isLoading && buildLoadingSkeletons()}
                            </GameSelectView.Content>
                            {!isEmpty && (
                                <Box className={"mt-auto"}>
                                    <GameSelectView.Pagination
                                        paginationInfo={
                                            importerEntriesQuery.data
                                                ?.pagination
                                        }
                                        page={page}
                                        onPaginationChange={(selectedPage) => {
                                            setValue("page", selectedPage);
                                            resetSelectedGames();
                                        }}
                                    />
                                </Box>
                            )}
                        </GameSelectView>
                    </Stack>
                </form>
            </Paper>
        </Flex>
    );
}

export default TypePage;
