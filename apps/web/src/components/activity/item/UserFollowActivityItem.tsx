import React from "react";
import { Activity } from "@/wrapper/server";
import { useUserFollow } from "@/components/follow/hooks/useUserFollow";
import useUserProfile from "@/components/profile/hooks/useUserProfile";
import { Box, Group, Paper, Text, Title } from "@mantine/core";
import useOnMobile from "@/components/general/hooks/useOnMobile";
import TextLink from "@/components/general/TextLink";
import { UserAvatarGroup } from "@/components/general/avatar/UserAvatarGroup";
import { ActivityItemProps } from "@/components/activity/types";

interface Props extends ActivityItemProps {}

const UserFollowActivityItem = ({ activity, withUserAvatar = true }: Props) => {
    const onMobile = useOnMobile();
    const userFollowQuery = useUserFollow(activity.userFollowId!);

    const followerUserId = userFollowQuery.data?.followerUserId;
    const followedUserId = userFollowQuery.data?.followedUserId;

    const followerUserProfile = useUserProfile(followerUserId);
    const followedUserProfile = useUserProfile(followedUserId);

    if (!followerUserId || !followedUserId) return null;

    return (
        <Paper className={"relative w-full mih-[160px] rounded-md"}>
            <Group
                className={
                    "w-full h-full relative items-center flex-nowrap gap-4 my-5"
                }
            >
                <Box className={withUserAvatar ? "w-3/12 lg:w-2/12" : "hidden"}>
                    <UserAvatarGroup
                        userId={activity.profileUserId}
                        groupProps={{
                            wrap: "wrap",
                            justify: "center",
                            gap: onMobile ? 3 : 5,
                        }}
                        textProps={{
                            className: "text-sm md:text-md",
                        }}
                        avatarProps={{ size: onMobile ? "lg" : "xl" }}
                        withHorizontalBreak
                    />
                </Box>
                <Box
                    className={
                        withUserAvatar ? "w-6/12" : "w-6/12 ms-4 lg:ms-8"
                    }
                >
                    <Text>
                        <TextLink href={`/profile/${followerUserId}`} span>
                            {followerUserProfile.data?.username}
                        </TextLink>{" "}
                        has started following{" "}
                        <TextLink href={`/profile/${followedUserId}`} span>
                            {followedUserProfile.data?.username}
                        </TextLink>
                    </Text>
                </Box>
                <Box className={"ms-auto w-3/12 lg:w-2/12 lg:me-4"}>
                    <UserAvatarGroup
                        userId={followedUserId}
                        groupProps={{
                            wrap: "wrap",
                            justify: "center",
                            gap: onMobile ? 3 : 5,
                        }}
                        textProps={{
                            className: "text-sm md:text-md",
                        }}
                        avatarProps={{ size: onMobile ? "lg" : "xl" }}
                        withHorizontalBreak
                    />
                </Box>
            </Group>
        </Paper>
    );
};

export default UserFollowActivityItem;
