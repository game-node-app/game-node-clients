import {
  buildGameCategoryFilters,
  CenteredErrorMessage,
  CollectionViewActions,
  findCollectionEntryByGameId,
  GameView,
  GameViewLayoutOption,
  LibraryHiddenState,
  LibrarySearchEmptyState,
  LibrarySearchInput,
  LibraryViewActions,
  useCollection,
  useCollectionEntriesForCollectionId,
  useGames,
  useUrlState,
  useUserId,
  toLibraryVisibilityLevel,
} from "#@/components";
import { getOffsetAsPage, getPageAsOffset, isNotFoundApiError } from "#@/util";
import {
  Divider,
  Flex,
  Group,
  Skeleton,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { useTranslation } from "@repo/locales";
import { useMemo } from "react";

interface ICollectionViewProps {
  libraryUserId: string;
  collectionId: string;
}

export const COLLECTION_VIEW_DEFAULT_LIMIT = 24;

const CollectionView = ({
  collectionId,
  libraryUserId,
}: ICollectionViewProps) => {
  const { t } = useTranslation();
  const [layout, setLayout] = useLocalStorage<GameViewLayoutOption>({
    key: "library-game-view-layout",
    defaultValue: "grid",
    getInitialValueInEffect: false,
  });

  const [params, setParams] = useUrlState({
    includeExtraContent: false,
    offset: 0,
    hasCustomCover: false,
    search: "",
    orderBy: {
      userCustom: "ASC",
    },
  });

  const { offset, includeExtraContent, hasCustomCover } = params;
  const search = params.search ?? "";
  const hasSearch = search.trim() !== "";

  const setSearch = (value: string) =>
    setParams((prev) => ({
      ...prev,
      search: value.trim() ? value : undefined,
      offset: 0,
    }));

  const ownUserId = useUserId();

  const collectionQuery = useCollection(collectionId);
  const collection = collectionQuery.data;
  const isOwnCollection = libraryUserId === ownUserId;

  const collectionEntriesQuery = useCollectionEntriesForCollectionId({
    ...params,
    collectionId,
    limit: COLLECTION_VIEW_DEFAULT_LIMIT,
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
  const gamesQuery = useGames(
    {
      gameIds: gamesIds,
      relations: {
        cover: true,
      },
    },
    true,
    { ownerUserId: libraryUserId },
  );
  const games = useMemo(() => {
    return gamesQuery.data?.map((game) => {
      const relatedCollectionEntry = findCollectionEntryByGameId(
        game.id,
        collectionEntriesQuery.data?.data,
      );

      return {
        ...game,
        href: `/library/${libraryUserId}/collection/entry/${relatedCollectionEntry?.id}`,
        // Owner-only badge: never expose another user's entry level.
        visibility: isOwnCollection
          ? toLibraryVisibilityLevel(relatedCollectionEntry?.visibility)
          : undefined,
      };
    });
  }, [
    collectionEntriesQuery.data?.data,
    gamesQuery.data,
    isOwnCollection,
    libraryUserId,
  ]);

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

  const hasNoSearchResults =
    hasSearch &&
    collectionEntriesQuery.isSuccess &&
    !collectionEntriesQuery.isPlaceholderData &&
    collectionEntriesQuery.data?.pagination.totalItems === 0;

  const enablePagination =
    paginationInfo != undefined && (paginationInfo.totalPages ?? 1) > 1;

  /*
    A private collection (or a collection of a hidden library) answers 404 for
    a non-owner. It is the same answer as a missing collection, so it becomes a
    hidden notice instead of an error or an "empty collection" message.
   */
  const isHidden = isNotFoundApiError(collectionQuery.error);

  if (isHidden) {
    return <LibraryHiddenState userId={libraryUserId} />;
  }

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
          <Flex
            className={"w-full flex-col gap-xs md:flex-row md:items-center"}
          >
            <LibrarySearchInput
              className={"md:w-[280px] md:shrink-0"}
              value={search}
              onSearchChange={setSearch}
              placeholder={t("library.search.placeholderCollection")}
              isLoading={
                collectionEntriesQuery.isPlaceholderData ||
                (collectionEntriesQuery.isFetching && hasSearch)
              }
            />
            <Group
              className={
                "w-full flex-nowrap overflow-x-auto gap-xs pb-2 md:pb-0 md:w-auto md:flex-1 md:min-w-0"
              }
            >
              {isOwnCollection && (
                <CollectionViewActions collectionId={collectionId} />
              )}
              <LibraryViewActions
                libraryUserId={libraryUserId}
                collectionId={collectionId}
                includeExtraContent={includeExtraContent}
                hasCustomCover={hasCustomCover}
                sortValue={{
                  value: Object.keys(params.orderBy)[0],
                  ordering: Object.values(params.orderBy)[0] as never,
                }}
                onSort={(updatedValue) => {
                  const orderBy = {
                    [updatedValue.value]: updatedValue.ordering,
                  };

                  setParams((prev) => ({ ...prev, orderBy: orderBy as never }));
                }}
                onLayoutChange={setLayout}
                onExtraContentChange={(value) =>
                  setParams((prev) => ({ ...prev, includeExtraContent: value }))
                }
                onHasCustomCoverChange={(value) =>
                  setParams((prev) => ({
                    ...prev,
                    hasCustomCover: value,
                    offset: 0,
                  }))
                }
              />
            </Group>
          </Flex>

          {isError && (
            <CenteredErrorMessage
              message={"An error occurred. Please try again."}
            />
          )}
          {isSuccess &&
            !hasSearch &&
            (games == undefined || games.length === 0) && (
              <CenteredErrorMessage message={"This collection is empty."} />
            )}
          {hasNoSearchResults && (
            <LibrarySearchEmptyState
              query={search.trim()}
              scope={"collection"}
              onClear={() => setSearch("")}
            />
          )}
          <GameView.Content items={games!}>
            <GameView.LoadingSkeletons isVisible={isLoading} />
          </GameView.Content>
          {enablePagination && (
            <GameView.Pagination
              page={getOffsetAsPage(offset, COLLECTION_VIEW_DEFAULT_LIMIT)}
              paginationInfo={paginationInfo}
              onPaginationChange={(page) =>
                setParams((prev) => ({
                  ...prev,
                  offset: getPageAsOffset(page, COLLECTION_VIEW_DEFAULT_LIMIT),
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
