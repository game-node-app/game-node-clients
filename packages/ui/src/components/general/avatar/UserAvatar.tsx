import { useUserProfile } from "#@/components/profile/hooks/useUserProfile";
import { getS3StoredUpload } from "#@/util/getServerStoredImages";
import { Avatar, AvatarProps } from "@mantine/core";

interface UserAvatarProps extends AvatarProps {
  userId: string | undefined;
}

export function UserAvatar({ userId, ...others }: UserAvatarProps) {
  const profileQuery = useUserProfile(userId);
  const avatar = profileQuery.data?.avatar;
  const avatarFileSrc = avatar
    ? getS3StoredUpload(`${avatar.filename}.${avatar.extension}`)
    : undefined;

  return <Avatar src={avatarFileSrc} {...others} />;
}