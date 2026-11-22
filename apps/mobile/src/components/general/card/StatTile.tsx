import { cn } from "@repo/ui";
import type { ReactNode } from "react";

interface Props {
  icon?: ReactNode;
  value: ReactNode;
  label: ReactNode;
  className?: string;
}

/** Big-number tile used in 2-column stat grids (profile stats). */
const StatTile = ({ icon, value, label, className }: Props) => (
  <div
    className={cn(
      "flex min-w-0 flex-col gap-2 rounded-2xl border border-line bg-paper-8 p-4",
      className,
    )}
  >
    {icon != undefined && (
      <span className="flex size-9 items-center justify-center rounded-xl bg-brand/15 text-brand">
        {icon}
      </span>
    )}
    <span className="text-2xl font-bold leading-none text-foreground">
      {value}
    </span>
    <span className="text-[13px] leading-4 text-dimmed-1">{label}</span>
  </div>
);

export { StatTile };
