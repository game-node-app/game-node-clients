import React, { useMemo } from "react";
import { Button, Tabs } from "@mantine/core";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { notifications } from "@mantine/notifications";
import {
  CollectionEntry,
  CollectionsEntriesService,
  ReviewsService,
} from "@repo/wrapper/server";
import { useGame } from "#@/components/game/hooks/useGame";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BaseModalChildrenProps } from "#@/util/types/modal-props";
import { useOwnCollectionEntryForGameId } from "#@/components/collection/collection-entry/hooks/useOwnCollectionEntryForGameId";
import { SessionAuth } from "supertokens-auth-react/recipe/session";
import { CenteredLoading } from "#@/components/general/CenteredLoading";
import { CenteredErrorMessage } from "#@/components/general/CenteredErrorMessage";
import {
  EMatomoEventAction,
  EMatomoEventCategory,
  trackMatomoEvent,
} from "#@/util/trackMatomoEvent";
import {
  CollectionEntryFormDetailsPanel,
  CollectionEntryFormDlcsPanel,
  CollectionEntryFormReviewPanel,
  DEFAULT_GAME_INFO_VIEW_DTO,
  DEFAULT_RELATED_GAMES_DTO,
  useOnMobilePlatform,
} from "#@/components";
import {
  IconAppsFilled,
  IconFileDescription,
  IconStarsFilled,
} from "@tabler/icons-react";
import { createErrorNotification } from "#@/util";

const GameAddOrUpdateSchema = z.object({
  collectionIds: z.array(z.string(), {
    invalid_type_error: "Collection must be valid.",
  }),
  platformsIds: z
    .array(z.string(), {
      invalid_type_error: "Select at least one platform.",
      required_error: "Select at least one platform.",
    })
    .min(1, "Select at least one platform."),
  finishedAt: z.date().nullable(),
  status: z.nativeEnum(CollectionEntry.status),
  review: z.object({
    rating: z
      .number({ message: "Rating must be a number between 1 and 5." })
      .nullish(),
    content: z.string().nullish(),
  }),
  relatedGamesIds: z.array(z.number()).default([]),
});

export type TGameAddOrUpdateValues = z.infer<typeof GameAddOrUpdateSchema>;

export interface IGameAddFormProps extends BaseModalChildrenProps {
  gameId: number;
  showGameInfo?: boolean;
}

/**
 * A component that handles the creation or editing of a collection entry for a game in the user's library.
 * It allows users to select collections, platforms, update statuses, set completion dates, and save the game to their library.
 * The component manages form behavior, validation, and submission logic, and synchronizes with the backend and local state.
 *
 * Props:
 * - `gameId` (string): The ID of the game to create or update a collection entry for.
 * - `showGameInfo` (boolean, optional): Boolean flag to indicate if game details such as the cover image should be displayed. Default is set to `true`.
 * - `onClose` (function, optional): Callback function invoked when the form is closed or successfully submitted.
 */
const CollectionEntryEditForm = ({
  gameId,
  showGameInfo = true,
  onClose,
}: IGameAddFormProps) => {
  const isMobilePlatform = useOnMobilePlatform();

  const form = useForm<TGameAddOrUpdateValues>({
    mode: "onSubmit",
    resolver: zodResolver(GameAddOrUpdateSchema),
    defaultValues: {
      status: CollectionEntry.status.PLANNED,
      finishedAt: null,
      relatedGamesIds: [],
      collectionIds: [],
      review: {},
    },
  });

  const {
    handleSubmit,
    formState: { touchedFields },
  } = form;
  const queryClient = useQueryClient();

  const collectionEntryQuery = useOwnCollectionEntryForGameId(gameId);

  /**
   * We re-use the default DTO here because the query is probably already cached for it at this point
   */
  const gameQuery = useGame(gameId, DEFAULT_GAME_INFO_VIEW_DTO);

  const gameWithRelatedGamesQuery = useGame(gameId, DEFAULT_RELATED_GAMES_DTO);

  const hasRelatedGames = useMemo(() => {
    if (gameWithRelatedGamesQuery.data) {
      const game = gameWithRelatedGamesQuery.data;
      return game.dlcs.length > 0 || game.expansions.length > 0;
    }

    return false;
  }, [gameWithRelatedGamesQuery.data]);

  const isUpdateAction = collectionEntryQuery.data != null;

  const quickReviewMutation = useMutation({
    mutationFn: async (reviewInfo: TGameAddOrUpdateValues["review"]) => {
      if (reviewInfo.rating == null || typeof reviewInfo.rating !== "number") {
        return;
      }
      await ReviewsService.reviewsControllerCreateOrUpdateV1({
        rating: reviewInfo.rating,
        gameId,
        content: reviewInfo.content ?? undefined,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["review"],
      });
    },
    onError: createErrorNotification,
  });

  const collectionEntryMutation = useMutation({
    mutationFn: async (data: TGameAddOrUpdateValues) => {
      const collectionIds = data.collectionIds;
      const parsedPlatformIds = data.platformsIds.map((id) => parseInt(id));

      await CollectionsEntriesService.collectionsEntriesControllerCreateOrUpdateV1(
        {
          collectionIds: collectionIds,
          gameId: gameId,
          platformIds: parsedPlatformIds,
          finishedAt:
            data.finishedAt instanceof Date
              ? data.finishedAt.toISOString()
              : null,
          status: data.status,
          relatedGameIds: data.relatedGamesIds,
        },
      );

      const hasReview =
        data.review != undefined &&
        (touchedFields.review?.rating != undefined ||
          touchedFields.review?.content != undefined);

      if (hasReview) {
        quickReviewMutation.mutate(data.review);
      }
    },
    onSettled: () => {
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
      <FormProvider {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Tabs
            defaultValue={"details"}
            allowTabDeactivation={false}
            variant={"default"}
            keepMounted={false}
            classNames={{
              root: "w-full h-full relative",
            }}
          >
            <Tabs.List
              className={"bg-body mb-1 lg:me-1 sticky top-sticky-safe z-10"}
              data-native={isMobilePlatform ? "true" : "false"}
            >
              <Tabs.Tab
                value={"details"}
                leftSection={<IconFileDescription size={24} />}
              >
                Details
              </Tabs.Tab>
              <Tabs.Tab
                value={"review"}
                leftSection={<IconStarsFilled size={24} />}
              >
                Review
              </Tabs.Tab>
              <Tabs.Tab
                value={"dlcs"}
                leftSection={<IconAppsFilled size={24} />}
                disabled={!hasRelatedGames}
              >
                DLCs
              </Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value={"details"}>
              <CollectionEntryFormDetailsPanel
                gameId={gameId}
                showGameInfo={showGameInfo}
              />
            </Tabs.Panel>
            <Tabs.Panel value={"review"}>
              <CollectionEntryFormReviewPanel gameId={gameId} />
            </Tabs.Panel>
            <Tabs.Panel value={"dlcs"}>
              <CollectionEntryFormDlcsPanel gameId={gameId} />
            </Tabs.Panel>
          </Tabs>
          <Button
            type={"submit"}
            loading={collectionEntryMutation.isPending}
            className={"w-full mt-4"}
          >
            {isUpdateAction ? "Update" : "Add"}
          </Button>
        </form>
      </FormProvider>
    </SessionAuth>
  );
};

export { CollectionEntryEditForm };
