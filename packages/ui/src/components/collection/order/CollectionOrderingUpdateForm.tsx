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
import { Stack, Text } from "@mantine/core";
import { useListState } from "@mantine/hooks";
import { useMutation } from "@tanstack/react-query";
import {
  CollectionEntryUpdateOrderingDto,
  CollectionsEntriesOrderingService,
} from "@repo/wrapper/server";
import { BaseModalChildrenProps, createErrorNotification } from "#@/util";

interface Props extends BaseModalChildrenProps {
  collectionId: string;
}

const CollectionOrderingUpdateForm = ({ collectionId, onClose }: Props) => {
  const isDraggingRef = useRef(false);

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
  const [pendingGames, pendingGamesHandlers] = useListState<number>([]);

  const updateOrderingMutation = useMutation({
    mutationFn: async (dto: CollectionEntryUpdateOrderingDto) => {
      await CollectionsEntriesOrderingService.collectionsOrderingControllerUpdateCollectionEntryOrderingV1(
        dto,
      );

      return dto;
    },
    onMutate: async (dto: CollectionEntryUpdateOrderingDto) => {
      const gameId = collectionEntries.find(
        (entry) => entry.id === dto.entryId,
      )?.gameId;
      if (gameId) {
        pendingGamesHandlers.append(gameId);
      }

      return dto;
    },
    onSettled: (dto) => {
      const gameId = collectionEntries.find(
        (entry) => entry.id === dto?.entryId,
      )?.gameId;
      if (gameId) {
        const gameIndex = pendingGames.indexOf(gameId);
        pendingGamesHandlers.remove(gameIndex);
      }
    },
    onError: createErrorNotification,
  });

  const canFetchNextPage =
    !isDraggingRef.current &&
    !updateOrderingMutation.isPending &&
    !isFetching &&
    !isFetchingGames &&
    hasNextPage;

  useEffect(() => {
    if (games != undefined && games.length > renderedGames.length) {
      console.log("Syncing rendered games with database games");
      renderedGamesHandlers.setState(games.slice(renderedGames.length));
    }
  }, [games, renderedGames, renderedGamesHandlers]);

  return (
    <Stack>
      <Text className={"text-sm text-dimmed"}>
        Drag and drop elements to reorder games in this collection. This
        ordering will be shown when a visitor selects &#34;User Order&#34;
        (default) as sorting option.
      </Text>
      <DragDropContext
        onBeforeDragStart={() => {
          isDraggingRef.current = true;
        }}
        onDragEnd={(result, provided) => {
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

          // Mutation logic
          const nextGameId = renderedGames.at(destinationIndex + 1)?.id;
          const previousGameId = renderedGames.at(destinationIndex)?.id;
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

          updateOrderingMutation.mutate(dto);
        }}
      >
        <Droppable
          droppableId={"dropabble"}
          isDropDisabled={updateOrderingMutation.isPending}
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
              className={"gap-2"}
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {renderedGames.map((game, index) => (
                <Draggable
                  draggableId={`${game.id}`}
                  index={index}
                  key={game.id}
                >
                  {(provided, snapshot) => (
                    <CollectionEntryDraggableItem
                      game={game}
                      provided={provided}
                      isDragging={false}
                      isPending={pendingGames.includes(game.id)}
                    />
                  )}
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
