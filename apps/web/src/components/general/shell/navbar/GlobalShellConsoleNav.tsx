import { Fragment } from "react";
import { Tooltip, UnstyledButton } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { cn, useSettingsModalState } from "@repo/ui";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  DOCK_UTILITY_ITEMS,
  isDockItemActive,
  type DockBadge,
  type DockItemDefinition,
} from "./dockItems";
import { useDockGroups } from "./useDockGroups";
import styles from "./GlobalShellConsoleNav.module.css";

const DOCK_BADGE_LABEL_KEYS: Record<
  DockBadge,
  | "navigation.new"
  | "navigation.dock.badgeLive"
  | "navigation.dock.badgeNewFeminine"
> = {
  new: "navigation.new",
  live: "navigation.dock.badgeLive",
  newFeminine: "navigation.dock.badgeNewFeminine",
};

export type ConsoleNavVariant = "header" | "bottom";

interface Props {
  variant: ConsoleNavVariant;
}

/**
 * Console navigation: the Dock destinations as an icon row. The header uses
 * it between the logo and the account block; below `md` the same destinations
 * move to the fixed bottom bar. Every Dock link and utility action stays
 * reachable, including the seasonal and premium entries.
 */
export function GlobalShellConsoleNav({ variant }: Props) {
  const { t } = useTranslation();
  const groups = useDockGroups();

  return (
    <nav
      aria-label={t("navigation.dock.title")}
      className={cn(
        styles.strip,
        variant === "header" ? styles.headerStrip : styles.bottomStrip,
      )}
    >
      {groups.map((group, index) => (
        <Fragment key={group.id}>
          {index > 0 && <span aria-hidden="true" className={styles.divider} />}
          {group.items.map((item) => (
            <ConsoleNavItem key={item.id} item={item} variant={variant} />
          ))}
        </Fragment>
      ))}
      <span aria-hidden="true" className={styles.divider} />
      {DOCK_UTILITY_ITEMS.map((item) => (
        <ConsoleNavItem key={item.id} item={item} variant={variant} />
      ))}
    </nav>
  );
}

function ConsoleNavItem({
  item,
  variant,
}: {
  item: DockItemDefinition;
  variant: ConsoleNavVariant;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const settings = useSettingsModalState();
  const active = isDockItemActive(item, router.pathname, router.query);
  const label = t(item.labelKey, item.labelParams);
  const badgeLabel = item.badge ? t(DOCK_BADGE_LABEL_KEYS[item.badge]) : null;
  const ariaLabel = badgeLabel ? `${label} (${badgeLabel})` : label;

  const content = (
    <>
      <item.icon size={variant === "header" ? 20 : 22} />
      {item.badge && <span aria-hidden="true" className={styles.badge} />}
    </>
  );

  const itemClassName = cn(styles.item, active && styles.active);

  const element =
    item.kind === "link" ? (
      <Link
        href={item.href}
        aria-label={ariaLabel}
        aria-current={active ? "page" : undefined}
        className={itemClassName}
      >
        {content}
      </Link>
    ) : (
      <UnstyledButton
        aria-label={ariaLabel}
        className={itemClassName}
        onClick={() => settings.open(item.action)}
      >
        {content}
      </UnstyledButton>
    );

  // The bottom bar is touch-first: no hover tooltip that could stick.
  if (variant === "bottom") {
    return element;
  }

  return (
    <Tooltip label={label} position="bottom" offset={6}>
      {element}
    </Tooltip>
  );
}
