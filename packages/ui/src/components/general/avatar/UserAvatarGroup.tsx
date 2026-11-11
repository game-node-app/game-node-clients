import { useOnMobile, useUserProfile } from "#@/components";
import { getActiveSupporterPerks } from "#@/components/supporter/perks/supporterPerks";
import { SupporterBadge } from "#@/components/supporter/perks/SupporterBadge";
import { Link } from "#@/util";
import { AvatarProps, Group, GroupProps, Text, TextProps } from "@mantine/core";
import { Break } from "../Break";
import { UserAvatar } from "./UserAvatar";

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
  const perks = getActiveSupporterPerks(profileQuery.data);
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
        {perks?.badge && <SupporterBadge variant={"compact"} perks={perks} />}
      </Group>
    </Link>
  );
};
