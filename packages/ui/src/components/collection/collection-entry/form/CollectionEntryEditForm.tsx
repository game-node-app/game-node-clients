import { useUserId } from "#@/components/auth/hooks/index.ts";
import {
  DEFAULT_GAME_INFO_VIEW_DTO,
  DEFAULT_RELATED_GAMES_DTO,
  useGame,
} from "#@/components/game/index.ts";
import { CenteredErrorMessage } from "#@/components/general/CenteredErrorMessage.tsx";
import { CenteredLoading } from "#@/components/general/CenteredLoading.tsx";
import { useOnMobilePlatform } from "#@/components/index.ts";
import { useReviewForUserIdAndGameId } from "#@/components/review/index.ts";
import { createErrorNotification } from "#@/util/createErrorNotification.ts";
import { BaseModalChildrenProps } from "#@/util/index.ts";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Tabs } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "@repo/locales";
import {
  CollectionEntry,
  CollectionsEntriesService,
  ReviewsService,
} from "@repo/wrapper/server";
import {
  IconAppsFilled,
  IconFileDescription,
  IconStarsFilled,
} from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { SessionAuth } from "supertokens-auth-react/recipe/session";
import { z } from "zod";
import { useOwnCollectionEntryForGameId } from "../hooks";
import { CollectionEntryFormDetailsPanel } from "./CollectionEntryFormDetailsPanel";
import { CollectionEntryFormDlcsPanel } from "./CollectionEntryFormDlcsPanel";
import { CollectionEntryFormReviewPanel } from "./CollectionEntryFormReviewPanel";

const createGameAddOrUpdateSchema = (
  t: ReturnType<typeof useTranslation>["t"],
) =>
  z.object({
    collectionIds: z.array(
      z.string({
        message: t("collectionEntry.validation.collectionRequired"),
      }),
      {
        message: t("collectionEntry.validation.collectionRequired"),
      },
    ),
    platformsIds: z
      .array(
        z.number({
          message: t("collectionEntry.validation.platformRequired"),
        }),
        {
          message: t("collectionEntry.validation.platformRequired"),
        },
      )
      .min(1, t("collectionEntry.validation.platformRequired")),
    finishedAt: z.date().nullable(),
    status: z.enum(CollectionEntry.status),
    review: z.object({
      rating: z
        .number({ message: t("collectionEntry.validation.ratingInvalid") })
        .nullish(),
      content: z.string().nullish(),
    }),
    relatedGamesIds: z.array(z.number()),
  });

export type TGameAddOrUpdateValues = z.infer<
  ReturnType<typeof createGameAddOrUpdateSchema>
>;

export interface IGameAddFormProps extends BaseModalChildrenProps {
  gameId: number;
  showGameInfo?: boolean;
}

/**
 * A component that handles the creation or editing of a collection entry for a game in the user's library.
 * It allows users to select collections, platforms, update statuses, set completion dates, and save the game to their library.
 *
 */
const CollectionEntryEditForm = ({
  gameId,
  showGameInfo = true,
  onClose,
}: IGameAddFormProps) => {
  const { t } = useTranslation();
  const isMobilePlatform = useOnMobilePlatform();

  const GameAddOrUpdateSchema = useMemo(
    () => createGameAddOrUpdateSchema(t),
    [t],
  );

  const form = useForm<TGameAddOrUpdateValues>({
    mode: "onSubmit",
    resolver: zodResolver(GameAddOrUpdateSchema),
    defaultValues: {
      status: CollectionEntry.status.PLANNED,
      finishedAt: new Date(),
      relatedGamesIds: [],
      collectionIds: [],
      review: {},
    },
  });

  const { handleSubmit } = form;

  const userId = useUserId();

  const queryClient = useQueryClient();

  const collectionEntryQuery = useOwnCollectionEntryForGameId(gameId);

  const reviewQuery = useReviewForUserIdAndGameId(userId, gameId);

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

      const previousReview = reviewQuery.data;

      if (
        previousReview?.rating === reviewInfo.rating &&
        previousReview?.content === reviewInfo.content
      ) {
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

      await CollectionsEntriesService.collectionsEntriesControllerCreateOrUpdateV1(
        {
          collectionIds: collectionIds,
          gameId: gameId,
          platformIds: data.platformsIds,
          finishedAt:
            data.finishedAt instanceof Date
              ? data.finishedAt.toISOString()
              : null,
          status: data.status,
          relatedGameIds: data.relatedGamesIds,
        },
      );

      const hasReview = data.review != undefined;

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
        title: t("notifications.titles.success"),
        message: isUpdateAction
          ? t("collectionEntry.messages.updateSuccess")
          : t("collectionEntry.messages.addSuccess"),
        color: "green",
      });

      if (onClose) {
        onClose();
      }
    },
    onError: (err) => {
      console.error(err);
      notifications.show({
        title: t("notifications.titles.error"),
        message: t("notifications.messages.error"),
        color: "red",
      });
    },
  });

  const onSubmit = async (data: TGameAddOrUpdateValues) => {
    collectionEntryMutation.mutate(data);
  };

  if (gameQuery.isLoading || collectionEntryQuery.isLoading) {
    return <CenteredLoading />;
  } else if (gameQuery.isError) {
    return (
      <CenteredErrorMessage
        message={t("collectionEntry.messages.fetchError")}
      />
    );
  }

  return (
    <SessionAuth>
      <FormProvider {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className={"mb-6 lg:mb-2"}>
          <Tabs
            defaultValue={"details"}
            allowTabDeactivation={false}
            variant={"default"}
            keepMounted={true}
            classNames={{
              root: "w-full h-full relative",
            }}
          >
            <Tabs.List
              className={
                "bg-body mb-1.5 lg:me-1 sticky top-sticky-safe z-10 flex-nowrap overflow-x-auto"
              }
              data-native={isMobilePlatform ? "true" : "false"}
            >
              <Tabs.Tab
                value={"details"}
                leftSection={<IconFileDescription size={24} />}
              >
                {t("collectionEntry.tabs.details")}
              </Tabs.Tab>
              <Tabs.Tab
                value={"review"}
                leftSection={<IconStarsFilled size={24} />}
              >
                {t("collectionEntry.tabs.review")}
              </Tabs.Tab>
              <Tabs.Tab
                value={"dlcs"}
                leftSection={<IconAppsFilled size={24} />}
                disabled={!hasRelatedGames}
              >
                {t("collectionEntry.tabs.dlcs")}
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
            {isUpdateAction
              ? t("collectionEntry.buttons.update")
              : t("collectionEntry.buttons.add")}
          </Button>
        </form>
      </FormProvider>
    </SessionAuth>
  );
};

export { CollectionEntryEditForm };
