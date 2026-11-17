import { useUserId } from "#@/components/auth/hooks/useUserId";
import { ExtendedUseQueryResult } from "#@/util/types/ExtendedUseQueryResult";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LibrariesService, Library } from "../../../../../wrapper/src/server";

export function useUserLibrary(
  userId: string | undefined | null,
): ExtendedUseQueryResult<Library | null> {
  const queryClient = useQueryClient();
  const viewerId = useUserId();
  /*
    Collections are filtered by the viewer's visibility, so the viewer id (or
    `null` while signed out) is part of the key.
   */
  const queryKey = ["library", userId ?? null, viewerId ?? null];
  const invalidate = () => queryClient.invalidateQueries({ queryKey });

  return {
    ...useQuery({
      queryKey: queryKey,
      queryFn: async (): Promise<Library | null> => {
        if (!userId) return null;
        // if (currentUserId && currentUserId === userId) {
        //     return LibrariesService.librariesControllerFindOwn();
        // }
        return LibrariesService.librariesControllerFindOneByIdWithPermissionsV1(
          userId,
        );
      },
      enabled: !!userId,
    }),
    queryKey,
    invalidate,
  };
}
