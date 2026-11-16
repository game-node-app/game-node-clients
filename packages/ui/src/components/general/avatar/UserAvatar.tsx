import { useUserProfile } from "#@/components/profile/hooks/useUserProfile";
import {
  ProfileVideo,
  ProfileVideoFile,
} from "#@/components/profile/view/ProfileVideo";
import { getS3StoredUpload } from "#@/util/getServerStoredImages";
import { Avatar, AvatarProps } from "@mantine/core";
import { Profile } from "@repo/wrapper/server";

export type UserAvatarProfile = Pick<Profile, "avatar"> & {
  avatarVideo?: ProfileVideoFile | null;
};

interface UserAvatarProps extends AvatarProps {
  userId: string | undefined;
  profile?: UserAvatarProfile | null;
}

export function UserAvatar({ userId, profile, ...others }: UserAvatarProps) {
  const hasEmbeddedProfile = profile !== undefined;
  const profileQuery = useUserProfile(userId, {
    enabled: !hasEmbeddedProfile,
  });
  const resolvedProfile = hasEmbeddedProfile ? profile : profileQuery.data;
  const avatar = resolvedProfile?.avatar;
  const avatarVideo = resolvedProfile?.avatarVideo;
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
