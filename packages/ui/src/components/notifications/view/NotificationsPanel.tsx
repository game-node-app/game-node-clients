import { UnstyledButton } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { NavChecksIcon, NavGearIcon } from "#@/components/general/icons/nav";
import { cn } from "#@/util";
import { useNotificationsInbox } from "../hooks/useNotificationsInbox";
import { NotificationsList } from "./NotificationsList";

export type NotificationsPanelVariant = "popover" | "page";

export interface NotificationsPanelProps {
  variant: NotificationsPanelVariant;
  /** Renders the "See all" footer when provided (web popover). */
  onSeeAll?: () => void;
  onOpenSettings: () => void;
  /** Called after an item is activated, e.g. to close the web popover. */
  onItemNavigate?: () => void;
}

/**
 * Notifications panel shared by the web popover and the web/mobile pages:
 * header (title, mark-all-as-read, settings), tabs and list, plus the optional
 * "See all" footer.
 */
export function NotificationsPanel({
  variant,
  onSeeAll,
  onOpenSettings,
  onItemNavigate,
}: NotificationsPanelProps) {
  const { t } = useTranslation();
  const { hasUnread, markAllAsRead, isMarkingAll } = useNotificationsInbox();

  const markAllDisabled = !hasUnread || isMarkingAll;

  return (
    <div
      className={cn(
        "flex flex-col gap-1",
        variant === "popover"
          ? "h-full min-h-0"
          : "mx-auto w-full max-w-[640px]",
      )}
    >
      <div className={"flex items-center gap-1 py-1 pl-3 pr-1"}>
        <span
          className={
            "min-w-0 flex-1 text-[14px] font-semibold leading-[normal] text-nav-text"
          }
        >
          {t("notifications.title")}
        </span>

        <UnstyledButton
          type="button"
          onClick={markAllAsRead}
          disabled={markAllDisabled}
          className={cn(
            "flex h-8 items-center gap-1.5 rounded-md px-2",
            "text-[12px] font-normal leading-[normal] text-brand-5",
            "transition-colors hover:bg-nav-raised",
            "focus-visible:[outline-style:solid] focus-visible:outline-2 focus-visible:[outline-offset:-2px] focus-visible:outline-brand-5",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          <NavChecksIcon size={20} />
          <span>{t("notifications.markAllAsRead")}</span>
        </UnstyledButton>

        <UnstyledButton
          type="button"
          onClick={onOpenSettings}
          aria-label={t("notifications.settings")}
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
            "text-nav-muted transition-colors hover:bg-nav-raised hover:text-nav-text",
            "focus-visible:[outline-style:solid] focus-visible:outline-2 focus-visible:[outline-offset:-2px] focus-visible:outline-brand-5",
          )}
        >
          <NavGearIcon size={20} />
        </UnstyledButton>
      </div>

      <NotificationsList
        onItemNavigate={onItemNavigate}
        fill={variant === "popover"}
      />

      {onSeeAll && (
        <div className={"border-t border-nav-border"}>
          <UnstyledButton
            type="button"
            onClick={onSeeAll}
            className={cn(
              "flex h-10 w-full items-center justify-center rounded-md",
              "text-[14px] font-normal leading-[normal] text-nav-text",
              "transition-colors hover:bg-nav-raised",
              "focus-visible:[outline-style:solid] focus-visible:outline-2 focus-visible:[outline-offset:-2px] focus-visible:outline-brand-5",
            )}
          >
            {t("notifications.seeAll")}
          </UnstyledButton>
        </div>
      )}
    </div>
  );
}
