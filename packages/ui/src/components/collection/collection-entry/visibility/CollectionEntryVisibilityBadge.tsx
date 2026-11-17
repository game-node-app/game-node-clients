import { Badge } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { IconLock, IconUsers } from "@tabler/icons-react";
import { cn } from "#@/util";
import type { LibraryVisibilityLevel } from "./LibraryVisibilityLevel";

export interface CollectionEntryVisibilityBadgeProps {
  visibility: LibraryVisibilityLevel;
  className?: string;
}

/**
 * Small owner-only indicator for an entry that is not public.
 *
 * Renders nothing for `public`, so callers can drop it into any card without
 * checking the level themselves. Showing it on another user's entries is the
 * caller's responsibility.
 */
export function CollectionEntryVisibilityBadge({
  visibility,
  className,
}: CollectionEntryVisibilityBadgeProps) {
  const { t } = useTranslation();

  if (visibility === "public") {
    return null;
  }

  const isPrivate = visibility === "private";

  return (
    <Badge
      className={cn(className)}
      variant={"light"}
      color={isPrivate ? "brand" : "gray"}
      size={"sm"}
      radius={"sm"}
      leftSection={isPrivate ? <IconLock size={12} /> : <IconUsers size={12} />}
    >
      {isPrivate
        ? t("libraryVisibility.badges.private")
        : t("libraryVisibility.badges.followersOnly")}
    </Badge>
  );
}
