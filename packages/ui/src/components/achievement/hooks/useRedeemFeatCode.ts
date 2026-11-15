import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "@repo/locales";
import {
  AchievementsCodeService,
  RedeemAchievementCodeResponseDto,
} from "@repo/wrapper/server";

/** Prefix of every obtained-achievement cache created by `useAllObtainedAchievements`. */
const OBTAINED_ACHIEVEMENTS_KEY = ["achievement", "obtained", "all"];

/**
 * Redeems an achievement code and refreshes the page data before resolving.
 *
 * Resolves `null` when an older server answers `200` without a body, so the
 * caller can close the dialog after the success notification. The catalog is
 * refetched (not only invalidated) so the caller can read the unlocked feat
 * from the cache before showing the reveal step.
 */
export function useRedeemFeatCode(targetUserId: string) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation<RedeemAchievementCodeResponseDto | null, Error, string>({
    mutationFn: async (code) => {
      const response =
        await AchievementsCodeService.achievementsCodeControllerConsumeV1(code);
      // Older servers may omit the response body.
      return (response as RedeemAchievementCodeResponseDto | undefined) ?? null;
    },
    onSuccess: async () => {
      notifications.show({
        color: "green",
        message: t("achievements.redeem.success"),
      });

      await Promise.all([
        queryClient.refetchQueries({
          queryKey: ["achievements", "v2", targetUserId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["achievements", "progress", targetUserId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["user-level", targetUserId],
        }),
        queryClient.invalidateQueries({
          queryKey: [...OBTAINED_ACHIEVEMENTS_KEY, targetUserId],
        }),
      ]);
    },
  });
}
