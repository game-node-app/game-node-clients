import React from "react";
import { AvatarProps, Group, GroupProps, Text } from "@mantine/core";
import { UserAvatar } from "#@/components/general/avatar/UserAvatar";
import { useUserProfile } from "#@/components/profile/hooks/useUserProfile";
import { useCollectionEntriesForUserId } from "#@/components/collection/collection-entry/hooks/useCollectionEntriesForUserId";
import { useUserLevel } from "#@/components";
import { cn } from "#@/util";

interface UserButtonProps extends GroupProps {
  userId: string;
  count?: "level" | "games";
  avatarProps?: AvatarProps;
}

export function UserButton({
  userId,
  count = "games",
  avatarProps,
  ...others
}: UserButtonProps) {
  const profile = useUserProfile(userId);
  const collectionEntriesCount = useCollectionEntriesForUserId({
    userId,
    limit: 1,
  });
  const userLevel = useUserLevel(userId);

  const totalLevel = userLevel.data?.currentLevel ?? 0;
  const totalGames = collectionEntriesCount.data?.pagination.totalItems ?? 0;
  return (
    <Group
      {...others}
      className={cn("cursor-pointer flex-nowrap p-md w-full", others.className)}
    >
      <UserAvatar userId={userId} size={"lg"} {...avatarProps} />

      <div style={{ flex: 1 }}>
        <Text size="md" c={"white"}>
          {profile.data?.username}
        </Text>

        <Text c="dimmed" size="sm">
          {count === "level" ? `Level ${totalLevel}` : `${totalGames} games`}
        </Text>
      </div>
    </Group>
  );
}
