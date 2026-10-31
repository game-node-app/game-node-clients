import { UserFollowActions } from "#@/components/follow/input/UserFollowActions";
import { UserAvatarGroup } from "#@/components/general/avatar/UserAvatarGroup";
import { Group, GroupProps } from "@mantine/core";

interface Props extends GroupProps {
  userId: string;
}

const UserFollowGroup = ({ userId, ...groupProps }: Props) => {
  return (
    <Group className={"w-full justify-between flex-nowrap"} {...groupProps}>
      <UserAvatarGroup
        userId={userId}
        groupProps={{
          wrap: "nowrap",
        }}
      />
      <UserFollowActions targetUserId={userId} />
    </Group>
  );
};

export { UserFollowGroup };