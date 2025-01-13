import {
    useQuery,
    useQueryClient,
    UseQueryResult,
} from "@tanstack/react-query";
import { ApiError, LibrariesService, Library } from "@/wrapper/server";
import { ExtendedUseQueryResult } from "@/util/types/ExtendedUseQueryResult";
import useUserId from "@/components/auth/hooks/useUserId";

export function useUserLibrary(
    userId: string | undefined | null,
): ExtendedUseQueryResult<Library | null> {
    const queryClient = useQueryClient();
    const queryKey = ["library", userId];
    const currentUserId = useUserId();
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
