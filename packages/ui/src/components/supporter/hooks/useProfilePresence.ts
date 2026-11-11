import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ApiError,
  ProfileService,
  type ProfilePresenceResponseDto,
} from "@repo/wrapper/server";
import { useHooks } from "#@/context";
import type { ExtendedUseQueryResult } from "#@/util";
import { getProfilePresenceQueryKey } from "./supporterQueryKeys";

/**
 * "Playing now" presence for a profile (design D6). Costs nothing unless the
 * profile opted in and its own screen is visible: `staleTime` plus the 60s
 * interval keep it at one request per minute per profile, and the background
 * flag stops it when the tab or app is hidden.
 */
export function useProfilePresence(
  userId: string | undefined | null,
  enabledByPreference: boolean,
): ExtendedUseQueryResult<ProfilePresenceResponseDto> {
  const queryClient = useQueryClient();
  const { useIsViewActive } = useHooks();
  const isViewActive = useIsViewActive?.() ?? true;
  const queryKey = getProfilePresenceQueryKey(userId);

  return {
    queryKey,
    invalidate: () => {
      void queryClient.invalidateQueries({ queryKey });
    },
    ...useQuery<ProfilePresenceResponseDto, ApiError>({
      queryKey,
      queryFn: () =>
        ProfileService.profilePresenceControllerGetPresenceV1(userId!),
      enabled: !!userId && enabledByPreference && isViewActive,
      refetchInterval: 60_000,
      refetchIntervalInBackground: false,
      staleTime: 60_000,
      retry: false,
    }),
  };
}
