import React, { useMemo } from "react";
import {
    AvatarProps,
    Box,
    Paper,
    Stack,
    StackProps,
    Text,
} from "@mantine/core";
import useUserProfile from "@/components/profile/hooks/useUserProfile";
import { UserAvatar } from "@/components/general/avatar/UserAvatar";
import UserLevelInfo from "@/components/user-level/UserLevelInfo";
import CenteredLoading from "@/components/general/CenteredLoading";
import { useAllObtainedAchievements } from "@/components/achievement/hooks/useAllObtainedAchievements";
import ObtainedAchievementItem from "@/components/achievement/ObtainedAchievementItem";
import useUserId from "@/components/auth/hooks/useUserId";
import ProfileFollowActions from "@/components/profile/view/ProfileFollowActions";
import TextLink from "@/components/general/TextLink";

const dateFormatter = new Intl.DateTimeFormat();

interface Props {
    userId: string;
    onEditClick?: () => void;
}

const ProfileUserInfo = ({ userId, onEditClick }: Props) => {
    const ownUserId = useUserId();
    const profileQuery = useUserProfile(userId);
    const obtainedAchievementsQuery = useAllObtainedAchievements(userId);

    const isOwnProfile = ownUserId != undefined && ownUserId === userId;

    const featuredAchievement = useMemo(() => {
        if (obtainedAchievementsQuery.data == undefined) return null;
        return obtainedAchievementsQuery.data.find(
            (achievement) => achievement.isFeatured,
        );
    }, [obtainedAchievementsQuery.data]);

    if (profileQuery.isLoading) {
        return <CenteredLoading />;
    } else if (profileQuery.data == undefined) {
        return null;
    }

    return (
        <Paper
            className={"w-full h-full p-1"}
            styles={{
                root: {
                    backgroundColor: "#161616",
                },
            }}
        >
            <Stack className={"w-full h-full items-center p-2"}>
                <Box w={"80%"}>
                    <UserLevelInfo targetUserId={profileQuery.data?.userId} />
                </Box>

                <Text className={"mt-4"} fz={"0.9rem"}>
                    {profileQuery.data.bio}
                </Text>
                {featuredAchievement && (
                    <ObtainedAchievementItem
                        targetUserId={profileQuery.data.userId}
                        achievementId={featuredAchievement.achievementId}
                    />
                )}
                <Box className={"mt-4"}>
                    <ProfileFollowActions targetUserId={userId} />
                </Box>

                {isOwnProfile && (
                    <TextLink
                        linkProps={{
                            onClick: (evt) => {
                                evt.preventDefault();
                                if (onEditClick) onEditClick();
                            },
                        }}
                        href={"#"}
                        className={"mt-6"}
                    >
                        Edit profile details
                    </TextLink>
                )}

                <Text className={"mt-6"} fz={"0.8rem"} c={"dimmed"}>
                    Joined at{" "}
                    {dateFormatter.format(
                        new Date(profileQuery.data.createdAt),
                    )}
                </Text>
            </Stack>
        </Paper>
    );
};

export default ProfileUserInfo;
