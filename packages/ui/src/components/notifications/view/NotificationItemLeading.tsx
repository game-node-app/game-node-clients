import { Avatar, Image } from "@mantine/core";
import {
  IconAlertTriangle,
  IconBell,
  IconDownload,
  IconPlugConnected,
  IconTrophy,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import type { NotificationAvatarDto } from "@repo/wrapper/server";
import { useState } from "react";
import {
  getSizedImageUrl,
  ImageSize,
} from "#@/components/game/util/getSizedImageUrl";
import { getS3StoredUpload } from "#@/util/getServerStoredImages";
import type {
  NotificationLeading,
  NotificationLeadingIcon,
} from "../util/getNotificationContent";

const LEADING_ICONS: Record<NotificationLeadingIcon, Icon> = {
  trophy: IconTrophy,
  download: IconDownload,
  alert: IconAlertTriangle,
  connection: IconPlugConnected,
  notification: IconBell,
};

const AVATAR_SIZE = 36;

/**
 * Actor avatar built straight from the notification DTO (`filename` and
 * `extension`). It never resolves the actor profile, so a notification list
 * does not issue one request per actor.
 */
function NotificationActorAvatar({
  avatar,
}: {
  avatar: NotificationAvatarDto | null;
}) {
  const src = avatar
    ? getS3StoredUpload(`${avatar.filename}.${avatar.extension}`)
    : undefined;

  return (
    <Avatar src={src} size={AVATAR_SIZE} radius="xl" className={"shrink-0"} />
  );
}

function NotificationCover({
  url,
  alt,
  avatar,
}: {
  url: string;
  alt: string;
  avatar: NotificationAvatarDto | null;
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  if (failedUrl === url) {
    return <NotificationActorAvatar avatar={avatar} />;
  }

  const sizedUrl = getSizedImageUrl(url, ImageSize.COVER_SMALL);
  const src = sizedUrl?.startsWith("http") ? sizedUrl : url;

  return (
    <Image
      src={src}
      alt={alt}
      w={AVATAR_SIZE}
      h={42}
      radius={4}
      fit="cover"
      className={"shrink-0"}
      onError={() => setFailedUrl(url)}
    />
  );
}

export interface NotificationItemLeadingProps {
  leading: NotificationLeading;
}

/**
 * Notifications/Item leading element: the actor avatar, an icon over the
 * subtle accent background or the game cover (with the avatar as fallback).
 */
export function NotificationItemLeading({
  leading,
}: NotificationItemLeadingProps) {
  if (leading.kind === "avatar") {
    return <NotificationActorAvatar avatar={leading.avatar} />;
  }

  if (leading.kind === "cover") {
    return (
      <NotificationCover
        url={leading.url}
        alt={leading.alt}
        avatar={leading.avatar}
      />
    );
  }

  const LeadingIcon = LEADING_ICONS[leading.icon];

  return (
    <span
      aria-hidden="true"
      className={
        "flex size-9 shrink-0 items-center justify-center rounded-md bg-nav-accent-subtle text-brand-5"
      }
    >
      <LeadingIcon size={20} />
    </span>
  );
}
