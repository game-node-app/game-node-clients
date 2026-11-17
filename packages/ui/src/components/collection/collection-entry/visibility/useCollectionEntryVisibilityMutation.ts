import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CollectionEntry,
  CollectionEntryVisibilityDto,
  CollectionsEntriesService,
} from "@repo/wrapper/server";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { createErrorNotification } from "#@/util";
import type { LibraryVisibilityLevel } from "./LibraryVisibilityLevel";
import { invalidateOwnLibraryVisibilityQueries } from "./invalidateOwnLibraryVisibilityQueries";

export interface ChangeCollectionEntryVisibilityVariables {
  /** Game id, not collection entry id: the route is `/game/{gameId}/visibility`. */
  gameId: number;
  visibility: LibraryVisibilityLevel;
}

const VISIBILITY_TO_DTO: Record<
  LibraryVisibilityLevel,
  CollectionEntryVisibilityDto.visibility
> = {
  public: CollectionEntryVisibilityDto.visibility.PUBLIC,
  followers: CollectionEntryVisibilityDto.visibility.FOLLOWERS,
  private: CollectionEntryVisibilityDto.visibility.PRIVATE,
};

const VISIBILITY_TO_ENTRY: Record<
  LibraryVisibilityLevel,
  CollectionEntry.visibility
> = {
  public: CollectionEntry.visibility.PUBLIC,
  followers: CollectionEntry.visibility.FOLLOWERS,
  private: CollectionEntry.visibility.PRIVATE,
};

const OWN_ENTRY_KEY_SEGMENT = "own";
const COLLECTION_ENTRIES_KEY = "collection-entries";

function isCollectionEntry(value: unknown): value is CollectionEntry {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Partial<CollectionEntry>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.gameId === "number" &&
    typeof candidate.libraryUserId === "string"
  );
}

/**
 * Walks cached query data (entry, array, paginated page or infinite query
 * pages) and updates every cached `CollectionEntry` of `gameId`.
 */
function patchEntryVisibilityInData(
  data: unknown,
  gameId: number,
  visibility: CollectionEntry.visibility,
): unknown {
  if (Array.isArray(data)) {
    let changed = false;
    const patched = data.map((item) => {
      const nextItem = patchEntryVisibilityInData(item, gameId, visibility);
      if (nextItem !== item) {
        changed = true;
      }
      return nextItem;
    });

    return changed ? patched : data;
  }

  if (typeof data !== "object" || data === null) {
    return data;
  }

  // Entry-like objects are leaves here: their nested game/collections never
  // contain other entries.
  if (isCollectionEntry(data)) {
    return data.gameId === gameId ? { ...data, visibility } : data;
  }

  let changed = false;
  const patched: Record<string, unknown> = {
    ...(data as Record<string, unknown>),
  };

  for (const [key, value] of Object.entries(patched)) {
    const nextValue = patchEntryVisibilityInData(value, gameId, visibility);
    if (nextValue !== value) {
      patched[key] = nextValue;
      changed = true;
    }
  }

  return changed ? patched : data;
}

/**
 * Changes the visibility level of one game in the authenticated user's
 * library (`POST /v1/collections-entries/game/{gameId}/visibility`).
 *
 * Optimistically patches the own-entry query and any cached entry for the game,
 * rolls the cache back and notifies on failure, then invalidates every read
 * affected by library visibility.
 */
export function useCollectionEntryVisibilityMutation() {
  const queryClient = useQueryClient();
  const userId = useUserId();

  return useMutation({
    mutationFn: ({
      gameId,
      visibility,
    }: ChangeCollectionEntryVisibilityVariables) =>
      CollectionsEntriesService.collectionsEntriesControllerChangeVisibilityV1(
        gameId,
        { visibility: VISIBILITY_TO_DTO[visibility] },
      ),
    onMutate: async ({ gameId, visibility }) => {
      const ownEntryQueryKey = [
        COLLECTION_ENTRIES_KEY,
        OWN_ENTRY_KEY_SEGMENT,
        gameId,
      ];
      const entryVisibility = VISIBILITY_TO_ENTRY[visibility];

      await queryClient.cancelQueries({ queryKey: [COLLECTION_ENTRIES_KEY] });

      const previousOwnEntry = queryClient.getQueryData<CollectionEntry | null>(
        ownEntryQueryKey,
      );
      const previousQueries = queryClient.getQueriesData({
        queryKey: [COLLECTION_ENTRIES_KEY],
      });

      queryClient.setQueryData<CollectionEntry | null>(
        ownEntryQueryKey,
        (entry) => (entry ? { ...entry, visibility: entryVisibility } : entry),
      );

      queryClient.setQueriesData<unknown>(
        { queryKey: [COLLECTION_ENTRIES_KEY] },
        (data: unknown) =>
          patchEntryVisibilityInData(data, gameId, entryVisibility),
      );

      return { previousOwnEntry, previousQueries, ownEntryQueryKey };
    },
    onError: (error, _variables, context) => {
      context?.previousQueries.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });

      if (context?.previousOwnEntry !== undefined) {
        queryClient.setQueryData(
          context.ownEntryQueryKey,
          context.previousOwnEntry,
        );
      }

      createErrorNotification(error);
    },
    onSettled: () => invalidateOwnLibraryVisibilityQueries(queryClient, userId),
  });
}
