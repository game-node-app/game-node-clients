import React from "react";
import { ActionIcon, Button, Group, Stack, Tooltip } from "@mantine/core";
import {
  IconHeartFilled,
  IconHeartPlus,
  IconShare,
  IconX,
} from "@tabler/icons-react";
import { CollectionEntryEditModal } from "#@/components/collection/collection-entry/form/modal/CollectionEntryEditModal.tsx";
import { useDisclosure } from "@mantine/hooks";
import { CollectionsEntriesService, Game } from "@repo/wrapper/server";
import { useMutation } from "@tanstack/react-query";
import { useOwnCollectionEntryForGameId } from "#@/components/collection/collection-entry/hooks/useOwnCollectionEntryForGameId";
import { CollectionEntryRemoveModal } from "#@/components/collection/collection-entry/form/modal/CollectionEntryRemoveModal";
import { useReviewForUserIdAndGameId } from "#@/components/review/hooks/useReviewForUserIdAndGameId";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import {
  EMatomoEventAction,
  EMatomoEventCategory,
  trackMatomoEvent,
} from "#@/util/trackMatomoEvent";
import { Modal } from "#@/util";
import { GameInfoShare } from "#@/components";
import { buildPresenterComponent } from "#@/context";

export interface GameInfoActionsProps {
  wrapperProps?: React.ComponentPropsWithoutRef<typeof Group>;
  game: Game | undefined;
}

/**
 * Component that handles the library-related actions for a game.
 * The game add report is handled here.
 * @constructor
 */
const DEFAULT_GameInfoActions = ({
  game,
  wrapperProps,
}: GameInfoActionsProps) => {
  const [addUpdateModalOpened, addUpdateModalUtils] = useDisclosure();
  const [removeModalOpened, removeModalUtils] = useDisclosure();
  const [shareModalOpened, shareModalUtils] = useDisclosure();

  const userId = useUserId();
  const collectionEntryQuery = useOwnCollectionEntryForGameId(game?.id);

  const gameInLibrary =
    !collectionEntryQuery.isError && collectionEntryQuery.data != undefined;

  const gameInFavorites =
    gameInLibrary && collectionEntryQuery.data!.isFavorite;

  const reviewQuery = useReviewForUserIdAndGameId(userId, game?.id);

  const hasReview = reviewQuery.data != undefined;

  const collectionEntryFavoriteMutation = useMutation({
    mutationFn: (gameId: number) => {
      return CollectionsEntriesService.collectionsEntriesControllerChangeFavoriteStatusV1(
        gameId,
        { isFavorite: !gameInFavorites },
      );
    },

    onSuccess: () => {
      collectionEntryQuery.invalidate();
      if (gameInFavorites) {
        trackMatomoEvent(
          EMatomoEventCategory.Favorites,
          EMatomoEventAction.Remove,
          "Game removed from favorites",
        );
      } else {
        trackMatomoEvent(
          EMatomoEventCategory.Favorites,
          EMatomoEventAction.Create,
          "Game added to favorites",
        );
      }
    },
  });

  if (game == undefined) {
    return null;
  }

  return (
    <Stack align={"center"}>
      <Group gap={"0.725rem"} {...wrapperProps}>
        <CollectionEntryEditModal
          opened={addUpdateModalOpened}
          onClose={addUpdateModalUtils.close}
          gameId={game.id}
        />
        <CollectionEntryRemoveModal
          opened={removeModalOpened}
          onClose={removeModalUtils.close}
          gameId={game.id}
        />
        <Modal
          opened={shareModalOpened}
          onClose={shareModalUtils.close}
          title={"Share"}
        >
          <GameInfoShare
            gameId={game.id}
            onShare={async (file) => {
              const toShare: ShareData = {
                title: "GameNode Share",
                text: `See more at https://gamenode.app/game/${game?.id}`,
                files: [file],
                url: `https://gamenode.app/game/${game?.id}`,
              };

              return await navigator.share(toShare);
            }}
          />
        </Modal>

        <Button
          onClick={addUpdateModalUtils.open}
          loading={collectionEntryQuery.isLoading}
        >
          {gameInLibrary ? "Update" : "Add to library"}
        </Button>

        <Tooltip label={"Add to your favorites"}>
          <ActionIcon
            size="lg"
            variant="default"
            disabled={!gameInLibrary}
            onClick={() => {
              collectionEntryFavoriteMutation.mutate(game.id);
            }}
          >
            {gameInFavorites ? (
              <IconHeartFilled size={"1.05rem"} />
            ) : (
              <IconHeartPlus size={"1.05rem"} />
            )}
          </ActionIcon>
        </Tooltip>

        {gameInLibrary && (
          <Tooltip label={"Remove from your library"}>
            <ActionIcon
              variant="default"
              size="lg"
              onClick={removeModalUtils.open}
            >
              <IconX color="red" />
            </ActionIcon>
          </Tooltip>
        )}
        {hasReview && (
          <Tooltip label={"Share this game"}>
            <ActionIcon
              size="lg"
              variant="default"
              onClick={shareModalUtils.open}
            >
              <IconShare size={"1.05rem"} />
            </ActionIcon>
          </Tooltip>
        )}
      </Group>
    </Stack>
  );
};

const GameInfoActions = buildPresenterComponent(
  "GameInfoActions",
  DEFAULT_GameInfoActions,
);

export { GameInfoActions };
