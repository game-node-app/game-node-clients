import React, { useMemo } from "react";
import {
  CenteredErrorMessage,
  findCollectionEntryByGameId,
  GameView,
  LibraryViewTabs,
  useCollectionEntriesForUserId,
  useGames,
  useUrlState,
} from "#@/components";
import { CollectionEntry } from "@repo/wrapper/server";
import { Stack } from "@mantine/core";
import { getOffsetAsPage, getPageAsOffset } from "#@/util";

const DEFAULT_LIMIT = 24;

interface Props {
  userId: string;
}

const LibraryView = ({ userId }: Props) => {
  const [params, setParams] = useUrlState({
    status: CollectionEntry.status.PLAYING,
    offset: 0,
  });

  const { status, offset } = params;

  const collectionEntriesQuery = useCollectionEntriesForUserId({
    userId,
    orderBy: {
      addedDate: "DESC",
    },
    ...params,
  });

  const gameIds =
    collectionEntriesQuery.data?.data.map((entry) => entry.gameId) ?? [];

  const gamesQuery = useGames({
    gameIds,
    relations: {
      cover: true,
    },
  });

  const games = useMemo(() => {
    return gamesQuery.data?.map((game) => {
      const relatedCollectionEntry = findCollectionEntryByGameId(
        game.id,
        collectionEntriesQuery.data?.data,
      );

      return {
        ...game,
        href: `/library/${userId}/collection/entry/${relatedCollectionEntry?.id}`,
      };
    });
  }, [collectionEntriesQuery.data?.data, gamesQuery.data, userId]);

  const isLoading = collectionEntriesQuery.isLoading || gamesQuery.isLoading;

  const isEmpty =
    !isLoading && gamesQuery.data != undefined && gamesQuery.data.length === 0;

  const shouldShowPagination =
    (collectionEntriesQuery.data?.pagination.totalPages ?? 0) > 1;

  return (
    <Stack className={"w-full h-full min-h-[55dvh]"}>
      <LibraryViewTabs
        status={status}
        onStatusChange={(status) => {
          setParams({
            status,
            offset: 0,
          });
        }}
      />
      {isEmpty && (
        <CenteredErrorMessage message={"No games in this category."} />
      )}
      <GameView layout={"grid"}>
        <GameView.Content items={games}>
          <GameView.LoadingSkeletons isVisible={isLoading} />
        </GameView.Content>
        {shouldShowPagination && (
          <GameView.Pagination
            wrapperProps={{
              className: "mt-4 mb-8",
            }}
            page={getOffsetAsPage(offset, DEFAULT_LIMIT)}
            onPaginationChange={(page) => {
              const offset = getPageAsOffset(page, DEFAULT_LIMIT);
              setParams({
                status,
                offset,
              });
            }}
            paginationInfo={collectionEntriesQuery.data?.pagination}
          />
        )}
      </GameView>
    </Stack>
  );
};

export { LibraryView };
