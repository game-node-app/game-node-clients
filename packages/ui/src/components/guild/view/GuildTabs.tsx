import {
  type KeyboardEvent,
  type Ref,
  useEffect,
  useRef,
  useState,
} from "react";
import type { GuildOverviewCountsDto } from "@repo/wrapper/server";
import { useTranslation } from "@repo/locales";
import { cn } from "#@/util/cn";

import styles from "../guild.module.css";
import tabsStyles from "./GuildTabs.module.css";
import { GuildIcon } from "../scene/GuildIcon";
import { formatTimeLeft } from "../util/formatTimeLeft";

export type GuildTab =
  | "board"
  | "accepted"
  | "completed"
  | "arcs"
  | "bounties"
  | "emporium";

export function getGuildTabId(tab: GuildTab): string {
  return `guild-tab-${tab}`;
}

export function getGuildTabPanelId(tab: GuildTab): string {
  return `guild-tabpanel-${tab}`;
}

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (!ref) return;
  if (typeof ref === "function") {
    ref(value);
  } else {
    (ref as { current: T | null }).current = value;
  }
}

export interface GuildTabsProps {
  counts: GuildOverviewCountsDto;
  activeTab: GuildTab;
  onChange: (tab: GuildTab) => void;
  /** ISO date of the next board refresh, shown as a countdown. */
  nextRefreshAt: string;
  /** Active Community Bounties (`overview.activeBountiesCount`). */
  bountiesCount?: number;
  /** `lina.trigger === "community_bounty_ready"`: stronger Bounties marker. */
  bountyReady?: boolean;
  /** Short board label on the mobile layout (design D6). */
  mobile?: boolean;
  /** Focus target for Lina's "Show me the quest board" option. */
  boardTabRef?: Ref<HTMLButtonElement>;
  className?: string;
}

interface TabItem {
  id: GuildTab;
  label: string;
  /** Server count, shown for the board lists only (design D5). */
  count?: number;
}

/** Which scroll edges still hide tabs (the mobile strip scrolls sideways). */
interface TabEdges {
  start: boolean;
  end: boolean;
}

const NO_TAB_EDGES: TabEdges = { start: false, end: false };

function readTabEdges(list: HTMLDivElement): TabEdges {
  const maxScrollLeft = list.scrollWidth - list.clientWidth;

  return {
    start: list.scrollLeft > 1,
    end: maxScrollLeft > 1 && list.scrollLeft < maxScrollLeft - 1,
  };
}

/**
 * The six hall tabs (design D5): board, accepted and completed with their
 * server counts, then Arcs, Bounties and the Emporium. Bounties carries a dot
 * while there are active bounties, stronger when Lina says one is ready. On
 * mobile the row scrolls horizontally instead of wrapping.
 */
export function GuildTabs({
  counts,
  activeTab,
  onChange,
  nextRefreshAt,
  bountiesCount = 0,
  bountyReady = false,
  mobile = false,
  boardTabRef,
  className,
}: GuildTabsProps) {
  const { t } = useTranslation();
  const listRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Partial<Record<GuildTab, HTMLButtonElement | null>>>(
    {},
  );
  const [edges, setEdges] = useState<TabEdges>(NO_TAB_EDGES);

  const tabs: TabItem[] = [
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
    { id: "arcs", label: t("guild.tabs.arcs") },
    { id: "bounties", label: t("guild.tabs.bounties") },
    { id: "emporium", label: t("guild.tabs.emporium") },
  ];

  const showBountyMarker = bountiesCount > 0 || bountyReady;
  // The weekly board countdown is irrelevant on Arcs, Bounties and the
  // Emporium, which have their own deadlines, so it only renders on the tabs
  // whose content follows the board. The reserved row keeps the height stable.
  const showRenew =
    activeTab === "board" ||
    activeTab === "accepted" ||
    activeTab === "completed";

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const updateEdges = () => {
      const next = readTabEdges(list);
      setEdges((previous) =>
        previous.start === next.start && previous.end === next.end
          ? previous
          : next,
      );
    };

    if (mobile) {
      const active = list.querySelector<HTMLElement>(
        `[data-tab="${activeTab}"]`,
      );

      if (active) {
        // Scroll only the tab strip, never the page (design D5):
        // `scrollIntoView` would also move the vertical scroll of the hall.
        const listRect = list.getBoundingClientRect();
        const activeRect = active.getBoundingClientRect();

        if (activeRect.left < listRect.left) {
          list.scrollLeft += activeRect.left - listRect.left;
        } else if (activeRect.right > listRect.right) {
          list.scrollLeft += activeRect.right - listRect.right;
        }
      }
    }

    updateEdges();
    list.addEventListener("scroll", updateEdges, { passive: true });
    window.addEventListener("resize", updateEdges);

    return () => {
      list.removeEventListener("scroll", updateEdges);
      window.removeEventListener("resize", updateEdges);
    };
  }, [activeTab, mobile]);

  const handleTabKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    let nextIndex: number | null = null;
    if (event.key === "ArrowRight") {
      nextIndex = (index + 1) % tabs.length;
    } else if (event.key === "ArrowLeft") {
      nextIndex = (index - 1 + tabs.length) % tabs.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = tabs.length - 1;
    }

    if (nextIndex === null) return;

    const nextTab = tabs[nextIndex];
    if (!nextTab) return;

    event.preventDefault();
    onChange(nextTab.id);
    tabRefs.current[nextTab.id]?.focus();
  };

  return (
    <div
      className={cn(styles.tabsBar, mobile && styles.tabsBarMobile, className)}
    >
      <div className={styles.tabsViewport}>
        <div
          ref={listRef}
          className={cn(
            styles.tabs,
            mobile &&
              "max-w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          )}
          role="tablist"
          aria-label={t("guild.tabs.board")}
        >
          {tabs.map((tab, index) => {
            const active = tab.id === activeTab;

            return (
              <button
                key={tab.id}
                ref={(node) => {
                  tabRefs.current[tab.id] = node;
                  if (tab.id === "board") {
                    assignRef(boardTabRef, node);
                  }
                }}
                id={getGuildTabId(tab.id)}
                type="button"
                role="tab"
                tabIndex={active ? 0 : -1}
                aria-selected={active}
                aria-controls={getGuildTabPanelId(tab.id)}
                data-tab={tab.id}
                className={cn(
                  styles.tab,
                  tabsStyles.tab,
                  active && styles.tabActive,
                )}
                onClick={() => onChange(tab.id)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined ? (
                  <span
                    className={cn(
                      styles.tabCount,
                      tabsStyles.tabCount,
                      active && styles.tabCountActive,
                    )}
                  >
                    {tab.count}
                  </span>
                ) : null}
                {tab.id === "bounties" && showBountyMarker ? (
                  <span
                    aria-hidden="true"
                    data-bounty-marker={bountyReady ? "ready" : "active"}
                    className={cn(
                      "inline-block flex-none rounded-full",
                      bountyReady
                        ? "h-2 w-2 bg-accent"
                        : "h-1.5 w-1.5 bg-brand",
                    )}
                  />
                ) : null}
              </button>
            );
          })}
        </div>
        <span
          className={cn(styles.tabsEdge, styles.tabsEdgeStart)}
          data-tab-edge="start"
          data-visible={edges.start ? "true" : undefined}
          aria-hidden="true"
        />
        <span
          className={cn(styles.tabsEdge, styles.tabsEdgeEnd)}
          data-tab-edge="end"
          data-visible={edges.end ? "true" : undefined}
          aria-hidden="true"
        />
      </div>
      <div
        className={cn(
          styles.tabsRenew,
          !showRenew && tabsStyles.tabsRenewPlaceholder,
        )}
        data-tabs-renew={showRenew ? "shown" : "hidden"}
      >
        {showRenew ? (
          <>
            <GuildIcon name="hourglass" size={24} />
            <span className={cn(styles.captionText)}>
              {t("guild.board.renewIn", {
                time: formatTimeLeft(nextRefreshAt),
              })}
            </span>
          </>
        ) : null}
      </div>
    </div>
  );
}
