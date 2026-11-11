import { Avatar, Stack, Text } from "@mantine/core";
import type { SupporterWallItemDto } from "@repo/wrapper/server";
import { Link } from "#@/util";
import { getS3StoredUpload } from "#@/util/getServerStoredImages";

export interface SupportersWallItemProps {
  item: SupporterWallItemDto;
  variant: "page" | "settings";
}

/**
 * One person on the supporters wall: avatar and username linking to their
 * profile (design D11). Wall items carry no video, so the avatar is always a
 * still image or the provider's default placeholder.
 */
export function SupportersWallItem({ item, variant }: SupportersWallItemProps) {
  const isPage = variant === "page";
  const avatarSrc = item.avatar
    ? getS3StoredUpload(`${item.avatar.filename}.${item.avatar.extension}`)
    : undefined;

  return (
    <Link
      href={`/profile/${item.userId}`}
      data-testid={`supporters-wall-item-${item.userId}`}
      className={"group min-w-0"}
    >
      <Stack align={"center"} gap={isPage ? 8 : 6} className={"w-full min-w-0"}>
        <Avatar
          src={avatarSrc}
          size={isPage ? 72 : 48}
          className={
            "shrink-0 ring-2 ring-transparent transition-[box-shadow] group-hover:ring-[#9747ff]"
          }
        />
        <Text
          fz={isPage ? 13 : 11}
          lh={"normal"}
          truncate
          className={"w-full max-w-full text-center text-[#d9d9d9]"}
        >
          {item.username}
        </Text>
      </Stack>
    </Link>
  );
}
