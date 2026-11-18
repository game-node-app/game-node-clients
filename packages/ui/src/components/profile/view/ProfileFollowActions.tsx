import { useUserId } from "#@/components/auth/hooks/useUserId";
import { useFollowStatus } from "#@/components/follow/hooks/useFollowStatus";
import { UserFollowActions } from "#@/components/follow/input/UserFollowActions";
import { useRedirectToAuth } from "#@/components/auth/hooks/useRedirectToAuth";
import { Button, Stack, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";

interface Props {
  targetUserId: string;
}

const ProfileFollowActions = ({ targetUserId }: Props) => {
  const { t } = useTranslation();
  const redirectToAuth = useRedirectToAuth();
  const ownUserId = useUserId();
  /*
    Checks if current logged-in user is following target user
     */
  const ownToTargetFollowStatus = useFollowStatus(ownUserId, targetUserId);
  const targetToOwnFollowStatus = useFollowStatus(targetUserId, ownUserId);

  const isFollowing = ownToTargetFollowStatus.data?.isFollowing ?? false;
  const isBeingFollowed = targetToOwnFollowStatus.data?.isFollowing ?? false;
  const isFollowedBack = isFollowing && isBeingFollowed;

  if (ownUserId != undefined && ownUserId === targetUserId) {
    return null;
  }

  if (!ownUserId) {
    return (
      <Button
        onClick={() => void redirectToAuth()}
        variant="outline"
        radius="md"
        size="md"
      >
        {t("profile.overview.follow")}
      </Button>
    );
  }

  return (
    <Stack gap={4} className="justify-center">
      <UserFollowActions targetUserId={targetUserId} />
      {isBeingFollowed && !isFollowedBack && (
        <Text fz={"0.8rem"} c={"dimmed"}>
          {t("profile.overview.followsYou")}
        </Text>
      )}
      {isFollowedBack && (
        <Text fz={"0.8rem"} c={"dimmed"}>
          {t("profile.overview.mutualFollow")}
        </Text>
      )}
    </Stack>
  );
};

export { ProfileFollowActions };
