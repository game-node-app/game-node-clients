import React, { useEffect, useRef, useState } from "react";
import {
  COLLECTION_VIEW_DEFAULT_LIMIT,
  CollectionEntryDraggableItem,
  findCollectionEntryByGameId,
  GameDraggableView,
  useGames,
  useInfiniteCollectionEntriesForCollectionId,
} from "#@/components";
import { Box, Button, Divider, Stack, Text } from "@mantine/core";
import { useListState } from "@mantine/hooks";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CollectionEntryUpdateOrderingDto,
  CollectionsEntriesOrderingService,
  Game,
} from "@repo/wrapper/server";
import { BaseModalChildrenProps, getErrorMessage } from "#@/util";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconExclamationCircle } from "@tabler/icons-react";

interface Props extends BaseModalChildrenProps {
  collectionId: string;
}

const CollectionOrderingUpdateForm = ({ collectionId }: Props) => {
  const queryClient = useQueryClient();
  const isDraggingRef = useRef(false);
  /**
   * Using the collection entry as ID prevents duplicate or concurrent requests for the same collection entry.
   * (Only the final one matter).
   */
  const [pendingMoves, setPendingMoves] = useState(
    new Map<string, CollectionEntryUpdateOrderingDto>(),
  );

  const {
    data: collectionEntriesPages,
    fetchNextPage,
    hasNextPage,
    isFetching,
  } = useInfiniteCollectionEntriesForCollectionId({
    collectionId,
    limit: COLLECTION_VIEW_DEFAULT_LIMIT,
    orderBy: {
      userCustom: "ASC",
    },
  });

  const collectionEntries =
    collectionEntriesPages?.pages.flatMap((page) => page!.data) ?? [];

  const gameIds = collectionEntries.map((entry) => entry.gameId) ?? [];

  const { data: games, isFetching: isFetchingGames } = useGames(
    {
      gameIds,
      relations: {
        cover: true,
      },
    },
    true,
  );

  const [renderedGames, renderedGamesHandlers] = useListState(games);

  const applyPendingMovesMutation = useMutation({
    mutationFn: async () => {
      console.log("Applying pending moves");
      console.log(pendingMoves);

      // Apply pending moves sequentially to avoid concurrent requests with row locks.
      for (const move of pendingMoves.values()) {
        await CollectionsEntriesOrderingService.collectionsOrderingControllerUpdateCollectionEntryOrderingV1(
          move,
        );
      }
    },
    onMutate: () => {
      return notifications.show({
        loading: true,
        message: "Applying changes...",
        autoClose: false,
        withCloseButton: false,
      });
    },
    onSuccess: (_data, _variables, notificationId) => {
      notifications.update({
        id: notificationId,
        color: "teal",
        title: "Changes applied!",
        message: "Your collection ordering has been updated.",
        icon: <IconCheck size={18} />,
        loading: false,
        autoClose: 2000,
        withCloseButton: true,
      });

      setPendingMoves(new Map());
    },
    onError: (err, _variables, notificationId) => {
      notifications.update({
        id: notificationId,
        color: "red",
        title: "Failed to sync changes!",
        message: getErrorMessage(err),
        loading: false,
        autoClose: 10000,
        withCloseButton: true,
        icon: <IconExclamationCircle size={18} />,
      });
      setPendingMoves(new Map());
      renderedGamesHandlers.setState(games ?? []);
    },
  });

  const canFetchNextPage =
    !applyPendingMovesMutation.isPending &&
    !isFetching &&
    !isFetchingGames &&
    hasNextPage;

  useEffect(() => {
    if (games != undefined && games.length > renderedGames.length) {
      console.log("Syncing rendered games with database games");
      renderedGamesHandlers.append(...games.slice(renderedGames.length));
    }
  }, [games, renderedGames, renderedGamesHandlers]);

  return (
    <Stack className={"items-center w-full"}>
      <Text className={"text-sm text-dimmed"}>
        Drag and drop elements to reorder games in this collection. This
        ordering will be shown when a visitor selects &#34;User Order&#34;
        (default) as sorting option.
      </Text>
      <Button.Group className={"mt-4"}>
        <Button
          color={"red"}
          disabled={
            pendingMoves.size === 0 || applyPendingMovesMutation.isPending
          }
          onClick={() => {
            setPendingMoves(new Map());
            renderedGamesHandlers.setState(games ?? []);
          }}
        >
          Discard
        </Button>
        <Button.GroupSection variant={"default"} className={"bg-body"}>
          {pendingMoves.size} changes
        </Button.GroupSection>
        <Button
          disabled={pendingMoves.size === 0}
          color={"green"}
          onClick={() => applyPendingMovesMutation.mutate()}
          loading={applyPendingMovesMutation.isPending}
        >
          Apply
        </Button>
      </Button.Group>
      <GameDraggableView
        onDragFinished={(evt) => {
          console.log("Result: ", evt);
          const gameId = evt.currentItem.id!;
          const beforeGameId = evt.beforeIndex
            ? renderedGames[evt.beforeIndex].id
            : undefined;
          const afterGameId = evt.afterIndex
            ? renderedGames[evt.afterIndex].id
            : undefined;
          const beforeEntry = beforeGameId
            ? findCollectionEntryByGameId(beforeGameId, collectionEntries)
            : undefined;
          const afterEntry = afterGameId
            ? findCollectionEntryByGameId(afterGameId, collectionEntries)
            : undefined;
          const targetEntry = findCollectionEntryByGameId(
            gameId,
            collectionEntries,
          )!;

          const dto: CollectionEntryUpdateOrderingDto = {
            collectionId,
            entryId: targetEntry!.id,
            nextEntryId: beforeEntry?.id ?? undefined,
            previousEntryId: afterEntry?.id ?? undefined,
          };

          const nextPendingMoves = new Map(pendingMoves);
          nextPendingMoves.set(dto.entryId, dto);
          setPendingMoves(nextPendingMoves);
        }}
        items={renderedGames ?? []}
        setItems={(items) => renderedGamesHandlers.setState(items as Game[])}
      />
    </Stack>
  );
};

export { CollectionOrderingUpdateForm };
