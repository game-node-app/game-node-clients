import { useUserId } from "#@/components/auth/hooks/useUserId";
import { useFollowStatus } from "#@/components/follow/hooks/useFollowStatus";
import { invalidateFollowedUserQueries } from "#@/components/follow/hooks/useUserFollow";
import { createErrorNotification } from "#@/util";
import { Button, Group } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FollowService } from "../../../../../wrapper/src/server";

interface Props {
  targetUserId: string;
}

const UserFollowActions = ({ targetUserId }: Props) => {
  const { t } = useTranslation();
  const ownUserId = useUserId();
  const queryClient = useQueryClient();
  /*
    Checks if current logged-in user is following target user
     */
  const ownToTargetFollowStatus = useFollowStatus(ownUserId, targetUserId);
  const isFollowing = ownToTargetFollowStatus.data?.isFollowing ?? false;

  const followMutation = useMutation({
    mutationFn: async (action: "register" | "remove") => {
      if (action === "register") {
        if (isFollowing) return;

        await FollowService.followControllerRegisterFollowV1({
          followedUserId: targetUserId,
        });

        return;
      }

      await FollowService.followControllerRemoveFollowV1({
        followedUserId: targetUserId,
      });
    },
    onSuccess: () => {
      // Following/unfollowing changes what the viewer may see of this user.
      void invalidateFollowedUserQueries(queryClient, targetUserId);
      void queryClient.invalidateQueries({
        queryKey: ["user", "follow", "info"],
      });
    },
    onError: createErrorNotification,
    onSettled: () => {
      ownToTargetFollowStatus.invalidate();
    },
  });

  return (
    <Group className={"flex-nowrap w-fit"}>
      <Button
        variant={"default"}
        loading={followMutation.isPending}
        onClick={() => {
          followMutation.mutate(isFollowing ? "remove" : "register");
        }}
      >
        {t(
          isFollowing ? "profile.overview.unfollow" : "profile.overview.follow",
        )}
      </Button>
    </Group>
  );
};

export { UserFollowActions };
