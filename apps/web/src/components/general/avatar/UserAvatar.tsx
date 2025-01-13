import { Avatar, AvatarProps } from "@mantine/core";
import { ProfileAvatar } from "@/wrapper/server";
import { getServerStoredUpload } from "@/util/getServerStoredImages";
import useUserProfile from "@/components/profile/hooks/useUserProfile";
import { PropsWithChildren } from "react";

interface UserAvatarProps extends AvatarProps {
    userId: string | undefined;
}

export function UserAvatar({ userId, ...others }: UserAvatarProps) {
    const profileQuery = useUserProfile(userId);
    const avatar = profileQuery.data?.avatar;
    const avatarFileSrc = avatar
        ? getServerStoredUpload(`${avatar.filename}.${avatar.extension}`)
        : undefined;

    return <Avatar src={avatarFileSrc} {...others} />;
}
