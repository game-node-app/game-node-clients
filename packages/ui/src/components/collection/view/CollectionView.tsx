import React, { useCallback, useEffect, useMemo } from "react";
import {
  Divider,
  Group,
  Skeleton,
  Space,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import {
  buildGameCategoryFilters,
  CenteredErrorMessage,
  CollectionViewActionsMenu,
  findCollectionEntryByGameId,
  GameView,
  GameViewLayoutOption,
  getOffsetAsPage,
  getPageAsOffset,
  LibraryViewActions,
  useCollection,
  useCollectionEntriesForCollectionId,
  useGames,
  useUrlState,
  useUserId,
} from "@repo/ui";
import { useLocalStorage } from "@mantine/hooks";

interface ICollectionViewProps {
  libraryUserId: string;
  collectionId: string;
}

const DEFAULT_LIMIT = 24;

const CollectionView = ({
  collectionId,
  libraryUserId,
}: ICollectionViewProps) => {
  const [layout, setLayout] = useLocalStorage<GameViewLayoutOption>({
    key: "library-game-view-layout",
    defaultValue: "grid",
    getInitialValueInEffect: false,
  });

  const [params, setParams] = useUrlState({
    includeExtraContent: false,
    offset: 0,
    orderBy: {
      addedDate: "DESC",
    },
  });

  const { offset, includeExtraContent } = params;

  const ownUserId = useUserId();

  const collectionQuery = useCollection(collectionId);
  const collection = collectionQuery.data;
  const isOwnCollection = libraryUserId === ownUserId;

  const collectionEntriesQuery = useCollectionEntriesForCollectionId({
    ...params,
    collectionId,
    limit: DEFAULT_LIMIT,
    gameFilters: {
      category: buildGameCategoryFilters({
        includeDlcs: includeExtraContent,
        includeExtraContent: includeExtraContent,
      }),
    },
  });

  const gamesIds = useMemo(() => {
    return collectionEntriesQuery.data?.data.map((entry) => entry.gameId);
  }, [collectionEntriesQuery.data]);
  const gamesQuery = useGames({
    gameIds: gamesIds,
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
        href: `/library/${libraryUserId}/collection/entry/${relatedCollectionEntry?.id}`,
      };
    });
  }, [collectionEntriesQuery.data?.data, gamesQuery.data, libraryUserId]);

  const paginationInfo = collectionEntriesQuery.data?.pagination;

  const isLoading =
    collectionQuery.isLoading ||
    collectionEntriesQuery.isLoading ||
    gamesQuery.isLoading;
  const isError =
    collectionQuery.isError ||
    collectionEntriesQuery.isError ||
    gamesQuery.isError;

  const isSuccess =
    collectionQuery.isSuccess &&
    collectionEntriesQuery.isSuccess &&
    gamesQuery.isSuccess;

  const enablePagination =
    paginationInfo != undefined && (paginationInfo.totalPages ?? 1) > 1;

  return (
    <Stack w={"100%"} h={"100%"} className={"gap-0 mb-8"}>
      <Group className="w-full flex-nowrap justify-between">
        <Stack w={{ base: "70%", lg: "30%" }}>
          {collectionQuery.isLoading && (
            <>
              <Skeleton className={"w-32 h-9"} />
              <Skeleton className={"w-48 h-6"} />
            </>
          )}
          <Title size={"h3"} className={"w-full break-words"}>
            {collection?.name}
          </Title>
          <Text c={"dimmed"} w={"100%"} className={"break-words"}>
            {collectionQuery.data?.description}
          </Text>
        </Stack>
      </Group>
      <Divider className={"w-full"} my={"sm"} variant={"dashed"} />
      <Stack className={"w-full"}>
        <GameView layout={layout}>
          <Group
            className={"w-full flex-nowrap overflow-x-auto gap-xs pb-2 md:pb-0"}
          >
            {isOwnCollection && (
              <CollectionViewActionsMenu collectionId={collectionId} />
            )}
            <LibraryViewActions
              libraryUserId={libraryUserId}
              includeExtraContent={includeExtraContent}
              onSort={(value, order) => {
                const orderBy = {
                  [value]: order,
                };

                setParams((prev) => ({ ...prev, orderBy: orderBy as never }));
              }}
              onLayoutChange={setLayout}
              onExtraContentChange={(value) =>
                setParams((prev) => ({ ...prev, includeExtraContent: value }))
              }
            />
          </Group>

          {isError && (
            <CenteredErrorMessage
              message={"An error occurred. Please try again."}
            />
          )}
          {isSuccess && (games == undefined || games.length === 0) && (
            <CenteredErrorMessage message={"This collection is empty."} />
          )}
          <GameView.Content items={games!}>
            <GameView.LoadingSkeletons isVisible={isLoading} />
          </GameView.Content>
          {enablePagination && (
            <GameView.Pagination
              page={getOffsetAsPage(offset, DEFAULT_LIMIT)}
              paginationInfo={paginationInfo}
              onPaginationChange={(page) =>
                setParams((prev) => ({
                  ...prev,
                  offset: getPageAsOffset(page, DEFAULT_LIMIT),
                }))
              }
            />
          )}
        </GameView>
      </Stack>
    </Stack>
  );
};

export { CollectionView };
