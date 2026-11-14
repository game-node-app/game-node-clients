import { Menu } from "@mantine/core";
import { cn, type NavIconProps } from "@repo/ui";
import Link from "next/link";
import type { ComponentType } from "react";

export type AccountMenuItemTone = "default" | "danger";

interface Props {
  label: string;
  icon: ComponentType<NavIconProps>;
  tone?: AccountMenuItemTone;
  href?: string;
  target?: "_blank";
  onClick?: () => void;
}

/**
 * Account menu/Item. Default items are muted and turn white on hover/focus;
 * the danger tone (log out) keeps `nav-danger` in every state.
 */
export function AccountMenuItem({
  label,
  icon: Icon,
  tone = "default",
  href,
  target,
  onClick,
}: Props) {
  const itemClassName = cn(
    "flex h-10 items-center gap-3 rounded-md px-3 text-[14px] font-normal leading-[normal]",
    "focus:bg-transparent focus-visible:[outline-style:solid] focus-visible:outline-2 focus-visible:outline-brand-5",
    tone === "danger"
      ? "text-nav-danger hover:bg-nav-raised hover:text-nav-danger focus-visible:text-nav-danger"
      : "text-nav-muted hover:bg-nav-raised hover:text-nav-text focus-visible:text-nav-text",
  );

  const leftSection = <Icon size={20} />;

  if (href) {
    return (
      <Menu.Item
        component={Link}
        href={href}
        target={target}
        rel={target === "_blank" ? "noreferrer" : undefined}
        onClick={onClick}
        className={itemClassName}
        classNames={{ itemSection: "me-0" }}
        leftSection={leftSection}
      >
        {label}
      </Menu.Item>
    );
  }

  return (
    <Menu.Item
      onClick={onClick}
      className={itemClassName}
      classNames={{ itemSection: "me-0" }}
      leftSection={leftSection}
    >
      {label}
    </Menu.Item>
  );
}
