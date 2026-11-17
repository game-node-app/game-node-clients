import { ExtendedUseQueryResult } from "#@/util/types/ExtendedUseQueryResult";
import { retryUnlessHidden } from "#@/util";
import { ApiError, Collection, CollectionsService } from "@repo/wrapper/server";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useUserId } from "#@/components/auth/hooks/useUserId";

export function useCollection(
  collectionId: string | undefined | null,
  options?: { enabled?: boolean },
): ExtendedUseQueryResult<Collection> {
  const queryClient = useQueryClient();
  const viewerId = useUserId();
  /*
    A private collection (or one of a hidden library) 404s for other viewers,
    so the viewer id (or `null` while signed out) is part of the key.
   */
  const queryKey = ["collection", collectionId ?? null, viewerId ?? null];
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [queryKey[0], queryKey[1]] });
  return {
    ...useQuery<Collection, ApiError>({
      queryKey: queryKey,
      queryFn: () => {
        return CollectionsService.collectionsControllerFindOneByIdWithPermissionsV1(
          collectionId!,
        );
      },
      enabled: (options?.enabled ?? true) && !!collectionId,
      // Hidden collections answer 404: render the empty state, don't retry.
      retry: retryUnlessHidden,
    }),
    invalidate,
    queryKey,
  };
}
