import type { DockItemDefinition } from "@/components/general/shell/navbar/dockItems";
import { Tooltip, UnstyledButton } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { cn } from "@repo/ui";
import Link from "next/link";

interface Props {
  item: DockItemDefinition;
  collapsed: boolean;
  active: boolean;
  onActivate?: (item: DockItemDefinition) => void;
}

/**
 * Navigation/Item. Default/hover/active/focus states, the "New" pill (open)
 * and the orange dot (collapsed) follow the design reference.
 */
export function DockItem({ item, collapsed, active, onActivate }: Props) {
  const { t } = useTranslation();
  const label = t(item.labelKey);

  const itemClassName = cn(
    "relative flex h-10 w-full items-center rounded-md text-[14px] leading-[normal]",
    "focus-visible:[outline-style:solid] focus-visible:outline-2 focus-visible:[outline-offset:-2px] focus-visible:outline-brand-5",
    collapsed ? "justify-center" : "gap-3 px-3",
    active
      ? "bg-nav-raised font-semibold text-nav-text"
      : "font-normal text-nav-muted hover:bg-nav-raised hover:text-nav-text focus-visible:text-nav-text",
  );

  const content = (
    <>
      {/* Figma keeps the Active glyph muted; only the label turns white. */}
      <item.icon
        size={20}
        className={cn("shrink-0", active && "text-nav-muted")}
      />
      {!collapsed && <span className="flex-1 truncate text-left">{label}</span>}
      {!collapsed && item.isNew && (
        <span className="flex h-5 shrink-0 items-center rounded-sm bg-nav-accent-subtle px-1.5 text-[12px] font-normal leading-[normal] text-brand-5">
          {t("navigation.new")}
        </span>
      )}
      {collapsed && item.isNew && (
        <span
          aria-hidden="true"
          className="absolute left-[30px] top-2 size-2 rounded-full bg-brand-5"
        />
      )}
    </>
  );

  const handleActivate = () => {
    onActivate?.(item);
  };

  const element =
    item.kind === "link" ? (
      <Link
        href={item.href}
        aria-label={collapsed ? label : undefined}
        aria-current={active ? "page" : undefined}
        className={itemClassName}
        onClick={handleActivate}
      >
        {content}
      </Link>
    ) : (
      <UnstyledButton
        aria-label={collapsed ? label : undefined}
        className={itemClassName}
        onClick={handleActivate}
      >
        {content}
      </UnstyledButton>
    );

  if (!collapsed) {
    return element;
  }

  return (
    <Tooltip label={label} position="right" offset={8}>
      {element}
    </Tooltip>
  );
}
