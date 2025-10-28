import { useMutation } from "@tanstack/react-query";
import { CollectionsEntriesService } from "@repo/wrapper/server";
import {
  useFavoriteCollectionEntriesForUserId,
  useOwnCollectionEntryForGameId,
  useUserId,
} from "#@/components";
import { createErrorNotification } from "#@/util";

export function useUpdateFavoriteStatusMutation(
  gameId: number | undefined,
  gameInFavorites: boolean,
) {
  const userId = useUserId();
  const collectionEntryQuery = useOwnCollectionEntryForGameId(gameId);
  const favoriteQuery = useFavoriteCollectionEntriesForUserId(userId);

  return useMutation({
    mutationFn: (gameId: number) => {
      return CollectionsEntriesService.collectionsEntriesControllerChangeFavoriteStatusV1(
        gameId,
        { isFavorite: !gameInFavorites },
      );
    },
    onError: createErrorNotification,
    onSuccess: () => {
      collectionEntryQuery.invalidate();
      favoriteQuery.invalidate();
    },
  });
}
