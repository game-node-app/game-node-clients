import { useTranslation } from "@repo/locales";
import type { NotificationInboxItemDto } from "@repo/wrapper/server";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { useRouter } from "#@/util";
import { useFollowBackNotification } from "../hooks/useFollowBackNotification";
import { useNotificationsInbox } from "../hooks/useNotificationsInbox";
import { formatNotificationTime } from "../util/formatNotificationTime";
import { getNotificationContent } from "../util/getNotificationContent";
import { navigateToNotificationTarget } from "../util/navigateToNotificationTarget";
import {
  NotificationItem,
  type NotificationItemAction,
} from "./NotificationItem";

export interface InboxNotificationItemProps {
  item: NotificationInboxItemDto;
  /** Called after the item is activated, e.g. to close the web popover. */
  onNavigate?: () => void;
}

/**
 * Binds an inbox DTO to the presentation-only `NotificationItem`: translates
 * the content, acknowledges the read on activation, navigates to the typed
 * target and wires the optional "Follow back" action.
 */
export function InboxNotificationItem({
  item,
  onNavigate,
}: InboxNotificationItemProps) {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const userId = useUserId();
  const { markAsRead } = useNotificationsInbox();
  const { followBack, isPending } = useFollowBackNotification();

  const content = getNotificationContent(item, t);
  const unread = item.readVersion < item.version;

  const handleClick = () => {
    if (unread) {
      markAsRead(item);
    }
    onNavigate?.();
    void navigateToNotificationTarget(item.target, router, userId);
  };

  const action: NotificationItemAction | undefined = content.action
    ? {
        label: t("notifications.actions.followBack"),
        onClick: () => followBack(content.action!.userId),
        loading: isPending,
      }
    : undefined;

  return (
    <NotificationItem
      leading={content.leading}
      name={content.name}
      time={formatNotificationTime(item.lastEventAt, t, i18n.language)}
      message={content.message}
      unread={unread}
      action={action}
      onClick={handleClick}
    />
  );
}
