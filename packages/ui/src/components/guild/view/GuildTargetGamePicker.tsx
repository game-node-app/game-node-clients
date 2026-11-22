import { useState } from "react";
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
          {candidates.map((game) => {
            const selected = selectedGameId === game.gameId;

            return (
              <button
                key={game.gameId}
                type="button"
                role="radio"
                aria-checked={selected}
                data-game-id={game.gameId}
                className={cn(
                  styles.targetOption,
                  selected && styles.targetOptionActive,
                )}
                onClick={() => setSelectedGameId(game.gameId)}
              >
                <span className={styles.targetOptionMain}>
                  <span className={styles.targetRadio} aria-hidden />
                  <GameChip
                    gameId={game.gameId}
                    name={game.name || `#${game.gameId}`}
                    coverUrl={game.coverUrl}
                    meta={getCandidateMeta(game, t)}
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
