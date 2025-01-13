import React from "react";
import { Group, GroupProps } from "@mantine/core";
import { UserAvatarGroup } from "@/components/general/avatar/UserAvatarGroup";
import ProfileFollowActions from "@/components/profile/view/ProfileFollowActions";
import UserFollowActions from "@/components/follow/input/UserFollowActions";

interface Props extends GroupProps {
    userId: string;
}

const UserFollowGroup = ({ userId, ...groupProps }: Props) => {
    return (
        <Group className={"w-full justify-between flex-nowrap"} {...groupProps}>
            <UserAvatarGroup
                userId={userId}
                groupProps={{
                    wrap: "nowrap",
                }}
            />
            <UserFollowActions
                targetUserId={userId}
                withUnfollowButton={false}
            />
        </Group>
    );
};

export default UserFollowGroup;
