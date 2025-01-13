import React from "react";
import useUserId from "@/components/auth/hooks/useUserId";
import { useFollowStatus } from "@/components/follow/hooks/useFollowStatus";
import { useMutation } from "@tanstack/react-query";
import { FollowInfoRequestDto, FollowService } from "@/wrapper/server";
import { useInfiniteFollowInfo } from "@/components/follow/hooks/useInfiniteFollowInfo";
import criteria = FollowInfoRequestDto.criteria;
import { ActionIcon, Button, Group, Tooltip } from "@mantine/core";
import { IconX } from "@tabler/icons-react";

interface Props {
    targetUserId: string;
    withUnfollowButton?: boolean;
}

const UserFollowActions = ({
    targetUserId,
    withUnfollowButton = true,
}: Props) => {
    const ownUserId = useUserId();
    /*
    Checks if current logged-in user is following target user
     */
    const ownToTargetFollowStatus = useFollowStatus(ownUserId, targetUserId);
    const isFollowing = ownToTargetFollowStatus.data?.isFollowing ?? false;

    const shouldShowFollowButton =
        ownUserId != undefined && ownUserId !== targetUserId;

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
                disabled={isFollowing}
                loading={followMutation.isPending}
                onClick={() => {
                    followMutation.mutate("register");
                }}
            >
                {isFollowing ? "Following" : "Follow"}
            </Button>
            {isFollowing && withUnfollowButton && (
                <Tooltip label={"Unfollow this user"}>
                    <ActionIcon
                        loading={followMutation.isPending}
                        variant="default"
                        size="lg"
                        onClick={() => {
                            followMutation.mutate("remove");
                        }}
                    >
                        <IconX color="red" />
                    </ActionIcon>
                </Tooltip>
            )}
        </Group>
    );
};

export default UserFollowActions;
