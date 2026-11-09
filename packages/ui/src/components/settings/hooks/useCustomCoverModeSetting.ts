import { useUserId } from "#@/components/auth/hooks/useUserId";
import { isPersonalizedGameQuery } from "#@/components/game/util/isPersonalizedGameQuery";
import {
  GameCoverMode,
  normalizeGameCoverMode,
} from "#@/components/game/util/gameCoverRequest";
import { useUserProfile } from "#@/components/profile/hooks/useUserProfile";
import { createErrorNotification } from "#@/util";
import {
  ProfileResponseDto,
  ProfileService,
  UpdateProfileDto,
} from "@repo/wrapper/server";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * The viewer's custom cover display mode and the mutation that saves it
 * (design Decision 10).
 *
 * A missing server value reads as `any`. The change is optimistic so the
 * selected option follows the click; on failure the profile snapshot is
 * restored (the previous mode stays selected) and an error is shown. Either
 * way, the profile and every personalized game query are invalidated so open
 * surfaces follow the new mode without a reload.
 */
export function useCustomCoverModeSetting() {
  const userId = useUserId();
  const queryClient = useQueryClient();
  const profileQuery = useUserProfile(userId);
  const queryKey = profileQuery.queryKey;

  const mutation = useMutation({
    mutationFn: (mode: GameCoverMode) =>
      ProfileService.profileControllerUpdateV1({
        customCoverMode: mode as UpdateProfileDto.customCoverMode,
      }),
    onMutate: async (mode) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<ProfileResponseDto>(queryKey);

      if (previous) {
        queryClient.setQueryData<ProfileResponseDto>(queryKey, {
          ...previous,
          customCoverMode: mode as ProfileResponseDto.customCoverMode,
        });
      }

      return { previous };
    },
    onError: (error, _mode, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      createErrorNotification(error);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey });
      void queryClient.invalidateQueries({
        predicate: (query) => isPersonalizedGameQuery(query.queryKey),
      });
    },
  });

  return {
    mode: normalizeGameCoverMode(profileQuery.data?.customCoverMode),
    hasProfile: profileQuery.data != undefined,
    isPending: mutation.isPending,
    setMode: mutation.mutate,
  };
}
