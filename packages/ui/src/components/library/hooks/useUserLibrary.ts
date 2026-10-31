import { useUserId } from "#@/components/auth/hooks/useUserId";
import { ExtendedUseQueryResult } from "#@/util/types/ExtendedUseQueryResult";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LibrariesService, Library } from "../../../../../wrapper/src/server";

export function useUserLibrary(
  userId: string | undefined | null,
): ExtendedUseQueryResult<Library | null> {
  const queryClient = useQueryClient();
  const queryKey = ["library", userId];
  useUserId();
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
