import React from "react";
import {
  Group,
  Text,
  UnstyledButton,
  UnstyledButtonProps,
} from "@mantine/core";
import classes from "./UserButton.module.css";
import { UserAvatar } from "#@/components/general/avatar/UserAvatar";
import { useUserProfile } from "#@/components/profile/hooks/useUserProfile";
import { useCollectionEntriesForUserId } from "#@/components/collection/collection-entry/hooks/useCollectionEntriesForUserId";

interface UserButtonProps extends UnstyledButtonProps {
  userId: string;
}

export function UserButton({ userId, ...others }: UserButtonProps) {
  const profile = useUserProfile(userId);
  const collectionEntriesCount = useCollectionEntriesForUserId(userId, 0, 1);
  const totalGames = collectionEntriesCount.data?.pagination.totalItems || 0;
  return (
    <UnstyledButton className={classes.user} {...others}>
      <Group wrap={"nowrap"} p={"md"} w={"100%"}>
        <UserAvatar userId={userId} size={"lg"} />

        <div style={{ flex: 1 }}>
          <Text size="md" c={"white"}>
            {profile.data?.username}
          </Text>

          <Text c="dimmed" size="sm">
            {totalGames} games
          </Text>
        </div>
      </Group>
    </UnstyledButton>
  );
}
