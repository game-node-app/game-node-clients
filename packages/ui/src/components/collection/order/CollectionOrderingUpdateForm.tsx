import React, { useEffect, useEffectEvent, useRef, useState } from "react";
import {
  COLLECTION_VIEW_DEFAULT_LIMIT,
  CollectionEntryDraggableItem,
  findCollectionEntryByGameId,
  SimpleInfiniteLoader,
  useGames,
  useInfiniteCollectionEntriesForCollectionId,
} from "#@/components";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { Button, Stack, Text } from "@mantine/core";
import { useDebouncedCallback, useListState } from "@mantine/hooks";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CollectionEntryUpdateOrderingDto,
  CollectionsEntriesOrderingService,
  Game,
} from "@repo/wrapper/server";
import {
  BaseModalChildrenProps,
  getErrorMessage,
  jsonDeepEquals,
} from "#@/util";
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
    // limit: COLLECTION_VIEW_DEFAULT_LIMIT,
    limit: 2,
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
      <DragDropContext
        onBeforeDragStart={() => {
          isDraggingRef.current = true;
        }}
        onDragEnd={(result) => {
          isDraggingRef.current = false;
          console.log("Drag end with result: ", result);
          if (!result.destination) return;

          const sourceIndex = result.source.index;
          const destinationIndex = result.destination.index;

          /**
           * Creates a snapshot of the list state before the reorder.
           * Avoids issue with react state update being async and causing the logic below
           * to use the 'old' list version.
           */
          const reorderedGames = [...renderedGames];
          const [moved] = reorderedGames.splice(sourceIndex, 1);
          reorderedGames.splice(destinationIndex, 0, moved);
          // Sync state with the snapshot
          renderedGamesHandlers.setState(reorderedGames);

          const targetGameId = Number.parseInt(result.draggableId);
          const nextGameId = reorderedGames.at(destinationIndex + 1)?.id;
          // Avoids matching the same game when moving to the top
          const previousGameId =
            destinationIndex > 0
              ? reorderedGames.at(destinationIndex - 1)?.id
              : undefined;

          console.log("Current list: ", reorderedGames);
          console.log("Prev: ", previousGameId);
          console.log("Next: ", nextGameId);
          const targetEntry = findCollectionEntryByGameId(
            targetGameId,
            collectionEntries,
          );
          const previousCollectionEntry = findCollectionEntryByGameId(
            previousGameId ?? 0,
            collectionEntries,
          );
          const nextCollectionEntry = findCollectionEntryByGameId(
            nextGameId ?? 0,
            collectionEntries,
          );

          const dto: CollectionEntryUpdateOrderingDto = {
            collectionId,
            entryId: targetEntry!.id,
            nextEntryId: nextCollectionEntry?.id ?? undefined,
            previousEntryId: previousCollectionEntry?.id ?? undefined,
          };

          const nextPendingMoves = new Map(pendingMoves);
          nextPendingMoves.set(dto.entryId, dto);
          setPendingMoves(nextPendingMoves);
        }}
      >
        <Droppable
          droppableId={"dropabble"}
          isDropDisabled={applyPendingMovesMutation.isPending}
          renderClone={(provided, snapshot, rubric) => {
            const game = renderedGames[rubric.source.index];
            return (
              <CollectionEntryDraggableItem
                key={game.id}
                game={game}
                provided={provided}
                isDragging={true}
                isPending={false}
              />
            );
          }}
        >
          {(provided) => (
            <Stack
              className={"gap-2 w-full"}
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {renderedGames.map((game, index) => (
                <Draggable
                  draggableId={`${game.id}`}
                  index={index}
                  key={game.id}
                >
                  {(provided) => {
                    const collectionEntry = findCollectionEntryByGameId(
                      game.id,
                      collectionEntries,
                    );
                    const isPending =
                      collectionEntry != undefined &&
                      pendingMoves.has(collectionEntry.id);
                    return (
                      <CollectionEntryDraggableItem
                        game={game}
                        provided={provided}
                        isDragging={false}
                        isPending={isPending}
                      />
                    );
                  }}
                </Draggable>
              ))}
              {provided.placeholder}
              <SimpleInfiniteLoader
                fetchNextPage={async () => {
                  if (!canFetchNextPage) return;
                  await fetchNextPage();
                }}
                isFetching={isFetching || isFetchingGames}
                hasNextPage={hasNextPage}
              />
            </Stack>
          )}
        </Droppable>
      </DragDropContext>
    </Stack>
  );
};

export { CollectionOrderingUpdateForm };
