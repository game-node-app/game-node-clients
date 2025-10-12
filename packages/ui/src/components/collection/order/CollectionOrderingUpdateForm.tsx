import React, { useEffect, useRef, useState } from "react";
import {
  COLLECTION_VIEW_DEFAULT_LIMIT,
  CollectionEntryDraggableItem,
  findCollectionEntryByGameId,
  SimpleInfiniteLoader,
  useGames,
  useInfiniteCollectionEntriesForCollectionId,
} from "#@/components";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { Button, ButtonGroup, Stack, Text } from "@mantine/core";
import { useListState } from "@mantine/hooks";
import { useMutation } from "@tanstack/react-query";
import {
  CollectionEntryUpdateOrderingDto,
  CollectionsEntriesOrderingService,
} from "@repo/wrapper/server";
import { BaseModalChildrenProps, createErrorNotification } from "#@/util";
import { notifications } from "@mantine/notifications";
import { IconCheck } from "@tabler/icons-react";

interface Props extends BaseModalChildrenProps {
  collectionId: string;
}

const CollectionOrderingUpdateForm = ({ collectionId }: Props) => {
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
      const notificationId = notifications.show({
        loading: true,
        message: "Applying changes...",
        autoClose: false,
      });

      for (const move of pendingMoves.values()) {
        await CollectionsEntriesOrderingService.collectionsOrderingControllerUpdateCollectionEntryOrderingV1(
          move,
        );
      }

      return notificationId;
    },
    onSettled: () => {
      setPendingMoves(new Map());
    },
    onSuccess: (notificationId) => {
      notifications.update({
        id: notificationId,
        color: "teal",
        title: "Changes applied!",
        message: "Your collection ordering has been updated.",
        icon: <IconCheck size={18} />,
        loading: false,
        autoClose: 2000,
      });
    },
    onError: createErrorNotification,
  });

  const canFetchNextPage =
    !isDraggingRef.current &&
    !applyPendingMovesMutation.isPending &&
    !isFetching &&
    !isFetchingGames &&
    hasNextPage;

  const resetPendingMoves = () => {
    setPendingMoves(new Map());
    renderedGamesHandlers.setState(games ?? []);
  };

  useEffect(() => {
    if (games != undefined && games.length > renderedGames.length) {
      console.log("Syncing rendered games with database games");
      renderedGamesHandlers.setState(games.slice(renderedGames.length));
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
          bg={"red"}
          disabled={
            pendingMoves.size === 0 || applyPendingMovesMutation.isPending
          }
          onClick={resetPendingMoves}
        >
          Discard
        </Button>
        <Button.GroupSection variant={"default"} className={"bg-body"}>
          {pendingMoves.size} changes
        </Button.GroupSection>
        <Button
          disabled={pendingMoves.size === 0}
          bg={"green"}
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
          if (!result.destination) return;
          const targetGameId = Number.parseInt(result.draggableId);
          const sourceIndex = result.source.index;
          const destinationIndex = result.destination.index;

          // Updates rendering list
          renderedGamesHandlers.reorder({
            from: sourceIndex,
            to: destinationIndex,
          });

          // Add item to pending moves
          const nextGameId = renderedGames.at(destinationIndex + 1)?.id;
          // Avoids matching the same game when moving to the top
          const previousGameId =
            destinationIndex > 0
              ? renderedGames.at(destinationIndex)?.id
              : undefined;

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

          setPendingMoves((prev) => {
            const next = new Map(prev);
            prev.set(dto.entryId, dto);
            return next;
          });
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
