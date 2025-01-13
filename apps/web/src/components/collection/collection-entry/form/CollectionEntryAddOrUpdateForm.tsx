import React, { useEffect, useMemo } from "react";
import {
    Box,
    Button,
    ComboboxItem,
    MultiSelect,
    Space,
    Title,
} from "@mantine/core";
import GameFigureImage from "@/components/game/figure/GameFigureImage";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { notifications } from "@mantine/notifications";
import {
    Collection,
    CollectionsEntriesService,
    GamePlatform,
} from "@/wrapper/server";
import { useGame } from "@/components/game/hooks/useGame";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BaseModalChildrenProps } from "@/util/types/modal-props";
import { useOwnCollectionEntryForGameId } from "@/components/collection/collection-entry/hooks/useOwnCollectionEntryForGameId";
import { SessionAuth } from "supertokens-auth-react/recipe/session";
import { useUserLibrary } from "@/components/library/hooks/useUserLibrary";
import useUserId from "@/components/auth/hooks/useUserId";
import { useGamesResource } from "@/components/game/hooks/useGamesResource";
import CenteredLoading from "@/components/general/CenteredLoading";
import CenteredErrorMessage from "@/components/general/CenteredErrorMessage";
import { DatePickerInput } from "@mantine/dates";
import {
    EMatomoEventAction,
    EMatomoEventCategory,
    trackMatomoEvent,
} from "@/util/trackMatomoEvent";

const GameAddOrUpdateSchema = z
    .object({
        collectionIds: z
            .array(z.string(), {
                required_error: "Select at least one collection.",
                invalid_type_error: "Select at least one collection.",
            })
            .min(1, "Select at least one collection.")
            .default([]),
        platformsIds: z
            .array(z.string(), {
                invalid_type_error: "Select at least one platform.",
                required_error: "Select at least one platform.",
            })
            .min(1, "Select at least one platform.")
            .default([]),
        finishedAt: z.date().optional(),
        mandatoryFinished: z.boolean().default(false),
    })
    .refine(
        (data) => {
            return !(data.mandatoryFinished && data.finishedAt == undefined);
        },
        {
            message:
                "Finish date required because a collection for finished games is selected",
            path: ["finishedAt"],
        },
    );

type TGameAddOrUpdateValues = z.infer<typeof GameAddOrUpdateSchema>;

interface IGameAddFormProps extends BaseModalChildrenProps {
    gameId: number;
}

function buildCollectionOptions(
    collections: Collection[] | undefined,
): ComboboxItem[] {
    if (collections == undefined || collections.length === 0) {
        return [];
    }

    return collections.map((collection) => {
        return {
            label: collection.name,
            value: collection.id,
            enabled: true,
        };
    });
}

function buildPlatformsOptions(
    platforms: GamePlatform[] | undefined,
): ComboboxItem[] | undefined {
    if (platforms == undefined || platforms.length === 0) return undefined;
    return platforms
        .filter(
            (platform) =>
                platform.abbreviation != undefined ||
                platform.name != undefined,
        )
        .map((platform) => {
            return {
                label: platform.abbreviation ?? platform.name,
                value: `${platform.id}`,
            };
        });
}

const CollectionEntryAddOrUpdateForm = ({
    gameId,
    onClose,
}: IGameAddFormProps) => {
    const {
        watch,
        register,
        setValue,
        handleSubmit,
        formState: { errors },
    } = useForm<TGameAddOrUpdateValues>({
        mode: "onSubmit",
        resolver: zodResolver(GameAddOrUpdateSchema),
        defaultValues: {
            mandatoryFinished: false,
        },
    });

    const queryClient = useQueryClient();

    const collectionEntryQuery = useOwnCollectionEntryForGameId(gameId);

    /**
     * We re-use the default DTO here because the query is probably already cached for it at this point
     */
    const gameQuery = useGame(gameId, {
        relations: {
            cover: true,
            platforms: true,
        },
    });
    const gamePlatformsQuery = useGamesResource("platforms");

    const game = gameQuery.data;
    const userId = useUserId();

    const userLibraryQuery = useUserLibrary(userId);

    const collectionOptions = useMemo(() => {
        return buildCollectionOptions(userLibraryQuery?.data?.collections);
    }, [userLibraryQuery?.data?.collections]);

    const platformOptions = useMemo(() => {
        if (game && game.platforms != undefined && game.platforms.length > 0) {
            return buildPlatformsOptions(game.platforms);
        }
        return buildPlatformsOptions(gamePlatformsQuery.data);
    }, [game, gamePlatformsQuery.data]);

    const isUpdateAction = collectionEntryQuery.data != null;

    const collectionEntryMutation = useMutation({
        mutationFn: async (data: TGameAddOrUpdateValues) => {
            const collectionIds = data.collectionIds;
            const parsedPlatformIds = data.platformsIds.map((id) =>
                parseInt(id),
            );
            const isFavorite =
                isUpdateAction &&
                collectionEntryQuery.data != undefined &&
                collectionEntryQuery.data.isFavorite;

            await CollectionsEntriesService.collectionsEntriesControllerCreateOrUpdateV1(
                {
                    collectionIds: collectionIds,
                    gameId: gameId,
                    platformIds: parsedPlatformIds,
                    isFavorite: isFavorite,
                    finishedAt:
                        data.finishedAt instanceof Date
                            ? data.finishedAt.toISOString()
                            : undefined,
                },
            );
        },
        onSettled: () => {
            collectionEntryQuery.invalidate();
            queryClient
                .invalidateQueries({
                    queryKey: ["review"],
                })
                .then();
            queryClient
                .invalidateQueries({
                    queryKey: ["game", "all"],
                })
                .then();
        },
        onSuccess: () => {
            notifications.show({
                title: "Success",
                message: isUpdateAction
                    ? "Game updated on your library!"
                    : "Game added to your library!",
                color: "green",
            });

            if (onClose) {
                onClose();
            }

            // Matomo
            if (isUpdateAction) {
                trackMatomoEvent(
                    EMatomoEventCategory.CollectionEntry,
                    EMatomoEventAction.Update,
                    "Updated game in one or more collection(s)",
                );
            } else {
                trackMatomoEvent(
                    EMatomoEventCategory.CollectionEntry,
                    EMatomoEventAction.Create,
                    "Added game in one or more collection(s)",
                );
            }
        },
        onError: (err) => {
            console.error(err);
            notifications.show({
                title: "Error",
                message: "Something went wrong!",
                color: "red",
            });
        },
    });

    const onSubmit = async (data: TGameAddOrUpdateValues) => {
        collectionEntryMutation.mutate(data);
    };

    const platformsIdsValue = watch("platformsIds", []);
    const collectionsIdsValue = watch("collectionIds", []);
    const finishedAtDate = watch("finishedAt");

    /**
     * Effect to sync with user's collection data.
     */
    useEffect(() => {
        const collectionEntry = collectionEntryQuery.data;
        if (collectionEntry != undefined) {
            const finishedDate = collectionEntry.finishedAt
                ? new Date(collectionEntry.finishedAt)
                : undefined;

            setValue("finishedAt", finishedDate);
            const collectionIds = collectionEntry.collections.map(
                (collection) => collection.id,
            );

            if (platformOptions && platformOptions.length > 0) {
                const platformIds = collectionEntry.ownedPlatforms.map(
                    (platform) => platform.id,
                );
                const uniquePlatformIds = Array.from(new Set(platformIds));
                setValue(
                    "platformsIds",
                    uniquePlatformIds.map((v) => `${v}`),
                );
            }
            setValue("collectionIds", collectionIds);
        }
    }, [collectionEntryQuery.data, platformOptions, setValue]);

    /**
     * Effect to sync "mandatoryFinished" state with current selected collections
     */
    useEffect(() => {
        const collections = userLibraryQuery.data?.collections;
        if (collections) {
            for (const collection of collections) {
                if (collectionsIdsValue.includes(`${collection.id}`)) {
                    if (collection.isFinished) {
                        setValue("mandatoryFinished", true);
                        if (finishedAtDate == undefined) {
                            setValue("finishedAt", new Date());
                        }
                        break;
                    } else {
                        setValue("mandatoryFinished", false);
                    }
                }
            }
        }
    }, [
        collectionsIdsValue,
        finishedAtDate,
        setValue,
        userLibraryQuery.data?.collections,
    ]);

    if (gameQuery.isLoading || collectionEntryQuery.isLoading) {
        return <CenteredLoading />;
    } else if (gameQuery.isError || collectionEntryQuery.isError) {
        return (
            <CenteredErrorMessage
                message={"Error while fetching data. Please try again."}
            />
        );
    }

    return (
        <SessionAuth>
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="w-full h-full flex flex-col items-center justify-start gap-4"
            >
                <Box className="min-w-[100%] max-w-fit max-h-fit">
                    <GameFigureImage game={game!} />
                </Box>
                <Title size={"h5"}>{game?.name}</Title>
                <Space />
                <MultiSelect
                    {...register("collectionIds")}
                    value={collectionsIdsValue || []}
                    className={"w-full"}
                    data={collectionOptions}
                    onChange={(value) => {
                        setValue("collectionIds", value);
                    }}
                    placeholder={"Select collections"}
                    label={"Collections"}
                    error={errors.collectionIds?.message}
                    withAsterisk
                    searchable
                    limit={10}
                    description={"Which collections do you want to save it on?"}
                />
                <Space />
                <MultiSelect
                    {...register("platformsIds")}
                    value={platformsIdsValue || []}
                    className={"w-full"}
                    data={platformOptions}
                    onChange={(value) => {
                        setValue("platformsIds", value);
                    }}
                    searchable
                    placeholder={"Select platforms"}
                    label={"Platforms"}
                    error={errors.platformsIds?.message}
                    withAsterisk
                    limit={20}
                    description={
                        "You can search for a platform by typing it's name"
                    }
                />
                <Space />
                <DatePickerInput
                    {...register("finishedAt", {
                        setValueAs: (v) => v || undefined,
                    })}
                    error={errors.finishedAt?.message}
                    label={"Finished date"}
                    description={
                        "Date in which you've finished this game. Leave empty if it's not finished yet."
                    }
                    onChange={(date) => {
                        setValue("finishedAt", date || undefined);
                    }}
                    value={finishedAtDate}
                    clearable
                    maxDate={new Date()}
                    required={watch("mandatoryFinished")}
                />

                <Button
                    type={"submit"}
                    loading={collectionEntryMutation.isPending}
                >
                    {isUpdateAction ? "Update" : "Add"}
                </Button>
            </form>
        </SessionAuth>
    );
};

export default CollectionEntryAddOrUpdateForm;
