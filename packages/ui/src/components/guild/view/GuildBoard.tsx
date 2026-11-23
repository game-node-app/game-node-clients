import { useState } from "react";
import type {
  AcceptGuildContractResponseDto,
  GuildBoardQuestDto,
} from "@repo/wrapper/server";
import { useTranslation } from "@repo/locales";
import { cn, getErrorMessage } from "#@/util";

import styles from "../guild.module.css";
import { useAcceptGuildContract } from "../hooks/useAcceptGuildContract";
import { useGuildBoard } from "../hooks/useGuildBoard";
import { PixelButton } from "../scene/PixelButton";
import { GuildAcceptedState } from "./GuildAcceptedState";
import { GuildQuestCard } from "./GuildQuestCard";
import { GuildTargetGamePicker } from "./GuildTargetGamePicker";

export interface GuildBoardProps {
  /** Lina's "Any quicker quest?" mode (`GET /v1/guild/board?quick=true`). */
  quick: boolean;
  /** Quest keys hidden by "Not now" for the rest of the session view. */
  hiddenQuestIds: ReadonlySet<string>;
  onHideQuest: (questId: string) => void;
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

/**
 * Cork board with the weekly quest cards (design D6). The grid is keyed by a
 * signature of the data, so the staggered entrance replays whenever the board
 * content changes. Accepting a quest that requires a target opens the picker;
 * success opens the "Contract accepted" state from the mutation response.
 */
export function GuildBoard({
  quick,
  hiddenQuestIds,
  onHideQuest,
  onQuickChange,
  onViewContracts,
  className,
}: GuildBoardProps) {
  const { t } = useTranslation();
  const board = useGuildBoard(quick);
  const accept = useAcceptGuildContract();
  const [pickerQuest, setPickerQuest] = useState<GuildBoardQuestDto | null>(
    null,
  );
  const [acceptedResponse, setAcceptedResponse] =
    useState<AcceptGuildContractResponseDto | null>(null);

  const submitAccept = (quest: GuildBoardQuestDto, targetGameId?: number) => {
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

  const quests = (board.data?.quests ?? []).filter(
    (quest) => !hiddenQuestIds.has(getGuildQuestKey(quest)),
  );
  const renderKey = board.data
    ? [
        board.data.weekStart,
        quick ? "quick" : "full",
        ...board.data.quests.map(
          (quest) =>
            `${getGuildQuestKey(quest)}:${quest.isRecommended ? 1 : 0}:${quest.xpReward}:${quest.candidateGames
              .map((game) => game.gameId)
              .join(",")}`,
        ),
      ].join("|")
    : "empty";

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

      {board.isPending && !board.data ? (
        <div className={styles.board} aria-busy="true" data-gn-artwork="">
          <span className={cn(styles.skeletonBlock, styles.skeletonCard)} />
          <span className={cn(styles.skeletonBlock, styles.skeletonCard)} />
        </div>
      ) : board.isError && !board.data ? (
        <p className={styles.boardEmpty} role="alert">
          {getErrorMessage(board.error)}
        </p>
      ) : quests.length === 0 ? (
        <p className={styles.boardEmpty}>
          {quick ? t("guild.board.quickEmpty") : t("guild.board.empty")}
        </p>
      ) : (
        <div className={styles.board} key={renderKey} data-gn-artwork="">
          {quests.map((quest, index) => (
            <div key={getGuildQuestKey(quest)} className={styles.boardCardWrap}>
              <GuildQuestCard
                quest={quest}
                index={index}
                accepting={accept.isPending}
                onAccept={handleAccept}
                onNotNow={(hiddenQuest) =>
                  onHideQuest(getGuildQuestKey(hiddenQuest))
                }
              />
            </div>
          ))}
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
