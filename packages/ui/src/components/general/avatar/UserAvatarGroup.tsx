import { AvatarProps, Group, GroupProps, Text, TextProps } from "@mantine/core";
import React from "react";
import { useOnMobile, useUserProfile } from "#@/components";
import { Link } from "#@/util";
import { UserAvatar } from "./UserAvatar";
import { Break } from "../Break";

interface IProps {
  userId: string;
  avatarProps?: AvatarProps;
  groupProps?: GroupProps;
  textProps?: TextProps;
  withHorizontalBreak?: boolean;
}

export const UserAvatarGroup = ({
  userId,
  avatarProps,
  groupProps,
  textProps,
  withHorizontalBreak,
}: IProps) => {
  const profileQuery = useUserProfile(userId);
  const onMobile = useOnMobile();
  return (
    <Link
      href={`/profile/${profileQuery.data?.userId}`}
      className={"inline-flex"}
    >
      <Group
        wrap={onMobile ? "nowrap" : "wrap"}
        gap={onMobile ? undefined : 5}
        {...groupProps}
      >
        <UserAvatar {...avatarProps} userId={userId} />
        {withHorizontalBreak && <Break />}
        <Text
          c={"white"}
          lineClamp={2}
          className={"break-words"}
          {...textProps}
        >
          {profileQuery.data?.username}
        </Text>
      </Group>
    </Link>
  );
};
