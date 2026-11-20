import {
  buildGameCategoryFilters,
  CenteredErrorMessage,
  findCollectionEntryByGameId,
  GameView,
  GameViewLayoutOption,
  LibraryHiddenState,
  LibrarySearchEmptyState,
  LibrarySearchInput,
  LibraryViewActions,
  LibraryViewTabs,
  useCollectionEntriesForUserId,
  useGames,
  useIsLibraryHidden,
  useUrlState,
  useUserId,
  toLibraryVisibilityLevel,
} from "#@/components";
import { getOffsetAsPage, getPageAsOffset } from "#@/util";
import { Flex, Group, Stack } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { useTranslation } from "@repo/locales";
import { CollectionEntry } from "@repo/wrapper/server";
import { useMemo } from "react";

const DEFAULT_LIMIT = 24;

interface Props {
  libraryUserId: string;
}

const LibraryView = ({ libraryUserId }: Props) => {
  const { isHidden, profile } = useIsLibraryHidden(libraryUserId);

  if (isHidden) {
    return <LibraryHiddenState profile={profile} />;
  }

  // Keyed so a search typed in one library never carries over to another owner's.
  return (
    <LibraryViewContent key={libraryUserId} libraryUserId={libraryUserId} />
  );
};

/**
 * The listing itself. Split from `LibraryView` so a hidden library does not
 * fire the (empty) listing reads before the hidden state replaces them.
 */
const LibraryViewContent = ({ libraryUserId }: Props) => {
  const { t } = useTranslation();
  const [layout, setLayout] = useLocalStorage<GameViewLayoutOption>({
    key: "library-game-view-layout",
    defaultValue: "grid",
    getInitialValueInEffect: true,
  });

  const [params, setParams] = useUrlState({
    status: CollectionEntry.status.PLAYING,
    offset: 0,
    limit: DEFAULT_LIMIT,
    orderBy: {
      addedDate: "DESC",
    },
    includeExtraContent: false,
    hasCustomCover: false,
    search: "",
  });

  const { status, offset, includeExtraContent, hasCustomCover } = params;
  const search = params.search ?? "";
  const hasSearch = search.trim() !== "";

  const setSearch = (value: string) =>
    setParams((prev) => ({
      ...prev,
      search: value.trim() ? value : undefined,
      offset: 0,
    }));

  const ownUserId = useUserId();
  const isOwner = libraryUserId === ownUserId;

  const collectionEntriesQuery = useCollectionEntriesForUserId({
    ...params,
    userId: libraryUserId,
    gameFilters: {
      category: buildGameCategoryFilters({
        includeDlcs: includeExtraContent,
        includeExtraContent: includeExtraContent,
      }),
    },
    limit: DEFAULT_LIMIT,
  });

  const gameIds =
    collectionEntriesQuery.data?.data.map((entry) => entry.gameId) ?? [];

  const gamesQuery = useGames(
    {
      gameIds,
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
        visibility: isOwner
          ? toLibraryVisibilityLevel(relatedCollectionEntry?.visibility)
          : undefined,
      };
    });
  }, [
    collectionEntriesQuery.data?.data,
    gamesQuery.data,
    isOwner,
    libraryUserId,
  ]);

  const isLoading = collectionEntriesQuery.isLoading || gamesQuery.isLoading;

  const isEmpty =
    !isLoading && gamesQuery.data != undefined && gamesQuery.data.length === 0;

  const hasNoSearchResults =
    hasSearch &&
    collectionEntriesQuery.isSuccess &&
    !collectionEntriesQuery.isPlaceholderData &&
    collectionEntriesQuery.data.pagination.totalItems === 0;

  const shouldShowPagination =
    (collectionEntriesQuery.data?.pagination.totalPages ?? 0) > 1;

  return (
    <Stack className={"w-full h-full"}>
      <GameView layout={layout}>
        <LibraryViewTabs
          status={status}
          onStatusChange={(status) => {
            setParams({
              status,
              offset: 0,
            });
          }}
        />

        <Flex className={"w-full flex-col gap-xs md:flex-row md:items-center"}>
          <LibrarySearchInput
            className={"md:w-[280px] md:shrink-0"}
            value={search}
            onSearchChange={setSearch}
            placeholder={t("library.search.placeholderLibrary")}
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
            <LibraryViewActions
              libraryUserId={libraryUserId}
              collectionId={undefined}
              includeExtraContent={includeExtraContent}
              hasCustomCover={hasCustomCover}
              onExtraContentChange={(value) => {
                setParams((prev) => ({
                  ...prev,
                  includeExtraContent: value,
                }));
              }}
              onHasCustomCoverChange={(value) => {
                setParams((prev) => ({
                  ...prev,
                  hasCustomCover: value,
                  offset: 0,
                }));
              }}
              sortValue={{
                value: Object.keys(params.orderBy)[0],
                ordering: Object.values(params.orderBy)[0] as never,
              }}
              onSort={(updatedValue) => {
                const orderBy = {
                  [updatedValue.value]: updatedValue.ordering,
                };
                setParams((prev) => ({
                  ...prev,
                  orderBy: orderBy as never,
                }));
              }}
              onLayoutChange={setLayout}
            />
          </Group>
        </Flex>

        {collectionEntriesQuery.isError && (
          <CenteredErrorMessage error={collectionEntriesQuery.error} />
        )}
        {isEmpty && !hasSearch && (
          <CenteredErrorMessage message={"No games in this category."} />
        )}
        {hasNoSearchResults && (
          <LibrarySearchEmptyState
            query={search.trim()}
            scope={"library"}
            onClear={() => setSearch("")}
          />
        )}
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
