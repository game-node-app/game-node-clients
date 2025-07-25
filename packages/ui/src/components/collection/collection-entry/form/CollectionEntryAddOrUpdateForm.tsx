import React, { useEffect, useMemo } from "react";
import {
  Button,
  ComboboxItem,
  Divider,
  Fieldset,
  Group,
  Input,
  InputLabel,
  MultiSelect,
  Stack,
  Title,
} from "@mantine/core";
import { GameFigureImage } from "#@/components/game/figure/GameFigureImage";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { notifications } from "@mantine/notifications";
import {
  Collection,
  CollectionEntry,
  CollectionsEntriesService,
  GamePlatform,
  ReviewsService,
} from "../../../../../../wrapper/src/server";
import { useGame } from "#@/components/game/hooks/useGame";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BaseModalChildrenProps } from "#@/util/types/modal-props";
import { useOwnCollectionEntryForGameId } from "#@/components/collection/collection-entry/hooks/useOwnCollectionEntryForGameId";
import { SessionAuth } from "supertokens-auth-react/recipe/session";
import { useUserLibrary } from "#@/components/library/hooks/useUserLibrary";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { useGamesResource } from "#@/components/game/hooks/useGamesResource";
import { CenteredLoading } from "#@/components/general/CenteredLoading";
import { CenteredErrorMessage } from "#@/components/general/CenteredErrorMessage";
import { DatePickerInput } from "@mantine/dates";
import {
  EMatomoEventAction,
  EMatomoEventCategory,
  trackMatomoEvent,
} from "#@/util/trackMatomoEvent";
import {
  CollectionEntryStatusSelect,
  GameRating,
  ImageSize,
  useOnMobile,
} from "#@/components";
import { createErrorNotification } from "#@/util";

const GameAddOrUpdateSchema = z.object({
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
  finishedAt: z.date().nullable(),
  status: z.nativeEnum(CollectionEntry.status),
});

type TGameAddOrUpdateValues = z.infer<typeof GameAddOrUpdateSchema>;

interface IGameAddFormProps extends BaseModalChildrenProps {
  gameId: number;
  showGameInfo?: boolean;
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
        platform.abbreviation != undefined || platform.name != undefined,
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
  showGameInfo = true,
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
      status: CollectionEntry.status.PLANNED,
      finishedAt: null,
    },
  });

  const onMobile = useOnMobile();

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
      const parsedPlatformIds = data.platformsIds.map((id) => parseInt(id));
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
              : null,
          status: data.status,
        },
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["review"],
      });
      queryClient.invalidateQueries({
        queryKey: ["collection-entries"],
      });
      queryClient.invalidateQueries({
        queryKey: ["game", "all"],
      });
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
  const status = watch("status");

  /**
   * Effect to sync with user's collection data.
   */
  useEffect(() => {
    const collectionEntry = collectionEntryQuery.data;
    if (collectionEntry != undefined) {
      const finishedDate = collectionEntry.finishedAt
        ? new Date(collectionEntry.finishedAt)
        : null;

      setValue("finishedAt", finishedDate);
      const collectionIds = collectionEntry.collections.map(
        (collection) => collection.id,
      );
      setValue("status", collectionEntry.status);

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
   * Effect to quickly select a non-finished collection when only one is available.
   * Only triggers when the collection entry is 'new' and if no collection has been selected.
   */
  useEffect(() => {
    const collections = userLibraryQuery.data?.collections;
    if (
      collections &&
      collectionsIdsValue.length === 0 &&
      collectionEntryQuery.data == undefined
    ) {
      const nonFinishedGamesCollections = collections.filter(
        (collection) => !collection.isFinished,
      );

      if (nonFinishedGamesCollections.length === 1) {
        const collectionId = nonFinishedGamesCollections[0].id;

        setValue("collectionIds", [collectionId]);
      }
    }
  }, [
    collectionEntryQuery.data,
    collectionsIdsValue.length,
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
      <form onSubmit={handleSubmit(onSubmit)} className="w-full h-full">
        <Group
          className={"flex-wrap lg:flex-nowrap lg:items-start w-full h-full "}
        >
          {showGameInfo && (
            <Stack className="w-full items-center justify-start lg:w-1/2">
              <GameFigureImage
                game={game!}
                imageSize={ImageSize.COVER_BIG_2X}
              />
            </Stack>
          )}
          <Divider
            orientation={onMobile ? "horizontal" : "vertical"}
            className={"w-full lg:w-fit"}
          />
          <Stack className={"w-full items-start gap-2 h-full lg:w-1/2"}>
            <Title size={"h5"}>{game?.name}</Title>
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
              description={"You can search for a platform by typing it's name"}
            />

            <CollectionEntryStatusSelect
              selectedCollectionIds={collectionsIdsValue}
              value={status}
              onChange={(v) => setValue("status", v as never)}
            />
            {status === "finished" && (
              <DatePickerInput
                {...register("finishedAt", {
                  setValueAs: (v) => v || null,
                })}
                className={"w-full"}
                error={errors.finishedAt?.message}
                label={"Finished date"}
                description={"Optional. Leave empty if you don't remember."}
                onChange={(date) => {
                  setValue("finishedAt", date || null);
                }}
                value={finishedAtDate}
                clearable
                maxDate={new Date()}
              />
            )}

            <Button
              type={"submit"}
              loading={collectionEntryMutation.isPending}
              className={"w-full mt-4"}
            >
              {isUpdateAction ? "Update" : "Add"}
            </Button>
          </Stack>
        </Group>
      </form>
    </SessionAuth>
  );
};

export { CollectionEntryAddOrUpdateForm };
