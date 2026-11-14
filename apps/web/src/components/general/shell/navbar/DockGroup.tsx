import type { ReactNode } from "react";

interface Props {
  label: string;
  collapsed: boolean;
  children: ReactNode;
}

/**
 * Group title when the Dock is open, divider when it is collapsed.
 */
export function DockGroup({ label, collapsed, children }: Props) {
  return (
    <div className="flex flex-col gap-3">
      {collapsed ? (
        <div aria-hidden="true" className="h-px w-full bg-nav-border" />
      ) : (
        <span className="text-[12px] font-normal leading-[normal] text-nav-muted">
          {label}
        </span>
      )}
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );
}
