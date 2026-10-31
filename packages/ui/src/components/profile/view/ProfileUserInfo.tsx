import {
  ProfileFollowInfo,
  ProfileUserInfoConnections,
  UserLevel,
} from "#@/components";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { CenteredLoading } from "#@/components/general/CenteredLoading";
import { TextLink } from "#@/components/general/TextLink";
import { useUserProfile } from "#@/components/profile/hooks/useUserProfile";
import { ProfileFeaturedAchievements } from "#@/components/profile/view/ProfileFeaturedAchievements.tsx";
import { ProfileFollowActions } from "#@/components/profile/view/ProfileFollowActions";
import { buildPresenterComponent } from "#@/context";
import { Box, Center, Divider, Group, Stack, Text } from "@mantine/core";
import { FollowInfoRequestDto } from "@repo/wrapper/server";

export interface ProfileUserInfoProps {
  userId: string;
  onEditClick?: () => void;
  withEditDetailsButton?: boolean;
}

const DEFAULT_ProfileUserInfo = ({
  userId,
  onEditClick,
  withEditDetailsButton = true,
}: ProfileUserInfoProps) => {
  const ownUserId = useUserId();
  const profileQuery = useUserProfile(userId);

  const isOwnProfile = ownUserId != undefined && ownUserId === userId;

  if (profileQuery.isLoading) {
    return <CenteredLoading />;
  } else if (profileQuery.data == undefined) {
    return null;
  }

  return (
    <Stack className={"w-full h-full items-center mb-6"}>
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

const ProfileUserInfo = buildPresenterComponent(
  "ProfileUserInfo",
  DEFAULT_ProfileUserInfo,
);

export { ProfileUserInfo };