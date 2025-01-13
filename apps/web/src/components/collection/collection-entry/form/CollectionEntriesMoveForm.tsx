import React, { useMemo } from "react";
import { useCollectionEntriesForCollectionId } from "@/components/collection/collection-entry/hooks/useCollectionEntriesForCollectionId";
import { z } from "zod";
import {
    CancelablePromise,
    CollectionsEntriesService,
    Game,
    GamePlatform,
} from "@/wrapper/server";
import {
    Button,
    Combobox,
    ComboboxItem,
    MultiSelect,
    Stack,
    Text,
    TextInput,
    Title,
    useCombobox,
} from "@mantine/core";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useUserId from "@/components/auth/hooks/useUserId";
import { useUserLibrary } from "@/components/library/hooks/useUserLibrary";
import { BaseModalChildrenProps } from "@/util/types/modal-props";
import { useMutation } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { useGames } from "@/components/game/hooks/useGames";
import { useRouter } from "next/router";

const CollectionEntriesMoveFormSchema = z.object({
    gameIds: z
        .array(z.number())
        .min(1, "At least one game must be selected.")
        .default([]),
    targetCollectionIds: z.array(z.string(), {
        required_error: "At least one collection must be selected",
        invalid_type_error:
            "Target collections returned as string. Please contact support.",
    }),
});

type CollectionEntriesMoveFormValues = z.infer<
    typeof CollectionEntriesMoveFormSchema
>;
interface ISelectionOptionProps {
    game: Game;
    ownedPlatforms: GamePlatform[];
}
const SelectionOption = ({ game, ownedPlatforms }: ISelectionOptionProps) => {
    const ownedPlatformsNames = ownedPlatforms.map((p) => p.name).join(", ");
    return (
        <Combobox.Option value={`${game.id}`}>
            <Stack>
                <Text fz={"sm"}>{game.name}</Text>
                <Text fz={"xs"}>{ownedPlatformsNames}</Text>
            </Stack>
        </Combobox.Option>
    );
};

interface ICollectionEntriesMoveFormProps extends BaseModalChildrenProps {
    collectionId: string;
}
/**
 * Form responsible for moving collection entries between collections.
 * Similar to CollectionEntryAddOrUpdateForm, except that this one offers multiple games as input.
 * @constructor
 */
const CollectionEntriesMoveForm = ({
    collectionId,
    onClose,
}: ICollectionEntriesMoveFormProps) => {
    const router = useRouter();
    const { register, handleSubmit, setValue, watch, formState, setError } =
        useForm<CollectionEntriesMoveFormValues>({
            mode: "onSubmit",
            resolver: zodResolver(CollectionEntriesMoveFormSchema),
        });
    const userId = useUserId();
    const libraryQuery = useUserLibrary(userId);
    const collectionsEntriesQuery = useCollectionEntriesForCollectionId({
        collectionId,
        orderBy: {
            addedDate: "DESC",
        },
    });
    const gameIds = collectionsEntriesQuery.data?.data.map(
        (entry) => entry.gameId,
    );
    const gamesQuery = useGames({
        gameIds: gameIds!,
        relations: {
            cover: true,
        },
    });
    const gamesSelectOptions = useMemo(() => {
        if (gamesQuery.data == undefined || gamesQuery.data.length === 0) {
            return undefined;
        }
        return gamesQuery.data.map((game): ComboboxItem => {
            return {
                value: `${game.id}`,
                label: game.name,
            };
        });
    }, [gamesQuery.data]);

    const collectionsSelectOptions = useMemo(() => {
        if (
            libraryQuery.data == undefined ||
            libraryQuery.data.collections == undefined ||
            libraryQuery.data.collections.length === 0
        ) {
            return undefined;
        }
        return libraryQuery.data.collections
            .filter((collection) => collection.id !== collectionId)
            .map((collection): ComboboxItem => {
                return {
                    label: collection.name,
                    value: collection.id,
                };
            });
    }, [collectionId, libraryQuery.data]);

    const collectionsMutation = useMutation({
        mutationFn: (data: CollectionEntriesMoveFormValues) => {
            const gameIds = data.gameIds;
            const targetCollectionsIds = data.targetCollectionIds;
            const relevantCollectionEntries =
                collectionsEntriesQuery.data?.data.filter((entry) => {
                    return (
                        entry.gameId != undefined &&
                        gameIds.includes(entry.gameId)
                    );
                });
            if (
                relevantCollectionEntries == undefined ||
                relevantCollectionEntries.length === 0
            ) {
                throw new Error(
                    "Relevant collection entry filtering is failing. Please contact support.",
                );
            }

            const promises: Promise<CancelablePromise<any>>[] = [];
            for (const entry of relevantCollectionEntries) {
                const ownedPlatformsIds = entry.ownedPlatforms.map(
                    (platform) => platform.id,
                );
                const replacePromise =
                    CollectionsEntriesService.collectionsEntriesControllerCreateOrUpdateV1(
                        {
                            isFavorite: entry.isFavorite,
                            platformIds: ownedPlatformsIds as unknown as any,
                            collectionIds: targetCollectionsIds,
                            gameId: entry.gameId,
                        },
                    );
                promises.push(replacePromise);
            }
            return Promise.all(promises);
        },
        onSuccess: (data, variables, context) => {
            const movedItemsLength = variables.gameIds.length;
            notifications.show({
                message: `Sucessfully moved ${movedItemsLength} games!`,
                autoClose: 3000,
                color: "green",
            });
            if (onClose) onClose();
        },
        onError: (err) => {
            console.error(err);
            notifications.show({
                message: err.message,
                autoClose: 10000,
                color: "red",
            });
        },
        onSettled: () => {
            gamesQuery.invalidate();
            collectionsEntriesQuery.invalidate();
        },
    });

    const targetCollectionIds = watch("targetCollectionIds");

    const finishedGamesCollectionSelected = useMemo(() => {
        const userCollections = libraryQuery.data?.collections;
        if (
            userCollections != undefined &&
            targetCollectionIds != undefined &&
            targetCollectionIds.length > 0
        ) {
            for (const collection of userCollections) {
                if (
                    collection.isFinished &&
                    targetCollectionIds.includes(`${collection.id}`)
                ) {
                    return true;
                }
            }
        }

        return false;
    }, [libraryQuery.data?.collections, targetCollectionIds]);

    return (
        <form
            className={"w-full h-full"}
            onSubmit={handleSubmit((data) => collectionsMutation.mutate(data))}
        >
            <Stack w={"100%"} h={"100%"} p={0} align={"center"}>
                <MultiSelect
                    w={"100%"}
                    data={gamesSelectOptions}
                    label={"Games to move"}
                    description={
                        "Select which games you want to move. You can search by typing a game's name."
                    }
                    searchable
                    {...register("gameIds")}
                    onChange={(values) => {
                        const valuesNumbers = values.map((v) =>
                            Number.parseInt(v),
                        );
                        setValue("gameIds", valuesNumbers);
                    }}
                    error={formState.errors.gameIds?.message}
                    placeholder={
                        gamesQuery.isLoading ? "Loading..." : undefined
                    }
                />
                <MultiSelect
                    mt={"1rem"}
                    w={"100%"}
                    data={collectionsSelectOptions}
                    label={"Target collections"}
                    searchable
                    description={
                        "Collections in which you want to insert these games. You can search using a collection's name."
                    }
                    error={formState.errors.targetCollectionIds?.message}
                    {...register("targetCollectionIds")}
                    onChange={(values) => {
                        setValue("targetCollectionIds", values);
                    }}
                    placeholder={
                        gamesQuery.isLoading ? "Loading..." : undefined
                    }
                />
                {finishedGamesCollectionSelected && (
                    <Text c={"yellow"} fz={"sm"}>
                        These games will be marked as "Finished" because a
                        "Finished Games" collection has been selected.
                    </Text>
                )}
                <Button type={"submit"} loading={collectionsMutation.isPending}>
                    Submit
                </Button>
            </Stack>
        </form>
    );
};

export default CollectionEntriesMoveForm;
