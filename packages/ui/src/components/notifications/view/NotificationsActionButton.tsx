import { Loader, UnstyledButton } from "@mantine/core";
import type { MouseEvent, ReactNode } from "react";
import { cn } from "#@/util";

export interface NotificationsActionButtonProps {
  label: ReactNode;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * Notifications/Action button. A 28 px outlined button rendered inside a
 * notification item. Its click never bubbles to the item, so the action does
 * not open the notification target nor acknowledge it as read.
 */
export function NotificationsActionButton({
  label,
  onClick,
  loading = false,
  disabled = false,
  className,
}: NotificationsActionButtonProps) {
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onClick();
  };

  return (
    <UnstyledButton
      type="button"
      onClick={handleClick}
      disabled={disabled || loading}
      aria-busy={loading}
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-md border border-nav-border px-2.5",
        "text-[12px] font-normal leading-[normal] text-nav-text",
        "transition-colors hover:bg-nav-raised",
        "focus-visible:[outline-style:solid] focus-visible:outline-2 focus-visible:[outline-offset:-2px] focus-visible:outline-brand-5",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
    >
      {loading && <Loader size={12} color="gray" aria-hidden="true" />}
      <span>{label}</span>
    </UnstyledButton>
  );
}
