import React, { useMemo } from "react";
import { z } from "zod";
import {
  CancelablePromise,
  CollectionsEntriesService,
  Game,
  GamePlatform,
} from "@repo/wrapper/server";
import { Button, ComboboxItem, MultiSelect, Stack } from "@mantine/core";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { useUserLibrary } from "#@/components/library/hooks/useUserLibrary";
import { BaseModalChildrenProps } from "#@/util/types/modal-props";
import { useMutation } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { useGames } from "#@/components/game/hooks/useGames";
import { useCollectionEntriesForCollectionId } from "#@/components";
import { useTranslation } from "@repo/locales";

const createCollectionEntriesMoveFormSchema = (
  t: ReturnType<typeof useTranslation>["t"],
) =>
  z.object({
    gameIds: z
      .array(z.number())
      .min(1, t("collection.messages.atLeastOneGame")),
    targetCollectionIds: z.array(
      z.string({
        error: t("collection.messages.targetCollectionStringError"),
      }),
      {
        error: t("collection.messages.atLeastOneCollection"),
      },
    ),
  });

type CollectionEntriesMoveFormValues = z.infer<
  ReturnType<typeof createCollectionEntriesMoveFormSchema>
>;

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
  const { t } = useTranslation();
  const schema = useMemo(() => createCollectionEntriesMoveFormSchema(t), [t]);
  const { register, handleSubmit, setValue, formState } =
    useForm<CollectionEntriesMoveFormValues>({
      mode: "onSubmit",
      resolver: zodResolver(schema),
    });
  const userId = useUserId();
  const libraryQuery = useUserLibrary(userId);
  const collectionsEntriesQuery = useCollectionEntriesForCollectionId({
    collectionId,
    orderBy: {
      addedDate: "DESC",
    },
    limit: 999999,
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
          return entry.gameId != undefined && gameIds.includes(entry.gameId);
        });
      if (
        relevantCollectionEntries == undefined ||
        relevantCollectionEntries.length === 0
      ) {
        throw new Error(t("collection.messages.relevantFilteringFailed"));
      }

      const promises: Promise<CancelablePromise<never>>[] = [];
      for (const entry of relevantCollectionEntries) {
        const ownedPlatformsIds = entry.ownedPlatforms.map(
          (platform) => platform.id,
        );
        const replacePromise =
          CollectionsEntriesService.collectionsEntriesControllerCreateOrUpdateV1(
            {
              status: entry.status,
              platformIds: ownedPlatformsIds,
              collectionIds: targetCollectionsIds,
              gameId: entry.gameId,
            },
          );
        promises.push(replacePromise);
      }
      return Promise.all(promises);
    },
    onSuccess: (data, variables) => {
      const movedItemsLength = variables.gameIds.length;
      notifications.show({
        message: t("collectionEntry.messages.moveSuccess", {
          count: movedItemsLength,
        }),
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
  return (
    <form
      className={"w-full h-full"}
      onSubmit={handleSubmit((data) => collectionsMutation.mutate(data))}
    >
      <Stack w={"100%"} h={"100%"} p={0} align={"center"}>
        <MultiSelect
          w={"100%"}
          data={gamesSelectOptions}
          label={t("collection.messages.gamesToMove")}
          description={t("collection.messages.gamesToMoveHint")}
          searchable
          limit={20}
          {...register("gameIds")}
          onChange={(values) => {
            const valuesNumbers = values.map((v) => Number.parseInt(v));
            setValue("gameIds", valuesNumbers);
          }}
          error={formState.errors.gameIds?.message}
          placeholder={gamesQuery.isLoading ? t("common.loading") : undefined}
        />
        <MultiSelect
          mt={"1rem"}
          w={"100%"}
          data={collectionsSelectOptions}
          label={t("collection.messages.targetCollections")}
          searchable
          description={t("collection.messages.targetCollectionsHint")}
          error={formState.errors.targetCollectionIds?.message}
          {...register("targetCollectionIds")}
          onChange={(values) => {
            setValue("targetCollectionIds", values);
          }}
          placeholder={gamesQuery.isLoading ? t("common.loading") : undefined}
        />
        <Button type={"submit"} loading={collectionsMutation.isPending}>
          {t("actions.submit")}
        </Button>
      </Stack>
    </form>
  );
};

export { CollectionEntriesMoveForm };
