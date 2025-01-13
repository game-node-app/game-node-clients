import React from "react";
import { UserAvatar } from "@/components/general/avatar/UserAvatar";
import { AvatarProps, Stack, Text } from "@mantine/core";
import UserLevelInfo from "@/components/user-level/UserLevelInfo";
import Link from "next/link";
import useUserProfile from "@/components/profile/hooks/useUserProfile";

const DateFormatter = new Intl.DateTimeFormat();

interface Props {
    userId: string;
    showJoinDate?: boolean;
    enableLink?: boolean;
    avatarProps?: AvatarProps;
}

const UserAvatarWithLevelInfo = ({
    userId,
    showJoinDate = true,
    enableLink = true,
    avatarProps,
}: Props) => {
    const profileQuery = useUserProfile(userId);

    return (
        <Link
            href={`/profile/${userId}`}
            className={
                "flex flex-shrink-0 max-w-fit items-center gap-5 justify-center flex-wrap lg:flex-nowrap lg:justify-start"
            }
            onClick={(evt) => {
                if (!enableLink) {
                    evt.preventDefault();
                }
            }}
        >
            <UserAvatar userId={userId} size={"xl"} {...avatarProps} />
            <Stack className={"gap-3"}>
                <Text className={"text-lg font-bold"}>
                    {profileQuery.data?.username}
                </Text>
                <UserLevelInfo targetUserId={userId} />
                {showJoinDate && profileQuery.data && (
                    <Text className={"text-sm text-dimmed"}>
                        Member since{" "}
                        {DateFormatter.format(
                            new Date(profileQuery.data.createdAt),
                        )}
                    </Text>
                )}
            </Stack>
        </Link>
    );
};

export default UserAvatarWithLevelInfo;
