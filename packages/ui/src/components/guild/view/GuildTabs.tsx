import type { Ref } from "react";
import type { GuildOverviewCountsDto } from "@repo/wrapper/server";
import { useTranslation } from "@repo/locales";
import { cn } from "#@/util/cn";

import styles from "../guild.module.css";
import { GuildIcon } from "../scene/GuildIcon";
import { formatTimeLeft } from "../util/formatTimeLeft";

export type GuildTab = "board" | "accepted" | "completed";

export interface GuildTabsProps {
  counts: GuildOverviewCountsDto;
  activeTab: GuildTab;
  onChange: (tab: GuildTab) => void;
  /** ISO date of the next board refresh, shown as a countdown. */
  nextRefreshAt: string;
  /** Short board label on the mobile layout (design D6). */
  mobile?: boolean;
  /** Focus target for Lina's "Show me the quest board" option. */
  boardTabRef?: Ref<HTMLButtonElement>;
  className?: string;
}

/**
 * Board/Accepted/Completed tabs with their server counts and the refresh
 * countdown. The board tab is the focusable anchor Lina scrolls to.
 */
export function GuildTabs({
  counts,
  activeTab,
  onChange,
  nextRefreshAt,
  mobile = false,
  boardTabRef,
  className,
}: GuildTabsProps) {
  const { t } = useTranslation();

  const tabs: { id: GuildTab; label: string; count: number }[] = [
    {
      id: "board",
      label: mobile ? t("guild.tabs.boardShort") : t("guild.tabs.board"),
      count: counts.boardCount,
    },
    {
      id: "accepted",
      label: t("guild.tabs.accepted"),
      count: counts.acceptedCount,
    },
    {
      id: "completed",
      label: t("guild.tabs.completed"),
      count: counts.completedCount,
    },
  ];

  return (
    <div
      className={cn(styles.tabsBar, mobile && styles.tabsBarMobile, className)}
    >
      <div
        className={styles.tabs}
        role="tablist"
        aria-label={t("guild.tabs.board")}
      >
        {tabs.map((tab) => {
          const active = tab.id === activeTab;

          return (
            <button
              key={tab.id}
              ref={tab.id === "board" ? boardTabRef : undefined}
              type="button"
              role="tab"
              aria-selected={active}
              data-tab={tab.id}
              className={cn(styles.tab, active && styles.tabActive)}
              onClick={() => onChange(tab.id)}
            >
              <span>{tab.label}</span>
              <span
                className={cn(styles.tabCount, active && styles.tabCountActive)}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>
      <div className={styles.tabsRenew}>
        <GuildIcon name="hourglass" size={24} />
        <span className={cn(styles.captionText)}>
          {t("guild.board.renewIn", {
            time: formatTimeLeft(nextRefreshAt),
          })}
        </span>
      </div>
    </div>
  );
}
