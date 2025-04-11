import React from "react";
import { Box, Combobox, Group, Skeleton, Stack, Text } from "@mantine/core";
import Link from "next/link";
import { UserAvatar, useUserProfile } from "@repo/ui";

interface IProps {
  userId: string;
}

const UserSelectOption = ({ userId }: IProps) => {
  const profileQuery = useUserProfile(userId);
  const profile = profileQuery.data;
  if (profileQuery.isError) return null;
  return (
    <Combobox.Option value={userId} className={"w-full h-full"}>
      <Link href={`/profile/${userId}`} className={"w-full h-full"}>
        <Group wrap={"nowrap"} w={"100%"} h={"100%"}>
          <UserAvatar size={"lg"} userId={userId} />
          <Stack justify={"center"}>
            {profileQuery.isLoading && <Skeleton className={"w-36 h-7"} />}
            {profile != undefined && <Text>{profile.username}</Text>}
          </Stack>
        </Group>
      </Link>
    </Combobox.Option>
  );
};

export default UserSelectOption;
