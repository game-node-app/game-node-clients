import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ProfileResponseDto,
  ProfileService,
} from "../../../../../wrapper/src/server";
import { ExtendedUseQueryResult } from "#@/util/types/ExtendedUseQueryResult";
import { useUserId } from "#@/components/auth/hooks/useUserId";

/**
 * The response depends on the viewer (`canViewLibrary`, follower-only fields),
 * so the viewer id — or `null` while signed out — is part of the key. `null`
 * keeps the key JSON-serializable for web SSR dehydration.
 */
export function getUserProfileQueryKey(
  userId: string | undefined | null,
  viewerId: string | undefined | null,
): unknown[] {
  return ["userProfile", userId ?? null, viewerId ?? null];
}

export function useUserProfile(
  userId: string | undefined | null,
  options?: { enabled?: boolean },
): ExtendedUseQueryResult<ProfileResponseDto> {
  const queryClient = useQueryClient();
  const viewerId = useUserId();
  const queryKey = getUserProfileQueryKey(userId, viewerId);
  const invalidate = () => queryClient.invalidateQueries({ queryKey });
  return {
    ...useQuery({
      queryKey: queryKey,
      queryFn: async () => {
        return ProfileService.profileControllerFindOneByIdV1(userId!);
      },
      enabled: (options?.enabled ?? true) && !!userId,
      retry: 1,
    }),
    invalidate,
    queryKey,
  };
}
