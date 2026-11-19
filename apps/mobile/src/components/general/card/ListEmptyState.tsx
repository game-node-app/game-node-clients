import { cn } from "@repo/ui";
import type { ReactNode } from "react";

interface Props {
  icon: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** Primary call to action (a Button), rendered under the text. */
  action?: ReactNode;
  className?: string;
}

/**
 * Empty state shared by mobile lists (reviews, posts, journal): icon tile, short title, one line of
 * help and an optional call to action.
 */
const ListEmptyState = ({
  icon,
  title,
  description,
  action,
  className,
}: Props) => (
  <div
    className={cn(
      "flex flex-col items-center gap-2 rounded-2xl border border-dashed border-line px-6 py-10 text-center",
      className,
    )}
  >
    <span className="flex size-14 items-center justify-center rounded-2xl bg-paper-4 text-dimmed-1">
      {icon}
    </span>
    <p className="m-0 mt-2 text-base font-semibold text-white">{title}</p>
    {description != undefined && (
      <p className="m-0 max-w-xs text-sm text-dimmed-1">{description}</p>
    )}
    {action != undefined && <div className="mt-3">{action}</div>}
  </div>
);

export { ListEmptyState };
