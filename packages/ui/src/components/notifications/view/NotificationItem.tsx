import { UnstyledButton, VisuallyHidden } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import type { KeyboardEvent, ReactNode } from "react";
import { cn } from "#@/util";
import type { NotificationLeading } from "../util/getNotificationContent";
import { NotificationItemLeading } from "./NotificationItemLeading";
import { NotificationsActionButton } from "./NotificationsActionButton";

export interface NotificationItemAction {
  label: ReactNode;
  onClick: () => void;
  loading?: boolean;
}

export interface NotificationItemProps {
  leading: NotificationLeading;
  name: string;
  time: string;
  message: string;
  unread: boolean;
  action?: NotificationItemAction;
  onClick: () => void;
}

/**
 * Notifications/Item. Presentation-only row: leading element, name, relative
 * time, message clamped to two lines, optional action and the unread dot.
 */
export function NotificationItem({
  leading,
  name,
  time,
  message,
  unread,
  action,
  onClick,
}: NotificationItemProps) {
  const { t } = useTranslation();

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    // The optional action is a nested button: its own Enter must not open the
    // notification target.
    if (event.target !== event.currentTarget) return;
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    onClick();
  };

  return (
    <UnstyledButton
      component="div"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "flex w-full items-start gap-3 rounded-md p-3 text-left",
        "transition-colors hover:bg-nav-raised",
        "focus-visible:[outline-style:solid] focus-visible:outline-2 focus-visible:[outline-offset:-2px] focus-visible:outline-brand-5",
      )}
    >
      <NotificationItemLeading leading={leading} />

      <div className={"flex min-w-0 flex-1 flex-col gap-1"}>
        <div className={"flex items-center gap-1.5"}>
          <span
            className={
              "min-w-0 truncate text-[14px] font-semibold leading-[normal] text-nav-text"
            }
          >
            {name}
          </span>
          <span
            className={
              "shrink-0 text-[12px] font-normal leading-[normal] text-nav-muted"
            }
          >
            {time}
          </span>
        </div>

        <span
          className={cn(
            "line-clamp-2 text-[14px] font-normal leading-[normal]",
            unread ? "text-nav-text" : "text-nav-muted",
          )}
        >
          {message}
        </span>

        {action && (
          <NotificationsActionButton
            label={action.label}
            loading={action.loading}
            onClick={action.onClick}
            className={"self-start"}
          />
        )}
      </div>

      {unread && (
        <span className={"flex h-5 w-2 shrink-0 items-center justify-center"}>
          <span
            aria-hidden="true"
            className={"size-2 rounded-full bg-brand-5"}
          />
          <VisuallyHidden>{t("notifications.unread")}</VisuallyHidden>
        </span>
      )}
    </UnstyledButton>
  );
}
