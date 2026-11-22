import { useRef, useState } from "react";
import { useMediaQuery } from "@mantine/hooks";
import { GuildContractDto } from "@repo/wrapper/server";
import { useTranslation } from "@repo/locales";
import { cn, getErrorMessage } from "#@/util";

import styles from "../guild.module.css";
import { useGuildOverview } from "../hooks/useGuildOverview";
import { useMarkGuildBoardSeen } from "../hooks/useMarkGuildBoardSeen";
import { GuildScene } from "../scene/GuildScene";
import { LinaDialogue } from "../scene/LinaDialogue";
import { getLinaLine } from "../util/getLinaLine";
import { GuildActiveContracts } from "./GuildActiveContracts";
import { GuildBoard } from "./GuildBoard";
import { GuildContractList } from "./GuildContractList";
import { GuildHallSkeleton } from "./GuildHallSkeleton";
import { GuildHeader } from "./GuildHeader";
import { GuildLicenseCard } from "./GuildLicenseCard";
import { GuildRewardsPanel } from "./GuildRewardsPanel";
import { GuildTabs, type GuildTab } from "./GuildTabs";

export interface GuildHallProps {
  initialTab?: GuildTab;
  className?: string;
}

/**
 * The Guild Hall (design D6). At `md` and above it renders the desktop frame
 * (scene with the dialogue overlaid, 340 px sidebar, two-column cork board);
 * below it renders the compact mobile frame (dialogue below the scene, active
 * contracts and License stacked, single-column board).
 */
export function GuildHall({ initialTab = "board", className }: GuildHallProps) {
  const { t } = useTranslation();
  const isDesktop = useMediaQuery("(min-width: 48em)", true);
  const overview = useGuildOverview();
  const markBoardSeen = useMarkGuildBoardSeen();

  const [activeTab, setActiveTab] = useState<GuildTab>(initialTab);
  const [quick, setQuick] = useState(false);
  const [dialogueCollapsed, setDialogueCollapsed] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  const [hiddenQuestIds, setHiddenQuestIds] = useState<Set<string>>(
    () => new Set(),
  );

  const tabsRef = useRef<HTMLDivElement>(null);
  const boardTabRef = useRef<HTMLButtonElement>(null);
  const hasMarkedSeen = useRef(false);

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

  const showQuickBoard = () => {
    setActiveTab("board");
    setQuick(true);
    setDialogueCollapsed(false);
    scrollToTabs();
  };

  const collapseDialogue = () => {
    setIsTalking(false);
    setDialogueCollapsed(true);
  };

  const showAcceptedTab = () => {
    setActiveTab("accepted");
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
        <p className={styles.hallMessage} role="alert">
          {getErrorMessage(overview.error)}
        </p>
      </div>
    );
  }

  const { license, activeContracts, yearGoal, counts, nextRefreshAt, lina } =
    overview.data;
  const hasReadyContract = activeContracts.some(
    (contract) => contract.status === GuildContractDto.status.READY_TO_CLAIM,
  );
  const pose = lina.pose === "happy" || hasReadyContract ? "happy" : "neutral";
  const showAlert = lina.hasUnseenBoard;

  const linaDialogue = (
    <LinaDialogue
      speaker={
        isDesktop ? t("guild.lina.namePlate") : t("guild.lina.namePlateShort")
      }
      segments={getLinaLine(lina, t)}
      options={[
        {
          id: "board",
          label: t("guild.lina.options.board"),
          onSelect: focusBoard,
        },
        {
          id: "quick",
          label: t("guild.lina.options.quick"),
          onSelect: showQuickBoard,
        },
        {
          id: "goodbye",
          label: t("guild.lina.options.goodbye"),
          onSelect: collapseDialogue,
        },
      ]}
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
        mobile={!isDesktop}
        boardTabRef={boardTabRef}
      />
    </div>
  );

  const board =
    activeTab === "board" ? (
      <GuildBoard
        quick={quick}
        hiddenQuestIds={hiddenQuestIds}
        onHideQuest={hideQuest}
        onQuickChange={setQuick}
        onViewContracts={showAcceptedTab}
      />
    ) : (
      <GuildContractList tab={activeTab} />
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
        />
        <div className={styles.mobileContent}>
          {linaDialogue}
          <GuildActiveContracts
            contracts={activeContracts}
            yearGoal={yearGoal}
          />
          <GuildLicenseCard license={license} />
          <GuildRewardsPanel />
          {tabs}
          {board}
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
        dialogue={linaDialogue}
      />
      <div className={styles.content}>
        <aside className={styles.sidebar}>
          <GuildLicenseCard license={license} />
          <GuildRewardsPanel />
          <GuildActiveContracts
            contracts={activeContracts}
            yearGoal={yearGoal}
          />
        </aside>
        <div className={styles.boardColumn}>
          {tabs}
          {board}
        </div>
      </div>
    </div>
  );
}
