import { useState } from "react";
import type {
  AcceptGuildContractResponseDto,
  GuildBoardQuestDto,
} from "@repo/wrapper/server";
import { useI18nContext, useTranslation } from "@repo/locales";
import { cn, Modal } from "#@/util";

import styles from "../guild.module.css";
import expansionStyles from "./GuildBoardExpansion.module.css";
import { useAcceptGuildContract } from "../hooks/useAcceptGuildContract";
import { useGuildBoard } from "../hooks/useGuildBoard";
import { useGuildOverview } from "../hooks/useGuildOverview";
import { useRerollGuildBoardEntry } from "../hooks/useRerollGuildBoardEntry";
import { CategoryTag } from "../scene/CategoryTag";
import { GuildIcon } from "../scene/GuildIcon";
import { PixelButton } from "../scene/PixelButton";
import { getQuestCopy } from "../util/getQuestCopy";
import { GuildAcceptedState } from "./GuildAcceptedState";
import { GuildQueryError } from "./GuildQueryError";
import { GuildQuestCard } from "./GuildQuestCard";
import { GuildTargetGamePicker } from "./GuildTargetGamePicker";

export interface GuildBoardProps {
  /** Lina's "Any quicker quest?" mode (`GET /v1/guild/board?quick=true`). */
  quick: boolean;
  /** Quest keys hidden by "Not now" for the rest of the session view. */
  hiddenQuestIds: ReadonlySet<string>;
  activeContractsCount?: number;
  maxActiveContracts?: number;
  onHideQuest: (questId: string) => void;
  onRestoreHiddenQuests?: () => void;
  onQuickChange: (quick: boolean) => void;
  /** Switches the hall to the Accepted tab after an accepted contract. */
  onViewContracts: () => void;
  className?: string;
}

export function getGuildQuestKey(quest: GuildBoardQuestDto): string {
  return (
    quest.boardEntryId ??
    quest.eventId ??
    quest.slug ??
    `${quest.templateKey ?? "quest"}-${quest.rank}-${quest.xpReward}`
  );
}

function isMonthlyQuest(quest: GuildBoardQuestDto): boolean {
  return quest.cycle === "monthly" || quest.category === "monthly";
}

/** Weekly board entries only; events, monthly expeditions and quick mode never reroll. */
function isRerollableQuest(
  quest: GuildBoardQuestDto,
  quick: boolean,
  rerollsRemaining: number,
  rerollChartersOwned: number,
): boolean {
  return (
    !quick &&
    quest.cycle === "weekly" &&
    quest.sourceType === "board_entry" &&
    !!quest.boardEntryId &&
    rerollsRemaining + rerollChartersOwned > 0
  );
}

/**
 * Cork board with the weekly quest cards (design D6). The grid is keyed by a
 * signature of the data, so the staggered entrance replays whenever the board
 * content changes. Monthly Expeditions sit first, a locked Rank E board gets
 * the teaser of the next expedition, and every open weekly entry can be
 * rerolled while free rerolls or charters remain. Accepting a quest that
 * requires a target opens the picker; success opens the "Contract accepted"
 * state from the mutation response.
 */
export function GuildBoard({
  quick,
  hiddenQuestIds,
  activeContractsCount,
  maxActiveContracts,
  onHideQuest,
  onRestoreHiddenQuests,
  onQuickChange,
  onViewContracts,
  className,
}: GuildBoardProps) {
  const { t } = useTranslation();
  const { language } = useI18nContext();
  const board = useGuildBoard(quick);
  const overview = useGuildOverview();
  const accept = useAcceptGuildContract();
  const reroll = useRerollGuildBoardEntry();
  const [pickerQuest, setPickerQuest] = useState<GuildBoardQuestDto | null>(
    null,
  );
  const [acceptedResponse, setAcceptedResponse] =
    useState<AcceptGuildContractResponseDto | null>(null);
  const [rerollConfirmQuest, setRerollConfirmQuest] =
    useState<GuildBoardQuestDto | null>(null);
  const [revisions, setRevisions] = useState<Record<string, number>>({});

  const atContractCap =
    typeof activeContractsCount === "number" &&
    typeof maxActiveContracts === "number" &&
    activeContractsCount >= maxActiveContracts;

  const submitAccept = (quest: GuildBoardQuestDto, targetGameId?: number) => {
    if (atContractCap) return;

    // Multi-game quests (`targetCount > 1`, e.g. `double_feature`) can never be
    // bound to a single target game, even if the caller passes one.
    const targetGameIdForBody =
      quest.targetCount > 1 ? undefined : targetGameId;

    accept.mutate(
      {
        ...(quest.boardEntryId ? { boardEntryId: quest.boardEntryId } : {}),
        ...(quest.eventId ? { eventId: quest.eventId } : {}),
        ...(targetGameIdForBody !== undefined
          ? { targetGameId: targetGameIdForBody }
          : {}),
      },
      {
        onSuccess: (response) => {
          setPickerQuest(null);
          setAcceptedResponse(response);
        },
      },
    );
  };

  const handleAccept = (quest: GuildBoardQuestDto) => {
    if (atContractCap) return;

    if (
      quest.requiresTargetGame &&
      quest.targetCount <= 1 &&
      quest.candidateGames.length > 0
    ) {
      setPickerQuest(quest);
      return;
    }

    submitAccept(quest);
  };

  const rerollsRemaining = board.data?.rerollsRemaining ?? 0;
  const rerollChartersOwned = board.data?.rerollChartersOwned ?? 0;

  const executeReroll = (boardEntryId: string, onDone?: () => void) => {
    reroll.mutate(
      { boardEntryId },
      {
        onSuccess: () => {
          setRevisions((previous) => ({
            ...previous,
            [boardEntryId]: (previous[boardEntryId] ?? 0) + 1,
          }));
          onDone?.();
        },
      },
    );
  };

  const handleReroll = (quest: GuildBoardQuestDto) => {
    if (!quest.boardEntryId) return;

    if (rerollsRemaining === 0 && rerollChartersOwned > 0) {
      setRerollConfirmQuest(quest);
      return;
    }

    executeReroll(quest.boardEntryId);
  };

  const rerollLabel =
    rerollsRemaining > 0
      ? t("guild.board.reroll.free", { count: rerollsRemaining })
      : t("guild.board.reroll.charter");
  const rerollingQuestId = reroll.isPending
    ? reroll.variables?.boardEntryId
    : undefined;

  const allQuests = board.data?.quests ?? [];
  const hiddenCount = hiddenQuestIds.size;
  const quests = allQuests.filter(
    (quest) => !hiddenQuestIds.has(getGuildQuestKey(quest)),
  );
  if (!quick) {
    // Monthly Expeditions always sit first; Array.prototype.sort is stable.
    quests.sort(
      (left, right) =>
        Number(isMonthlyQuest(right)) - Number(isMonthlyQuest(left)),
    );
  }

  const showLockedTeaser =
    !quick && board.data?.monthlyExpeditionLocked === true;
  const rank = overview.data?.license.rank;
  const showRerollStatus =
    !quick &&
    !!board.data &&
    (rerollsRemaining + rerollChartersOwned > 0 ||
      (rank != null && rank !== "E"));

  // The toolbar joins two counts that pluralize independently, so each one is
  // translated on its own and `rerollsStatus` only interpolates both fragments.
  const freeRerollsStatus = t("guild.board.rerollsStatusFree", {
    count: rerollsRemaining,
  });
  const chartersStatus = t("guild.board.rerollsStatusCharters", {
    count: rerollChartersOwned,
  });

  const allLocallyHidden =
    allQuests.length > 0 && quests.length === 0 && !showLockedTeaser;

  return (
    <section className={cn(styles.boardSection, className)}>
      {quick ? (
        <div className={styles.quickBar}>
          <span className={cn(styles.pixelLabel, styles.quickTitle)}>
            {t("guild.board.quickTitle")}
          </span>
          <PixelButton
            variant="ghost-dark"
            size="sm"
            onClick={() => onQuickChange(false)}
          >
            {t("guild.board.backToFull")}
          </PixelButton>
        </div>
      ) : null}

      {board.data ? (
        <div className={expansionStyles.rerollToolbar}>
          {showRerollStatus ? (
            <span
              className={cn(styles.captionText, expansionStyles.rerollStatus)}
            >
              <GuildIcon name="reroll-charter" size={14} />
              {t("guild.board.rerollsStatus", {
                free: freeRerollsStatus,
                charters: chartersStatus,
              })}
            </span>
          ) : null}
          <div className={expansionStyles.toolbarActions}>
            <PixelButton
              variant="ghost-dark"
              size="sm"
              aria-pressed={quick}
              onClick={() => onQuickChange?.(!quick)}
            >
              {t("guild.board.quickToggle")}
            </PixelButton>
            {hiddenCount > 0 ? (
              <PixelButton
                variant="ghost-dark"
                size="sm"
                onClick={() => onRestoreHiddenQuests?.()}
              >
                {t("guild.board.showHidden", { count: hiddenCount })}
              </PixelButton>
            ) : null}
          </div>
        </div>
      ) : null}

      {atContractCap && board.data ? (
        <div className={expansionStyles.capBanner} role="status">
          {t("guild.board.capReached", {
            active: activeContractsCount,
            max: maxActiveContracts,
          })}
        </div>
      ) : null}

      {board.isPending && !board.data ? (
        <div className={styles.board} aria-busy="true" data-gn-artwork="">
          <span className={cn(styles.skeletonBlock, styles.skeletonCard)} />
          <span className={cn(styles.skeletonBlock, styles.skeletonCard)} />
        </div>
      ) : board.isError && !board.data ? (
        <GuildQueryError
          error={board.error}
          onRetry={() => {
            void board.refetch();
          }}
          isRetrying={board.isFetching}
        />
      ) : allLocallyHidden ? (
        <div className={styles.boardEmpty}>
          <p className={expansionStyles.allHiddenText}>
            {t("guild.board.allHidden")}
          </p>
          <PixelButton
            variant="ghost-dark"
            size="sm"
            onClick={() => onRestoreHiddenQuests?.()}
          >
            {t("guild.board.showHidden", { count: hiddenCount })}
          </PixelButton>
        </div>
      ) : quests.length === 0 && !showLockedTeaser ? (
        <p className={styles.boardEmpty}>
          {quick ? t("guild.board.quickEmpty") : t("guild.board.empty")}
        </p>
      ) : (
        <div
          className={styles.board}
          data-gn-artwork=""
          data-board-grid="true"
        >
          {showLockedTeaser ? (
            <div
              className={cn(styles.boardCardWrap, expansionStyles.fullWidth)}
              data-monthly-locked="true"
            >
              <div className={expansionStyles.lockedTeaser} role="note">
                <CategoryTag category="monthly">
                  {t("guild.board.tags.monthly")}
                </CategoryTag>
                <h3
                  className={cn(
                    styles.pixelCardTitle,
                    expansionStyles.lockedTitle,
                  )}
                >
                  {t("guild.board.monthly.title")}
                </h3>
                <p className={expansionStyles.lockedHint}>
                  {t("guild.board.monthly.locked")}
                </p>
              </div>
            </div>
          ) : null}

          {quests.map((quest, index) => {
            const monthly = isMonthlyQuest(quest);
            const questKey = getGuildQuestKey(quest);
            const revision = quest.boardEntryId
              ? (revisions[quest.boardEntryId] ?? 0)
              : 0;

            return (
              <div
                key={`${questKey}-${revision}`}
                className={cn(
                  styles.boardCardWrap,
                  monthly && expansionStyles.fullWidth,
                )}
                data-monthly={monthly ? "true" : undefined}
              >
                <GuildQuestCard
                  quest={quest}
                  index={index}
                  accepting={accept.isPending}
                  atCap={atContractCap}
                  onAccept={handleAccept}
                  onNotNow={(hiddenQuest) =>
                    onHideQuest(getGuildQuestKey(hiddenQuest))
                  }
                  onReroll={
                    isRerollableQuest(
                      quest,
                      quick,
                      rerollsRemaining,
                      rerollChartersOwned,
                    )
                      ? handleReroll
                      : undefined
                  }
                  rerollLabel={rerollLabel}
                  rerolling={
                    rerollingQuestId !== undefined &&
                    rerollingQuestId === quest.boardEntryId
                  }
                />
              </div>
            );
          })}
        </div>
      )}

      <GuildTargetGamePicker
        key={
          pickerQuest ? getGuildQuestKey(pickerQuest) : "guild-target-picker"
        }
        opened={pickerQuest !== null}
        quest={pickerQuest}
        pending={accept.isPending}
        onClose={() => setPickerQuest(null)}
        onConfirm={(targetGameId) => {
          if (pickerQuest) submitAccept(pickerQuest, targetGameId);
        }}
      />

      <Modal
        opened={rerollConfirmQuest !== null}
        onClose={() => {
          if (!reroll.isPending) setRerollConfirmQuest(null);
        }}
        title={t("guild.board.reroll.charterConfirmTitle")}
        centered
        size="sm"
      >
        {rerollConfirmQuest ? (
          <div className={styles.targetPicker}>
            <p className={styles.contractModalText}>
              {t("guild.board.reroll.charterConfirmBody", {
                count: Math.max(0, rerollChartersOwned - 1),
                title: getQuestCopy(rerollConfirmQuest, t, language).title,
              })}
            </p>
            <div className={styles.contractModalActions}>
              <PixelButton
                variant="ghost-dark"
                size="sm"
                disabled={reroll.isPending}
                onClick={() => setRerollConfirmQuest(null)}
              >
                {t("guild.contracts.abandon.cancel")}
              </PixelButton>
              <PixelButton
                size="sm"
                disabled={reroll.isPending}
                onClick={() => {
                  if (!rerollConfirmQuest.boardEntryId) return;
                  executeReroll(rerollConfirmQuest.boardEntryId, () => {
                    setRerollConfirmQuest(null);
                  });
                }}
              >
                {t("guild.board.reroll.charterConfirmAction")}
              </PixelButton>
            </div>
          </div>
        ) : null}
      </Modal>

      {acceptedResponse ? (
        <GuildAcceptedState
          opened
          contract={acceptedResponse.contract}
          lina={acceptedResponse.lina}
          onClose={() => setAcceptedResponse(null)}
          onViewContracts={() => {
            setAcceptedResponse(null);
            onViewContracts();
          }}
        />
      ) : null}
    </section>
  );
}
