import { type KeyboardEvent, useRef, useState } from "react";
import type { TFunction } from "i18next";
import type {
  GuildBoardCandidateGameDto,
  GuildBoardQuestDto,
} from "@repo/wrapper/server";
import { useTranslation } from "@repo/locales";
import { cn, Modal } from "#@/util";

import styles from "../guild.module.css";
import { GameChip } from "../scene/GameChip";
import { PixelButton } from "../scene/PixelButton";

export interface GuildTargetGamePickerProps {
  opened: boolean;
  /** Quest being accepted; `null` while the modal is closed. */
  quest: GuildBoardQuestDto | null;
  /** Accept mutation in flight. */
  pending?: boolean;
  onClose: () => void;
  onConfirm: (targetGameId: number) => void;
}

function getCandidateMeta(
  game: GuildBoardCandidateGameDto,
  t: TFunction,
): string | undefined {
  if (game.sinceYear !== undefined && game.sinceYear !== null) {
    return t("guild.board.chips.since", { year: game.sinceYear });
  }

  if (game.estimatedHours !== undefined && game.estimatedHours !== null) {
    return t("guild.board.chips.hours", { hours: game.estimatedHours });
  }

  return undefined;
}

/**
 * Target-game picker for quests with `requiresTargetGame` (design D9b): one of
 * the server's candidate games, first preselected, then the accept action.
 */
export function GuildTargetGamePicker({
  opened,
  quest,
  pending = false,
  onClose,
  onConfirm,
}: GuildTargetGamePickerProps) {
  const { t } = useTranslation();
  const candidates = quest?.candidateGames ?? [];
  const [selectedGameId, setSelectedGameId] = useState<number | null>(
    candidates[0]?.gameId ?? null,
  );
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const hasSelected =
    selectedGameId !== null &&
    candidates.some((game) => game.gameId === selectedGameId);

  const handleOptionKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (candidates.length === 0) return;

    let nextIndex: number | null = null;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      nextIndex = (index + 1) % candidates.length;
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      nextIndex = (index - 1 + candidates.length) % candidates.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = candidates.length - 1;
    }

    if (nextIndex === null) return;

    const nextCandidate = candidates[nextIndex];
    if (!nextCandidate) return;

    event.preventDefault();
    setSelectedGameId(nextCandidate.gameId);
    optionRefs.current[nextIndex]?.focus();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t("guild.targetGame.title")}
      centered
      size="md"
    >
      <div className={styles.targetPicker}>
        <p className={cn(styles.bodyText, styles.targetBody)}>
          {t("guild.targetGame.body")}
        </p>

        <div
          className={styles.targetOptions}
          role="radiogroup"
          aria-label={t("guild.targetGame.title")}
        >
          {candidates.map((game, index) => {
            const selected = selectedGameId === game.gameId;
            const focusable = hasSelected ? selected : index === 0;

            return (
              <button
                key={game.gameId}
                ref={(node) => {
                  optionRefs.current[index] = node;
                }}
                type="button"
                role="radio"
                tabIndex={focusable ? 0 : -1}
                aria-checked={selected}
                data-game-id={game.gameId}
                className={cn(
                  styles.targetOption,
                  selected && styles.targetOptionActive,
                )}
                onClick={() => setSelectedGameId(game.gameId)}
                onKeyDown={(event) => handleOptionKeyDown(event, index)}
              >
                <span className={styles.targetOptionMain}>
                  <span className={styles.targetRadio} aria-hidden />
                  <GameChip
                    gameId={game.gameId}
                    name={game.name || `#${game.gameId}`}
                    coverUrl={game.coverUrl}
                    meta={getCandidateMeta(game, t)}
                    linked={false}
                  />
                </span>
              </button>
            );
          })}
        </div>

        <div className={styles.targetActions}>
          <PixelButton variant="ghost-dark" size="sm" onClick={onClose}>
            {t("guild.targetGame.cancel")}
          </PixelButton>
          <PixelButton
            size="sm"
            disabled={pending || selectedGameId === null}
            onClick={() => {
              if (selectedGameId !== null) onConfirm(selectedGameId);
            }}
          >
            {t("guild.targetGame.confirm")}
          </PixelButton>
        </div>
      </div>
    </Modal>
  );
}
