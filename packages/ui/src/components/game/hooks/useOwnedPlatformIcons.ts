import {
  CollectionEntry,
  CollectionsEntriesService,
} from "@repo/wrapper/server";
import { useQuery } from "@tanstack/react-query";

/**
 * Icon names of the platforms the viewer owns a game on, taken from their own
 * library entry. Empty when there is no entry (signed out, or the game is not
 * in the library), so callers never need to special-case those.
 */
export function useOwnedPlatformIcons(
  gameId: number | undefined,
  collectionEntry: Pick<CollectionEntry, "id"> | null | undefined,
) {
  return useQuery({
    queryKey: ["game", "owned-platforms", "icon", gameId, collectionEntry?.id],
    queryFn: async () => {
      if (!collectionEntry) return [];
      if (!gameId) return [];
      try {
        return await CollectionsEntriesService.collectionsEntriesControllerGetIconsForOwnedPlatformsV1(
          collectionEntry.id,
        );
      } catch (e) {
        console.error(e);
        return [];
      }
    },
  });
}
