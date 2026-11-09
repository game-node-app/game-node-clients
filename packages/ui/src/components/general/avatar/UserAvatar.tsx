import { useUserProfile } from "#@/components/profile/hooks/useUserProfile";
import { ProfileVideo } from "#@/components/profile/view/ProfileVideo";
import { getS3StoredUpload } from "#@/util/getServerStoredImages";
import { Avatar, AvatarProps } from "@mantine/core";

interface UserAvatarProps extends AvatarProps {
  userId: string | undefined;
}

export function UserAvatar({ userId, ...others }: UserAvatarProps) {
  const profileQuery = useUserProfile(userId);
  const avatar = profileQuery.data?.avatar;
  const avatarVideo = profileQuery.data?.avatarVideo;
  const avatarFileSrc = avatar
    ? getS3StoredUpload(`${avatar.filename}.${avatar.extension}`)
    : undefined;

  return (
    <Avatar src={avatarVideo ? undefined : avatarFileSrc} {...others}>
      {avatarVideo && (
        <ProfileVideo
          video={avatarVideo}
          poster={avatarFileSrc}
          className={"absolute inset-0"}
        />
      )}
    </Avatar>
  );
}
