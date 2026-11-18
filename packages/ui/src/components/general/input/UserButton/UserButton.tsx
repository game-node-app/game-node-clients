import { useUserLevel } from "#@/components";
import { useCollectionEntriesForUserId } from "#@/components/collection/collection-entry/hooks/useCollectionEntriesForUserId";
import { UserAvatar } from "#@/components/general/avatar/UserAvatar";
import { useUserProfile } from "#@/components/profile/hooks/useUserProfile";
import { cn } from "#@/util";
import { AvatarProps, Group, GroupProps, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";

interface UserButtonProps extends GroupProps {
  userId: string;
  /** What the secondary line shows. `viewProfile` renders a "View profile" call to action. */
  count?: "level" | "games" | "viewProfile";
  /** Renders the name in bold without the `@` prefix. */
  boldName?: boolean;
  avatarProps?: AvatarProps;
}

export function UserButton({
  userId,
  count = "games",
  boldName = false,
  avatarProps,
  ...others
}: UserButtonProps) {
  const { t } = useTranslation();
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
        <Text size="md" c={"white"} fw={boldName ? 700 : undefined}>
          {profile.data?.username}
        </Text>

        <Text c="dimmed" size="sm">
          {count === "viewProfile"
            ? t("navigation.account.viewProfile")
            : count === "level"
              ? `Level ${totalLevel}`
              : `${totalGames} games`}
        </Text>
      </div>
    </Group>
  );
}