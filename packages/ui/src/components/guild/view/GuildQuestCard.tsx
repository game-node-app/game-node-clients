import type { CSSProperties } from "react";
import type { TFunction } from "i18next";
import type {
  GuildBoardCandidateGameDto,
  GuildBoardQuestDto,
} from "@repo/wrapper/server";
import { useI18nContext, useTranslation } from "@repo/locales";
import { cn } from "#@/util/cn";

import styles from "../guild.module.css";
import { CategoryTag } from "../scene/CategoryTag";
import { GameChip } from "../scene/GameChip";
import { GuildIcon } from "../scene/GuildIcon";
import { PixelButton } from "../scene/PixelButton";
import { RankStamp } from "../scene/RankStamp";
import type { GuildAssetName } from "../scene/assets";
import { formatGuildXp } from "../util/getRankProgress";
import { getQuestCopy } from "../util/getQuestCopy";
import { getRewardLabel } from "../util/getRewardLabel";

export interface GuildQuestCardProps {
  quest: GuildBoardQuestDto;
  /** Board position, used by the staggered card entrance (index * 60 ms). */
  index: number;
  onAccept: (quest: GuildBoardQuestDto) => void;
  onNotNow: (quest: GuildBoardQuestDto) => void;
  accepting?: boolean;
  className?: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Quest icon by category/template (design D4). */
function getQuestIcon(quest: GuildBoardQuestDto): GuildAssetName {
  if (quest.templateKey === "deep_dive") return "book";

  switch (quest.category) {
    case "library":
      return "book";
    case "event":
      return "hourglass";
    case "weekly":
      return "trophy";
    case "gamenode":
      return "quill";
    default:
      return "scroll";
  }
}

function getEventDaysLeft(expiresAt: string): number {
  const expiresAtMs = new Date(expiresAt).getTime();
  if (Number.isNaN(expiresAtMs)) return 0;

  return Math.max(0, Math.ceil((expiresAtMs - Date.now()) / DAY_MS));
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
 * Parchment quest card (design D6): category tag, icon tile, localized title
 * and description, rank stamp, candidate game chips, XP/reward footer and the
 * "Not now" / "Accept" actions. Recommended cards add the brand border, the
 * highlighted pin and Lina's seal.
 */
export function GuildQuestCard({
  quest,
  index,
  onAccept,
  onNotNow,
  accepting = false,
  className,
}: GuildQuestCardProps) {
  const { t } = useTranslation();
  const { language } = useI18nContext();
  const copy = getQuestCopy(quest, t, language);
  const rewardLabel = getRewardLabel(quest.reward, t);
  const icon = getQuestIcon(quest);
  const iconElement = <GuildIcon name={icon} size={32} />;

  const tagLabel =
    quest.category === "event"
      ? t("guild.board.tags.event", { days: getEventDaysLeft(quest.expiresAt) })
      : quest.category === "weekly"
        ? t("guild.board.tags.weekly")
        : quest.category === "gamenode"
          ? t("guild.board.tags.gamenode")
          : t("guild.board.tags.library");

  return (
    <article
      className={cn(
        styles.questCard,
        styles.animCardEnter,
        quest.isRecommended && styles.questCardRecommended,
        className,
      )}
      data-quest-id={quest.boardEntryId ?? quest.eventId ?? undefined}
      data-recommended={quest.isRecommended ? "true" : undefined}
      style={
        {
          "--guild-enter-delay": `${index * 60}ms`,
        } as CSSProperties
      }
    >
      <span className={styles.questPin} aria-hidden>
        <GuildIcon
          name={quest.isRecommended ? "pin-highlight" : "pin"}
          size={12}
        />
      </span>
      {quest.isRecommended ? (
        <span className={cn(styles.pixelLabel, styles.questSeal)}>
          {t("guild.board.recommended")}
        </span>
      ) : null}

      <div className={styles.questHeader}>
        <span className={styles.questIcon}>{iconElement}</span>
        <div className={styles.questHeading}>
          <CategoryTag category={quest.category}>{tagLabel}</CategoryTag>
          <h3 className={cn(styles.pixelCardTitle, styles.questTitle)}>
            {copy.title}
          </h3>
        </div>
        <RankStamp rank={quest.rank} />
      </div>

      {copy.description ? (
        <p className={cn(styles.bodyText, styles.questDescription)}>
          {copy.description}
        </p>
      ) : null}

      {quest.candidateGames.length > 0 ? (
        <div className={styles.questChips}>
          {quest.candidateGames.slice(0, 3).map((game, gameIndex) => (
            <GameChip
              key={game.gameId}
              gameId={game.gameId}
              name={game.name || `#${game.gameId}`}
              coverUrl={game.coverUrl}
              meta={
                getCandidateMeta(game, t) ??
                (gameIndex === 0 && quest.meta?.sinceYear != null
                  ? t("guild.board.chips.since", {
                      year: quest.meta.sinceYear,
                    })
                  : undefined)
              }
            />
          ))}
        </div>
      ) : null}

      <div className={styles.questFooter}>
        <div className={styles.questRewards}>
          <span className={cn(styles.pixelLabel, styles.questXp)}>
            <GuildIcon name="coin" size={20} />
            {t("guild.board.xpReward", {
              xp: formatGuildXp(quest.xpReward, language),
            })}
          </span>
          {rewardLabel ? (
            <span className={cn(styles.captionText, styles.questRewardLabel)}>
              {rewardLabel}
            </span>
          ) : null}
        </div>
        <div className={styles.questActions}>
          <PixelButton
            variant="ghost"
            size="sm"
            onClick={() => onNotNow(quest)}
          >
            {t("guild.actions.notNow")}
          </PixelButton>
          <PixelButton
            size="sm"
            disabled={accepting}
            onClick={() => onAccept(quest)}
          >
            {t("guild.actions.accept")}
          </PixelButton>
        </div>
      </div>
    </article>
  );
}
