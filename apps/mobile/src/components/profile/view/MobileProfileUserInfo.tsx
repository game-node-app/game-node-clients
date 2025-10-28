import React, { useMemo } from "react";
import {
  CenteredLoading,
  ProfileFeaturedAchievements,
  ProfileFollowActions,
  ProfileFollowInfo,
  ProfileUserInfoConnections,
  ProfileUserInfoProps,
  TextLink,
  useAllObtainedAchievements,
  UserLevel,
  useUserId,
  useUserProfile,
} from "@repo/ui";
import { Box, Center, Divider, Group, Stack, Text } from "@mantine/core";
import { FollowInfoRequestDto } from "@repo/wrapper/server";
import dayjs from "dayjs";
import { MobileProfileFeaturedAchievement } from "@/components/profile/view/MobileProfileFeaturedAchievement.tsx";

const MobileProfileUserInfo = ({ userId }: ProfileUserInfoProps) => {
  const profileQuery = useUserProfile(userId);

  const memberSinceDate = profileQuery.data?.createdAt
    ? dayjs(profileQuery.data.createdAt).format("L")
    : null;

  if (profileQuery.isLoading) {
    return <CenteredLoading />;
  } else if (profileQuery.data == undefined) {
    return null;
  }

  return (
    <Stack className={"w-full h-full items-start"}>
      <Stack className={"gap-1 w-full"}>
        <UserLevel
          userId={userId}
          className={"text-sm font-bold text-dimmed"}
        />
        <Group className={"w-full justify-start gap-8 flex-nowrap"}>
          <ProfileFollowInfo
            targetUserId={userId}
            criteria={FollowInfoRequestDto.criteria.FOLLOWERS}
          />
          <ProfileFollowInfo
            targetUserId={userId}
            criteria={FollowInfoRequestDto.criteria.FOLLOWING}
          />
          {memberSinceDate && (
            <Text className={"text-dimmed"}>Since {memberSinceDate}</Text>
          )}
        </Group>
      </Stack>
      <MobileProfileFeaturedAchievement userId={userId} />
    </Stack>
  );
};

export { MobileProfileUserInfo };
