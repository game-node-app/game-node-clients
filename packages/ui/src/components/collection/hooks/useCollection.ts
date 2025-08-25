import { ExtendedUseQueryResult } from "#@/util/types/ExtendedUseQueryResult";
import { Collection, CollectionsService } from "@repo/wrapper/server";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export function useCollection(
  collectionId: string | undefined | null,
): ExtendedUseQueryResult<Collection> {
  const queryClient = useQueryClient();
  const queryKey = ["collection", collectionId];
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [queryKey[0], queryKey[1]] });
  return {
    ...useQuery({
      queryKey: queryKey,
      queryFn: () => {
        return CollectionsService.collectionsControllerFindOneByIdWithPermissionsV1(
          collectionId!,
        );
      },
      enabled: !!collectionId,
    }),
    invalidate,
    queryKey,
  };
}
