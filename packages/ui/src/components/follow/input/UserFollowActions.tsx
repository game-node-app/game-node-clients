import { useUserId } from "#@/components/auth/hooks/useUserId";
import { useFollowStatus } from "#@/components/follow/hooks/useFollowStatus";
import { Button, Group } from "@mantine/core";
import { useMutation } from "@tanstack/react-query";
import { FollowService } from "../../../../../wrapper/src/server";

interface Props {
  targetUserId: string;
}

const UserFollowActions = ({ targetUserId }: Props) => {
  const ownUserId = useUserId();
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
    onSettled: () => {
      ownToTargetFollowStatus.invalidate();
    },
  });

  // if (!shouldShowFollowButton) return null;

  return (
    <Group className={"flex-nowrap w-fit"}>
      <Button
        variant={"default"}
        loading={followMutation.isPending}
        onClick={() => {
          followMutation.mutate(isFollowing ? "remove" : "register");
        }}
      >
        {isFollowing ? "Unfollow" : "Follow"}
      </Button>
    </Group>
  );
};

export { UserFollowActions };