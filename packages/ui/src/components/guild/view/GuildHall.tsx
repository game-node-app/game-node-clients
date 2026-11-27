import { useRef, useState } from "react";
import { useMediaQuery } from "@mantine/hooks";
import { GuildContractDto, LinaReceptionDto } from "@repo/wrapper/server";
import { useTranslation } from "@repo/locales";
import { cn } from "#@/util";

import styles from "../guild.module.css";
import { useGuildOverview } from "../hooks/useGuildOverview";
import { useMarkGuildBoardSeen } from "../hooks/useMarkGuildBoardSeen";
import { GuildScene } from "../scene/GuildScene";
import { LinaDialogue } from "../scene/LinaDialogue";
import { getLinaLine } from "../util/getLinaLine";
import { getGuildMaxActiveContracts } from "../util/guildErrors";
import { GuildActiveContracts } from "./GuildActiveContracts";
import { GuildBoard } from "./GuildBoard";
import { GuildBounties } from "./GuildBounties";
import { GuildChains } from "./GuildChains";
import { GuildContractList } from "./GuildContractList";
import { GuildEmporium } from "./GuildEmporium";
import { GuildHallSkeleton } from "./GuildHallSkeleton";
import { GuildHeader } from "./GuildHeader";
import { GuildLicenseCard } from "./GuildLicenseCard";
import { GuildPassportCard } from "./GuildPassportCard";
import { GuildQueryError } from "./GuildQueryError";
import { GuildRewardsPanel } from "./GuildRewardsPanel";
import {
  getGuildTabId,
  getGuildTabPanelId,
  GuildTabs,
  type GuildTab,
} from "./GuildTabs";

export interface GuildHallProps {
  initialTab?: GuildTab;
  /** Deep link from `guild.community-bounty-ready` (bounties tab). */
  initialBountyId?: string | null;
  className?: string;
}

/**
 * The Guild Hall (design D6). At `md` and above it renders the desktop frame
 * (scene with the dialogue overlaid, 340 px sidebar, two-column cork board);
 * below it renders the compact mobile frame (dialogue below the scene, active
 * contracts and License stacked, single-column board).
 */
export function GuildHall({
  initialTab = "board",
  initialBountyId,
  className,
}: GuildHallProps) {
  const { t } = useTranslation();
  const isDesktop = useMediaQuery("(min-width: 48em)", true);
  const overview = useGuildOverview();
  const markBoardSeen = useMarkGuildBoardSeen();

  const [activeTab, setActiveTab] = useState<GuildTab>(initialTab);
  const [linkedTab, setLinkedTab] = useState<GuildTab>(initialTab);
  const [quick, setQuick] = useState(false);
  const [dialogueCollapsed, setDialogueCollapsed] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  const [hiddenQuestIds, setHiddenQuestIds] = useState<Set<string>>(
    () => new Set(),
  );

  const tabsRef = useRef<HTMLDivElement>(null);
  const boardTabRef = useRef<HTMLButtonElement>(null);
  const hasMarkedSeen = useRef(false);

  // Deep links can change while the hall stays mounted (notification inbox →
  // same `/guild` route, Ionic route reuse). Adjust the selected tab during
  // render instead of remounting the scene; plain tab clicks keep working
  // because the prop only changes on navigation. This is React's "adjusting
  // state when a prop changes" pattern.
  if (initialTab !== linkedTab) {
    setLinkedTab(initialTab);
    setActiveTab(initialTab);
    setQuick(false);
  }

  const scrollToTabs = () => {
    if (typeof window === "undefined") return;

    window.requestAnimationFrame(() => {
      const tabs = tabsRef.current;
      if (tabs && typeof tabs.scrollIntoView === "function") {
        tabs.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  };

  const focusBoard = () => {
    setActiveTab("board");
    setQuick(false);
    setDialogueCollapsed(false);

    if (overview.data?.lina.hasUnseenBoard && !hasMarkedSeen.current) {
      hasMarkedSeen.current = true;
      markBoardSeen.mutate();
    }

    if (typeof window === "undefined") return;

    window.requestAnimationFrame(() => {
      const tabs = tabsRef.current;
      if (tabs && typeof tabs.scrollIntoView === "function") {
        tabs.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      boardTabRef.current?.focus({ preventScroll: true });
    });
  };

  const collapseDialogue = () => {
    setIsTalking(false);
    setDialogueCollapsed(true);
  };

  const showAcceptedTab = () => {
    setActiveTab("accepted");
    scrollToTabs();
  };

  const showBounties = () => {
    setActiveTab("bounties");
    setDialogueCollapsed(false);
    scrollToTabs();
  };

  const showEmporium = () => {
    setActiveTab("emporium");
    setDialogueCollapsed(false);
    scrollToTabs();
  };

  const hideQuest = (questId: string) => {
    setHiddenQuestIds((previous) => {
      const next = new Set(previous);
      next.add(questId);
      return next;
    });
  };

  if (overview.isPending && !overview.data) {
    return <GuildHallSkeleton className={className} />;
  }

  if (!overview.data) {
    return (
      <div className={cn(styles.hall, className)}>
        <GuildQueryError
          error={overview.error}
          onRetry={() => {
            void overview.refetch();
          }}
          isRetrying={overview.isFetching}
        />
      </div>
    );
  }

  const {
    license,
    activeContracts,
    yearGoal,
    counts,
    nextRefreshAt,
    lina,
    activeBountiesCount,
  } = overview.data;
  const maxActiveContracts = getGuildMaxActiveContracts(license);
  const hasReadyContract = activeContracts.some(
    (contract) => contract.status === GuildContractDto.status.READY_TO_CLAIM,
  );
  const pose = lina.pose === "happy" || hasReadyContract ? "happy" : "neutral";
  const showAlert = lina.hasUnseenBoard;

  const linaOptions =
    lina.trigger === LinaReceptionDto.trigger.COMMUNITY_BOUNTY_READY
      ? [
          {
            id: "bounties",
            label: t("guild.lina.options.bounties"),
            onSelect: showBounties,
          },
          {
            id: "board",
            label: t("guild.lina.options.board"),
            onSelect: focusBoard,
          },
          {
            id: "goodbye",
            label: t("guild.lina.options.goodbye"),
            onSelect: collapseDialogue,
          },
        ]
      : [
          {
            id: "board",
            label: t("guild.lina.options.board"),
            onSelect: focusBoard,
          },
          {
            id: "emporium",
            label: t("guild.lina.options.emporium"),
            onSelect: showEmporium,
          },
          {
            id: "goodbye",
            label: t("guild.lina.options.goodbye"),
            onSelect: collapseDialogue,
          },
        ];

  const linaDialogue = (
    <LinaDialogue
      speaker={
        isDesktop ? t("guild.lina.namePlate") : t("guild.lina.namePlateShort")
      }
      segments={getLinaLine(lina, t)}
      options={linaOptions}
      variant={isDesktop ? "desktop" : "mobile"}
      startDelayMs={400}
      onTypingChange={setIsTalking}
      collapsed={dialogueCollapsed}
      onExpand={() => setDialogueCollapsed(false)}
    />
  );

  const header = (
    <GuildHeader
      license={license}
      nextRefreshAt={nextRefreshAt}
      variant={isDesktop ? "desktop" : "mobile"}
    />
  );

  const tabs = (
    <div ref={tabsRef}>
      <GuildTabs
        counts={counts}
        activeTab={activeTab}
        onChange={setActiveTab}
        nextRefreshAt={nextRefreshAt}
        bountiesCount={activeBountiesCount}
        bountyReady={
          lina.trigger === LinaReceptionDto.trigger.COMMUNITY_BOUNTY_READY
        }
        mobile={!isDesktop}
        boardTabRef={boardTabRef}
      />
    </div>
  );

  const tabContent =
    activeTab === "board" ? (
      <GuildBoard
        quick={quick}
        hiddenQuestIds={hiddenQuestIds}
        activeContractsCount={activeContracts.length}
        maxActiveContracts={maxActiveContracts}
        onHideQuest={hideQuest}
        onRestoreHiddenQuests={() => setHiddenQuestIds(new Set())}
        onQuickChange={setQuick}
        onViewContracts={showAcceptedTab}
      />
    ) : activeTab === "arcs" ? (
      <GuildChains onShowAccepted={showAcceptedTab} />
    ) : activeTab === "bounties" ? (
      <GuildBounties initialBountyId={initialBountyId} />
    ) : activeTab === "emporium" ? (
      <GuildEmporium />
    ) : (
      <GuildContractList tab={activeTab} />
    );

  const tabPanel = (
    <div
      role="tabpanel"
      id={getGuildTabPanelId(activeTab)}
      aria-labelledby={getGuildTabId(activeTab)}
    >
      {tabContent}
    </div>
  );

  if (!isDesktop) {
    return (
      <div className={cn(styles.hall, className)}>
        {header}
        <GuildScene
          variant="mobile"
          pose={pose}
          isTalking={isTalking}
          showAlert={showAlert}
          decorKeys={license.equippedDecorKeys}
        />
        <div className={styles.mobileContent}>
          {linaDialogue}
          <GuildActiveContracts
            contracts={activeContracts}
            yearGoal={yearGoal}
            maxActiveContracts={maxActiveContracts}
            onManageContracts={showAcceptedTab}
          />
          {tabs}
          {tabPanel}
          <GuildLicenseCard license={license} />
          <GuildPassportCard />
          <GuildRewardsPanel />
        </div>
      </div>
    );
  }

  return (
    <div className={cn(styles.hall, className)}>
      {header}
      <GuildScene
        variant="desktop"
        pose={pose}
        isTalking={isTalking}
        showAlert={showAlert}
        decorKeys={license.equippedDecorKeys}
        dialogue={linaDialogue}
      />
      <div className={styles.content}>
        <aside className={styles.sidebar}>
          <GuildLicenseCard license={license} />
          <GuildPassportCard />
          <GuildRewardsPanel />
        </aside>
        <div className={styles.boardColumn}>
          {/* Active contracts lead the board column (as on mobile) instead of
              closing the 340 px sidebar: the sidebar was ~2000 px tall next to a
              ~490 px board, so the contracts sat far below the fold. */}
          <GuildActiveContracts
            contracts={activeContracts}
            yearGoal={yearGoal}
            maxActiveContracts={maxActiveContracts}
            onManageContracts={showAcceptedTab}
          />
          {tabs}
          {tabPanel}
        </div>
      </div>
    </div>
  );
}
