import React, { useEffect, useMemo, useState } from "react";
import {
  ActionIcon,
  Button,
  Group,
  Stack,
  Tooltip,
  Text,
  Modal,
} from "@mantine/core";
import {
  IconHeartFilled,
  IconHeartPlus,
  IconShare,
  IconX,
} from "@tabler/icons-react";
import { CollectionEntryAddOrUpdateModal } from "#@/components/collection/collection-entry/form/modal/CollectionEntryAddOrUpdateModal";
import { useDisclosure } from "@mantine/hooks";
import { CollectionsEntriesService, Game } from "@repo/wrapper/server";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useOwnCollectionEntryForGameId } from "#@/components/collection/collection-entry/hooks/useOwnCollectionEntryForGameId";
import { CollectionEntryRemoveModal } from "#@/components/collection/collection-entry/form/modal/CollectionEntryRemoveModal";
import { useReviewForUserIdAndGameId } from "#@/components/review/hooks/useReviewForUserIdAndGameId";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import {
  EMatomoEventAction,
  EMatomoEventCategory,
  trackMatomoEvent,
} from "#@/util/trackMatomoEvent";

interface IGameViewActionsProps {
  wrapperProps?: React.ComponentPropsWithoutRef<typeof Group>;
  game: Game | undefined;
  onShareClick: () => void;
}

/**
 * Component that handles the library-related actions for a game.
 * The game add report is handled here.
 * @constructor
 */
const GameInfoActions = ({
  game,
  wrapperProps,
  onShareClick,
}: IGameViewActionsProps) => {
  const [addUpdateModalOpened, addUpdateModalUtils] = useDisclosure();
  const [removeModalOpened, removeModalUtils] = useDisclosure();
  const userId = useUserId();
  const collectionEntryQuery = useOwnCollectionEntryForGameId(game?.id);

  const gameInLibrary =
    !collectionEntryQuery.isError && collectionEntryQuery.data != undefined;

  const gameInFavorites =
    gameInLibrary && collectionEntryQuery.data!.isFavorite;

  const reviewQuery = useReviewForUserIdAndGameId(userId, game?.id);

  const hasReview = reviewQuery.data != undefined;

  const invisibleFavoriteGame = useMemo(() => {
    if (collectionEntryQuery.data != undefined) {
      const gameOnlyInPrivateCollections =
        collectionEntryQuery.data.collections.every(
          (collection) => !collection.isPublic,
        );
      return gameInFavorites && gameOnlyInPrivateCollections;
    }

    return false;
  }, [gameInFavorites, collectionEntryQuery.data]);

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
        <CollectionEntryAddOrUpdateModal
          opened={addUpdateModalOpened}
          onClose={addUpdateModalUtils.close}
          id={game.id}
        />
        <CollectionEntryRemoveModal
          opened={removeModalOpened}
          onClose={removeModalUtils.close}
          gameId={game.id}
        />

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
            <ActionIcon size="lg" variant="default" onClick={onShareClick}>
              <IconShare size={"1.05rem"} />
            </ActionIcon>
          </Tooltip>
        )}
      </Group>
      {invisibleFavoriteGame && (
        <Text c={"dimmed"} fz={"sm"} className={"text-center"}>
          This favorite game will not be shown in your public profile because
          it's only included in private collections.
        </Text>
      )}
    </Stack>
  );
};

export { GameInfoActions };
