import React, { useMemo } from "react";
import { Box, Center, Divider, Group, Paper, Stack, Text } from "@mantine/core";
import { useUserProfile } from "#@/components/profile/hooks/useUserProfile";
import { UserLevelInfo } from "#@/components/user-level/UserLevelInfo";
import { CenteredLoading } from "#@/components/general/CenteredLoading";
import { useAllObtainedAchievements } from "#@/components/achievement/hooks/useAllObtainedAchievements";
import { ObtainedAchievementItem } from "#@/components/achievement/ObtainedAchievementItem";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { ProfileFollowActions } from "#@/components/profile/view/ProfileFollowActions";
import { TextLink } from "#@/components/general/TextLink";
import {
  ProfileFollowInfo,
  ProfileUserInfoConnections,
  UserLevel,
} from "#@/components";
import { FollowInfoRequestDto } from "@repo/wrapper/server";
import { ProfileFeaturedAchievements } from "#@/components/profile/view/ProfileFeaturedAchievements.tsx";

const dateFormatter = new Intl.DateTimeFormat();

interface Props {
  userId: string;
  onEditClick?: () => void;
  withEditDetailsButton?: boolean;
}

const ProfileUserInfo = ({
  userId,
  onEditClick,
  withEditDetailsButton = true,
}: Props) => {
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
    <Stack className={"w-full h-full items-center p-2"}>
      <Center>
        <UserLevel userId={userId} />
      </Center>
      <Group className={"w-full justify-center gap-12"}>
        <ProfileFollowInfo
          targetUserId={userId}
          criteria={FollowInfoRequestDto.criteria.FOLLOWERS}
        />
        <ProfileFollowInfo
          targetUserId={userId}
          criteria={FollowInfoRequestDto.criteria.FOLLOWING}
        />
      </Group>
      <Stack className={"mt-4 w-full relative"}>
        <Text className={"text-center"}>{profileQuery.data?.bio}</Text>
      </Stack>

      {isOwnProfile && withEditDetailsButton && (
        <TextLink
          onClick={(evt) => {
            evt.preventDefault();
            if (onEditClick) onEditClick();
          }}
          href={"#"}
          className={"mt-2"}
        >
          Edit profile details
        </TextLink>
      )}
      <Box className={"my-4"}>
        <ProfileFollowActions targetUserId={userId} />
      </Box>
      <Divider className={"w-full"} />
      <ProfileFeaturedAchievements targetUserId={userId} />
      <Stack className={"w-full"}>
        <ProfileUserInfoConnections userId={userId} />
      </Stack>
    </Stack>
  );
};

export { ProfileUserInfo };
