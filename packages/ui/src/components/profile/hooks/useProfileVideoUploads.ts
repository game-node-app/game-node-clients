import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ApiError,
  ProfileResponseDto,
  ProfileService,
} from "@repo/wrapper/server";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { ExtendedUseQueryResult } from "#@/util/types/ExtendedUseQueryResult";

export const PROFILE_VIDEO_POLL_INTERVAL_MS = 3000;

type SlotStatus = "processing" | "ready" | "failed" | null;

type SlotStatuses = {
  avatar: SlotStatus;
  banner: SlotStatus;
};

const getSlotStatuses = (
  profile: ProfileResponseDto | undefined,
): SlotStatuses => ({
  avatar: profile?.videoUploads?.avatar?.status ?? null,
  banner: profile?.videoUploads?.banner?.status ?? null,
});

const hasProcessingSlot = (profile: ProfileResponseDto | undefined) => {
  const statuses = getSlotStatuses(profile);
  return statuses.avatar === "processing" || statuses.banner === "processing";
};

/**
 * Owner-only query for the avatar and banner video upload state.
 *
 * The key is prefixed by `["userProfile", userId]`, so existing invalidations
 * (image saves, uploads) refresh it with no extra wiring. It polls while either
 * slot is processing and invalidates the rest of the user's profile queries on
 * a processing -> ready transition, so public surfaces pick up the new video.
 */
export function useProfileVideoUploads(): ExtendedUseQueryResult<ProfileResponseDto> {
  const userId = useUserId();
  const queryClient = useQueryClient();
  const queryKey = ["userProfile", userId, "own"];
  const previousStatuses = useRef<SlotStatuses | null>(null);

  const query = useQuery<ProfileResponseDto, ApiError>({
    queryKey,
    queryFn: async () => ProfileService.profileControllerFindOwnV1(),
    enabled: !!userId,
    staleTime: 0,
    refetchOnMount: "always",
    refetchInterval: (currentQuery) =>
      hasProcessingSlot(currentQuery.state.data)
        ? PROFILE_VIDEO_POLL_INTERVAL_MS
        : false,
  });

  const uploads = query.data?.videoUploads;

  useEffect(() => {
    if (!uploads) return;

    const current = getSlotStatuses(query.data);
    const previous = previousStatuses.current;
    previousStatuses.current = current;

    if (!previous) return;

    const becameReady =
      (previous.avatar === "processing" && current.avatar === "ready") ||
      (previous.banner === "processing" && current.banner === "ready");

    if (becameReady) {
      void queryClient.invalidateQueries({ queryKey: ["userProfile", userId] });
    }
  }, [uploads, query.data, queryClient, userId]);

  return {
    ...query,
    queryKey,
    invalidate: () => {
      void queryClient.invalidateQueries({ queryKey });
    },
  };
}
